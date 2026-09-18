import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import {
  bindConnectionUpdates,
  createReconnectController,
  createShutdown,
  installProcessErrorHandlers,
  installShutdownHandlers
} from './core/connection.js'
import { normalizeMessage } from './core/message.js'
import { routeMessage } from './core/handler.js'
import { createPluginManager } from './core/plugins.js'
import { closeDB, initDB } from './database/index.js'

export async function startRuntime(options = {}) {
  const settings = options.settings
  if (!settings) throw new Error('runtime settings are required')

  const pluginManager = options.pluginManager ?? createPluginManager({
    directory: options.pluginDirectory ?? join(process.cwd(), 'plugins'),
    watchPlugins: settings.watchPlugins,
    onError: options.onError
  })
  await pluginManager.load()

  const createSocket = options.createSocket
  if (typeof createSocket !== 'function') throw new Error('runtime createSocket dependency is required')

  try {
    initDB(settings.appDbPath)
  } catch (error) {
    closeDB()
    throw error
  }

  let connection = null
  let closed = false

  const reconnect = createReconnectController({
    ...options.reconnectOptions,
    connect: async () => {
      const previous = connection
      connection = await createSocket({ settings, pluginManager })
      bindSocketEvents(connection.sock)
      await previous?.sock?.end?.(new Error('replaced connection'))
      await previous?.auth?.close?.()
    }
  })
  let detachConnectionUpdates = () => {}
  let detachMessages = () => {}
  const bindSocketEvents = (sock) => {
    const onMessagesUpsert = async (update) => {
      for (const rawMessage of update?.messages ?? []) {
        const message = normalizeMessage(rawMessage, { sock })
        await routeMessage(message, {
          registry: pluginManager.registry,
          prefixes: settings.prefixes,
          owners: settings.owners,
          sock,
          settings,
          utils: options.utils,
          onError: options.onError
        })
      }
    }

    detachMessages()
    sock.ev.on('messages.upsert', onMessagesUpsert)
    detachMessages = () => sock.ev.off?.('messages.upsert', onMessagesUpsert)
    detachConnectionUpdates()
    detachConnectionUpdates = bindConnectionUpdates({
      sock,
      reconnect,
      onLogout: options.onLogout,
      onClose: options.onConnectionClose
    })
  }

  const removeProcessHandlers = () => {
    detachShutdown()
    detachErrors()
  }
  const shutdown = createShutdown({
    closeSocket: async () => {
      reconnect.cancel()
      detachMessages()
      detachConnectionUpdates()
      await connection?.sock?.end?.(new Error('runtime shutdown'))
      await connection?.sock?.ws?.close?.()
      await connection?.auth?.close?.()
    },
    closeWatcher: () => pluginManager.closeWatcher(),
    closeDatabase: () => closeDB(),
    onError: options.onError,
    onSignal: removeProcessHandlers
  })

  const detachErrors = installProcessErrorHandlers({
    processLike: options.processLike ?? process,
    logger: options.logger
  })
  const detachShutdown = installShutdownHandlers({
    processLike: options.processLike ?? process,
    shutdown
  })

  try {
    connection = await createSocket({ settings, pluginManager })
    bindSocketEvents(connection.sock)
  } catch (error) {
    try {
      await connection?.sock?.end?.(new Error('runtime startup failed'))
      await connection?.auth?.close?.()
    } catch {}
    closeDB()
    removeProcessHandlers()
    throw error
  }

  if (settings.watchPlugins) pluginManager.startWatching()

  return {
    connection,
    pluginManager,
    shutdown: async (signal = 'runtime') => {
      if (closed) return false
      closed = true
      return shutdown(signal)
    }
  }
}

export async function main(options = {}) {
  const { settings } = await import('./config.js')
  const { createWhatsAppSocket, requestPairing } = await import('./core/connection.js')
  return startRuntime({
    ...options,
    settings,
    createSocket: async (socketOptions) => {
      const connection = await createWhatsAppSocket(socketOptions)
      await requestPairing({
        sock: connection.sock,
        settings,
        registered: connection.auth.state.creds.registered
      })
      return connection
    }
  })
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) await main()
