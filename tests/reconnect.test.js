import assert from 'node:assert/strict'
import test from 'node:test'

import {
  bindConnectionUpdates,
  computeReconnectDelay,
  createReconnectController
} from '../src/core/connection.js'

test('reconnect delay grows exponentially and is capped', () => {
  assert.equal(computeReconnectDelay(0), 2000)
  assert.equal(computeReconnectDelay(1), 4000)
  assert.equal(computeReconnectDelay(4), 30000)
  assert.equal(computeReconnectDelay(20), 30000)
})

test('schedules one reconnect at a time and resets after opening', async () => {
  const timers = []
  const cleared = []
  let connects = 0
  const reconnect = createReconnectController({
    connect: async () => {
      connects += 1
    },
    setTimer(callback, delay) {
      const timer = { callback, delay }
      timers.push(timer)
      return timer
    },
    clearTimer(timer) {
      cleared.push(timer)
    }
  })

  assert.deepEqual(reconnect.schedule(), { scheduled: true, delay: 2000, attempt: 1 })
  assert.deepEqual(reconnect.schedule(), { scheduled: false, reason: 'pending' })
  assert.equal(timers.length, 1)

  await timers[0].callback()
  assert.equal(connects, 1)
  assert.deepEqual(reconnect.schedule(), { scheduled: true, delay: 4000, attempt: 2 })

  reconnect.connected()
  assert.equal(cleared.length, 1)
  assert.equal(reconnect.attempts, 0)
})

test('does not schedule another reconnect while connect is still running', async () => {
  let timer
  let finishConnect
  const reconnect = createReconnectController({
    connect: () => new Promise((resolve) => {
      finishConnect = resolve
    }),
    setTimer(callback) {
      timer = { callback }
      return timer
    },
    clearTimer() {}
  })

  reconnect.schedule()
  const connecting = timer.callback()

  assert.deepEqual(reconnect.schedule(), { scheduled: false, reason: 'connecting' })
  finishConnect()
  await connecting
  assert.equal(reconnect.schedule().scheduled, true)
})

test('cancel prevents a scheduled reconnect', async () => {
  let timer
  let connects = 0
  const reconnect = createReconnectController({
    connect: async () => {
      connects += 1
    },
    setTimer(callback) {
      timer = { callback }
      return timer
    },
    clearTimer() {}
  })

  reconnect.schedule()
  reconnect.cancel()
  await timer.callback()

  assert.equal(connects, 0)
  assert.deepEqual(reconnect.schedule(), { scheduled: false, reason: 'stopped' })
})

test('a stale timer does not reconnect after opening', async () => {
  const timers = []
  let connects = 0
  let connectResolve
  const reconnect = createReconnectController({
    connect: () =>
      new Promise((resolve) => {
        connectResolve = resolve
        connects += 1
      }),
    setTimer(callback) {
      const timer = { callback }
      timers.push(timer)
      return timer
    },
    clearTimer() {}
  })

  reconnect.schedule()
  const firstConnect = timers[0].callback()
  assert.equal(connects, 1)

  reconnect.connected()
  connectResolve()
  await firstConnect
  assert.equal(connects, 1)

  await timers[0].callback()
  assert.equal(connects, 1)
})

test('connection updates reconnect on transient close but not logout', async () => {
  const handlers = new Map()
  const events = []
  const reconnect = {
    connected() {
      events.push('connected')
    },
    schedule() {
      events.push('scheduled')
    },
    cancel() {
      events.push('cancelled')
    }
  }
  const detach = bindConnectionUpdates({
    sock: {
      ev: {
        on(event, handler) {
          handlers.set(event, handler)
        },
        off(event, handler) {
          if (handlers.get(event) === handler) handlers.delete(event)
        }
      }
    },
    reconnect,
    loggedOutCode: 401,
    getStatusCode: (error) => error.status
  })

  await handlers.get('connection.update')({ connection: 'open' })
  await handlers.get('connection.update')({ connection: 'close', lastDisconnect: { error: { status: 500 } } })
  await handlers.get('connection.update')({ connection: 'close', lastDisconnect: { error: { status: 401 } } })

  assert.deepEqual(events, ['connected', 'scheduled', 'cancelled'])
  detach()
  assert.equal(handlers.has('connection.update'), false)
})
