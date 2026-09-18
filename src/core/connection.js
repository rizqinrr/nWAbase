import { mkdir } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createInterface } from 'node:readline/promises'

import { Boom } from '@hapi/boom'
import makeWASocket, {
  DisconnectReason,
  makeCacheableSignalKeyStore,
  useSqliteAuthState
} from '@rexxhayanasi/elaina-baileys'
import pino from 'pino'

const RECONNECT_BASE_DELAY_MS = 2000
const RECONNECT_MAX_DELAY_MS = 30000
const RECONNECT_MAX_ATTEMPT_STEP = 5

export { DisconnectReason }

export function statusCodeFromDisconnect(error) {
  return new Boom(error ?? undefined)?.output?.statusCode ?? 0
}

export function computeReconnectDelay(attempt, options = {}) {
  const base = options.baseMs ?? RECONNECT_BASE_DELAY_MS
  const max = options.maxMs ?? RECONNECT_MAX_DELAY_MS
  const step = Math.max(0, attempt)
  return Math.min(max, base * 2 ** Math.min(step, RECONNECT_MAX_ATTEMPT_STEP))
}

function createEngine(options) {
  return {
    makeWASocket,
    makeCacheableSignalKeyStore,
    useSqliteAuthState,
    ...options.engine
  }
}

function createDefaultLogger(options) {
  if (typeof options?.createLogger === 'function') return options.createLogger()
  return options?.logger ?? pino({ level: 'silent' })
}

function normalizePhoneNumber(value) {
  const number = String(value ?? '').replace(/[^0-9]/g, '')
  return /^[1-9]\d{5,14}$/.test(number) ? number : ''
}

export async function requestPairing(options = {}) {
  const settings = options.settings ?? {}
  if (!settings.usePairingCode || options.registered) return null

  const owners = Array.isArray(settings.owners) ? settings.owners : []
  const ownerNumber = owners.find((owner) => normalizePhoneNumber(owner))
  const askPhoneNumber = options.askPhoneNumber ?? (async (prompt) => {
    const readline = createInterface({ input: process.stdin, output: process.stdout })
    try {
      return await readline.question(prompt)
    } finally {
      readline.close()
    }
  })
  const rawNumber = ownerNumber ?? (await askPhoneNumber('Masukkan nomor WhatsApp untuk pairing: '))
  const phoneNumber = normalizePhoneNumber(rawNumber)
  if (!phoneNumber) throw new Error('A valid phone number is required for pairing')

  const customCode = String(settings.pairingCode ?? '').trim() || undefined
  if (!customCode) return options.sock.requestPairingCode(phoneNumber)

  try {
    return await options.sock.requestPairingCode(phoneNumber, customCode)
  } catch {
    return options.sock.requestPairingCode(phoneNumber)
  }
}

export function createReconnectController(options = {}) {
  const setTimer = options.setTimer ?? setTimeout
  const clearTimer = options.clearTimer ?? clearTimeout
  let timer = null
  let generation = 0
  let connecting = false
  let stopped = false
  let attempts = 0

  return {
    get attempts() {
      return attempts
    },
    schedule() {
      if (stopped) return { scheduled: false, reason: 'stopped' }
      if (timer) return { scheduled: false, reason: 'pending' }
      if (connecting) return { scheduled: false, reason: 'connecting' }
      attempts += 1
      const delay = computeReconnectDelay(attempts - 1, options)
      const scheduledGeneration = generation
      timer = setTimer(async () => {
        if (scheduledGeneration !== generation) return
        timer = null
        if (stopped || connecting) return
        connecting = true
        try {
          await options.connect?.()
        } finally {
          connecting = false
        }
      }, delay)
      return { scheduled: true, delay, attempt: attempts }
    },
    connected() {
      attempts = 0
      generation += 1
      if (timer) clearTimer(timer)
      timer = null
    },
    cancel() {
      stopped = true
      generation += 1
      if (timer) clearTimer(timer)
      timer = null
    }
  }
}

export function bindConnectionUpdates(options = {}) {
  const handler = async (update = {}) => {
    if (update.connection === 'open') {
      options.reconnect?.connected()
      await options.onOpen?.(update)
      return
    }
    if (update.connection !== 'close') return

    const statusCode = options.getStatusCode
      ? options.getStatusCode(update.lastDisconnect?.error)
      : statusCodeFromDisconnect(update.lastDisconnect?.error)
    if (statusCode === (options.loggedOutCode ?? DisconnectReason.loggedOut)) {
      options.reconnect?.cancel()
      await options.onLogout?.(update)
      return
    }
    options.reconnect?.schedule()
    await options.onClose?.(update, statusCode)
  }

  options.sock?.ev?.on('connection.update', handler)
  return () => options.sock?.ev?.off?.('connection.update', handler)
}

export function createShutdown(options = {}) {
  let closed = false

  const closeResource = async (close, name) => {
    try {
      await close?.()
    } catch (error) {
      try {
        options.onError?.(error, name)
      } catch {}
    }
  }

  const shutdown = async (signal) => {
    if (closed) return false
    closed = true
    try {
      await options.onSignal?.(signal)
    } catch (error) {
      try {
        options.onError?.(error, 'signal')
      } catch {}
    }
    await Promise.all([
      closeResource(options.closeSocket, 'socket'),
      closeResource(options.closeWatcher, 'watcher'),
      closeResource(options.closeReadline, 'readline'),
      closeResource(options.closeDatabase, 'database')
    ])
    return true
  }

  Object.defineProperty(shutdown, 'closed', { get: () => closed })
  return shutdown
}

export function installProcessErrorHandlers(options = {}) {
  const processLike = options.processLike ?? process
  const logger = options.logger ?? console
  const log = (type) => logger.error({
    type,
    message: 'Unexpected process error'
  })
  const onException = () => log('uncaughtException')
  const onRejection = () => log('unhandledRejection')

  processLike.on('uncaughtException', onException)
  processLike.on('unhandledRejection', onRejection)
  return () => {
    processLike.off?.('uncaughtException', onException)
    processLike.off?.('unhandledRejection', onRejection)
  }
}

export function installShutdownHandlers(options = {}) {
  const processLike = options.processLike ?? process
  const handlers = ['SIGINT', 'SIGTERM'].map((signal) => ({
    signal,
    handler: () => options.shutdown?.(signal)
  }))

  handlers.forEach(({ signal, handler }) => processLike.on(signal, handler))
  return () => handlers.forEach(({ signal, handler }) => processLike.off?.(signal, handler))
}

export async function createWhatsAppSocket(options = {}) {
  const settings = options.settings ?? {}
  const engine = createEngine(options)
  const ensureDirectory =
    options.ensureDirectory ??
    (async (directory) => {
      await mkdir(directory, { recursive: true })
    })

  const sessionDbPath = settings.sessionDbPath
  if (typeof sessionDbPath !== 'string' || !sessionDbPath.trim()) {
    throw new Error('sessionDbPath must be a non-empty string')
  }

  await ensureDirectory(dirname(sessionDbPath))

  const logger = createDefaultLogger(options)
  const auth = await engine.useSqliteAuthState({
    dbPath: sessionDbPath
  })
  const { state, saveCreds } = auth

  const sock = engine.makeWASocket({
    auth: {
      creds: state.creds,
      keys: engine.makeCacheableSignalKeyStore(state.keys, logger)
    },
    logger,
    printQRInTerminal: !settings.usePairingCode,
    browser: ['Ubuntu', 'Chrome', '20.0.04'],
    markOnlineOnConnect: false,
    generateHighQualityLinkPreview: true,
    syncFullHistory: false
  })

  sock.ev.on('creds.update', saveCreds)

  return { sock, auth }
}
