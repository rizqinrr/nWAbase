import assert from 'node:assert/strict'
import test from 'node:test'

import { createShutdown, installProcessErrorHandlers, installShutdownHandlers } from '../src/core/connection.js'

test('shutdown is idempotent and closes every resource after failures', async () => {
  const calls = []
  const errors = []
  const shutdown = createShutdown({
    closeSocket: async () => {
      calls.push('socket')
      throw new Error('socket failed')
    },
    closeWatcher: async () => calls.push('watcher'),
    closeReadline: async () => {
      calls.push('readline')
      throw new Error('readline failed')
    },
    closeDatabase: async () => calls.push('database'),
    onError: (error) => errors.push(error.message)
  })

  await Promise.all([shutdown('SIGINT'), shutdown('SIGTERM')])
  await shutdown('SIGINT')

  assert.deepEqual(calls.sort(), ['database', 'readline', 'socket', 'watcher'])
  assert.deepEqual(errors.sort(), ['readline failed', 'socket failed'])
  assert.equal(shutdown.closed, true)
})

test('shutdown still closes resources when the signal hook fails', async () => {
  const calls = []
  const errors = []
  const shutdown = createShutdown({
    onSignal: () => {
      throw new Error('signal hook failed')
    },
    onError: (error, name) => errors.push([name, error.message]),
    closeSocket: async () => calls.push('socket'),
    closeWatcher: async () => calls.push('watcher'),
    closeReadline: async () => calls.push('readline'),
    closeDatabase: async () => calls.push('database')
  })

  await shutdown('SIGTERM')

  assert.deepEqual(calls.sort(), ['database', 'readline', 'socket', 'watcher'])
  assert.deepEqual(errors, [['signal', 'signal hook failed']])
})

test('process error handlers report safe error messages and can be removed', () => {
  const handlers = new Map()
  const logs = []
  const processLike = {
    on(event, handler) {
      handlers.set(event, handler)
    },
    off(event, handler) {
      if (handlers.get(event) === handler) handlers.delete(event)
    }
  }

  const remove = installProcessErrorHandlers({
    processLike,
    logger: { error(value) { logs.push(value) } }
  })

  handlers.get('uncaughtException')(new Error('secret-token should not leak'))
  handlers.get('unhandledRejection')({ message: 'rejected' })
  remove()

  assert.deepEqual(logs, [
    { type: 'uncaughtException', message: 'Unexpected process error' },
    { type: 'unhandledRejection', message: 'Unexpected process error' }
  ])
  assert.equal(handlers.size, 0)
})

test('signal handlers invoke shutdown and can be removed', async () => {
  const handlers = new Map()
  const signals = []
  const processLike = {
    on(event, handler) {
      handlers.set(event, handler)
    },
    off(event, handler) {
      if (handlers.get(event) === handler) handlers.delete(event)
    }
  }
  const remove = installShutdownHandlers({
    processLike,
    shutdown: async (signal) => signals.push(signal)
  })

  await handlers.get('SIGINT')()
  await handlers.get('SIGTERM')()
  remove()

  assert.deepEqual(signals, ['SIGINT', 'SIGTERM'])
  assert.equal(handlers.size, 0)
})
