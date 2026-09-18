import assert from 'node:assert/strict'
import test from 'node:test'

import { createWhatsAppSocket } from '../src/core/connection.js'

function createFakeEngine() {
  const handlers = new Map()
  const calls = {}
  const auth = {
    state: { creds: { registered: true }, keys: { id: 'keys' } },
    saveCreds() {},
    close() {}
  }
  const socket = {
    ev: {
      on(event, handler) {
        handlers.set(event, handler)
      }
    }
  }

  return {
    calls,
    handlers,
    auth,
    socket,
    engine: {
      async useSqliteAuthState(options) {
        calls.auth = options
        return auth
      },
      makeCacheableSignalKeyStore(keys, logger) {
        calls.keyStore = { keys, logger }
        return { cached: keys }
      },
      makeWASocket(options) {
        calls.socket = options
        return socket
      }
    }
  }
}

function createLoggerStub() {
  return { info() {}, warn() {}, error() {} }
}

test('creates an Elaina socket with SQLite auth, Pino logger, and credential persistence', async () => {
  const fake = createFakeEngine()
  const logger = createLoggerStub()
  const directories = []

  const result = await createWhatsAppSocket({
    settings: {
      sessionDbPath: 'store/session.db',
      usePairingCode: true,
      pairingCode: '',
      owners: []
    },
    engine: fake.engine,
    createLogger: () => logger,
    ensureDirectory: async (directory) => directories.push(directory)
  })

  assert.deepEqual(directories, ['store'])
  assert.deepEqual(fake.calls.auth, { dbPath: 'store/session.db' })
  assert.deepEqual(fake.calls.keyStore, { keys: fake.auth.state.keys, logger })
  assert.equal(fake.calls.socket.auth.creds, fake.auth.state.creds)
  assert.deepEqual(fake.calls.socket.auth.keys, { cached: fake.auth.state.keys })
  assert.equal(fake.calls.socket.printQRInTerminal, false)
  assert.equal(fake.handlers.get('creds.update'), fake.auth.saveCreds)
  assert.equal(result.sock, fake.socket)
  assert.equal(result.auth, fake.auth)
})

test('uses a silent logger by default', async () => {
  const fake = createFakeEngine()

  await createWhatsAppSocket({
    settings: { sessionDbPath: 'session.db', usePairingCode: true },
    engine: fake.engine,
    ensureDirectory: async () => {}
  })

  assert.equal(fake.calls.socket.logger.level, 'silent')
})

test('enables terminal QR when pairing code mode is disabled', async () => {
  const fake = createFakeEngine()

  await createWhatsAppSocket({
    settings: { sessionDbPath: 'session.db', usePairingCode: false },
    engine: fake.engine,
    createLogger: createLoggerStub,
    ensureDirectory: async () => {}
  })

  assert.equal(fake.calls.socket.printQRInTerminal, true)
})
