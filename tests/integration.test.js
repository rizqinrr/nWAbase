import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { startRuntime } from '../src/index.js'

function createFakeSocket() {
  const handlers = new Map()
  const sent = []

  return {
    sent,
    ev: {
      on(event, handler) {
        handlers.set(event, handler)
      },
      off(event, handler) {
        if (handlers.get(event) === handler) handlers.delete(event)
      },
      async emit(event, value) {
        return handlers.get(event)?.(value)
      }
    },
    sendMessage(chat, content) {
      sent.push({ chat, content })
      return Promise.resolve()
    },
    end() {
      return Promise.resolve()
    },
    ws: {
      close() {
        return Promise.resolve()
      }
    }
  }
}

function rawMessage(text, id) {
  return {
    key: {
      id,
      remoteJid: '6281234567890@s.whatsapp.net',
      fromMe: false
    },
    message: { conversation: text }
  }
}

test('runtime reconnects with one active socket after a transient disconnect', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nwabase-reconnect-'))
  const sockets = [createFakeSocket(), createFakeSocket()]
  const authClosures = []
  const timers = []
  let created = 0
  const processLike = { on() {}, off() {} }

  const runtime = await startRuntime({
    settings: {
      botName: 'test',
      owners: [],
      prefixes: ['!'],
      pairingCode: '',
      usePairingCode: true,
      watchPlugins: false,
      sessionDbPath: join(directory, 'session.db'),
      appDbPath: join(directory, 'app.db')
    },
    createSocket: async () => {
      const index = created++
      return {
        sock: sockets[index],
        auth: {
          state: { creds: { registered: true } },
          close: async () => authClosures.push(index)
        }
      }
    },
    reconnectOptions: {
      baseMs: 1,
      setTimer(callback) {
        const timer = { callback }
        timers.push(timer)
        return timer
      },
      clearTimer() {}
    },
    processLike
  })

  try {
    await sockets[0].ev.emit('connection.update', {
      connection: 'close',
      lastDisconnect: { error: { output: { statusCode: 500 } } }
    })
    await timers[0].callback()
    await sockets[1].ev.emit('messages.upsert', { messages: [rawMessage('!ping', 'reconnected')] })

    assert.equal(created, 2)
    assert.deepEqual(authClosures, [0])
    assert.match(sockets[1].sent[0].content.text, /^Pong! Bot aktif\./)

    await sockets[0].ev.emit('messages.upsert', { messages: [rawMessage('!ping', 'stale')] })
    assert.equal(sockets[0].sent.length, 0)
  } finally {
    await runtime.shutdown('test')
    await rm(directory, { recursive: true, force: true })
  }
})

test('runtime closes the app database when socket creation fails', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nwabase-startup-'))
  const appDbPath = join(directory, 'app.db')

  await assert.rejects(
    startRuntime({
      settings: {
        botName: 'test',
        owners: [],
        prefixes: ['!'],
        pairingCode: '',
        usePairingCode: true,
        watchPlugins: false,
        sessionDbPath: join(directory, 'session.db'),
        appDbPath
      },
      createSocket: undefined,
      processLike: { on() {}, off() {} }
    }),
    /createSocket dependency is required/
  )

  assert.equal(existsSync(appDbPath), false)
  await rm(directory, { recursive: true, force: true })
})

test('runtime loads plugins before socket startup and routes messages through the dispatcher', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nwabase-runtime-'))
  const appDbPath = join(directory, 'app.db')
  const socket = createFakeSocket()
  let pluginsReadyWhenConnected = false

  const runtime = await startRuntime({
    settings: {
      botName: 'test',
      owners: [],
      prefixes: ['!'],
      pairingCode: '',
      usePairingCode: true,
      watchPlugins: false,
      sessionDbPath: join(directory, 'session.db'),
      appDbPath
    },
    createSocket: async ({ pluginManager }) => {
      pluginsReadyWhenConnected = pluginManager.registry.has('ping')
      return {
        sock: socket,
        auth: {
          state: { creds: { registered: true } },
          close() {
            return Promise.resolve()
          }
        }
      }
    },
    processLike: {
      on() {},
      off() {}
    }
  })

  try {
    assert.equal(pluginsReadyWhenConnected, true)

    runtime.pluginManager.registry.add(
      {
        command: 'explode',
        async execute() {
          throw new Error('expected plugin failure')
        }
      },
      'integration-explode.js'
    )

    await socket.ev.emit('messages.upsert', {
      messages: [rawMessage('!ping', 'one'), rawMessage('!explode', 'two'), rawMessage('!ping', 'three')]
    })

    assert.match(socket.sent[0].content.text, /^Pong! Bot aktif\./)
    assert.equal(socket.sent[1].content.text, 'Plugin gagal dijalankan.')
    assert.match(socket.sent[2].content.text, /^Pong! Bot aktif\./)
    assert.equal(existsSync(appDbPath), true)
  } finally {
    await runtime.shutdown('test')
    await rm(directory, { recursive: true, force: true })
  }

  assert.equal(existsSync(directory), false)
})
