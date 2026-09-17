import assert from 'node:assert/strict'
import test from 'node:test'

import { createPluginRegistry } from '../src/core/plugins.js'
import { routeMessage } from '../src/core/handler.js'

function createMessage(text, overrides = {}) {
  const replies = []
  return {
    message: {
      text,
      sender: '6281111111111@s.whatsapp.net',
      isGroup: false,
      isAdmin: Promise.resolve(false),
      isBotAdmin: Promise.resolve(false),
      reply: async (reply) => replies.push(reply),
      ...overrides
    },
    replies
  }
}

test('routes public command from text to plugin', async () => {
  const registry = createPluginRegistry()
  const calls = []
  registry.add({ command: 'ping', async execute(_message, context) { calls.push(context.command) } }, 'ping.js')
  const { message } = createMessage('!PING')

  const result = await routeMessage(message, { registry, prefixes: ['!'] })
  assert.equal(result.ok, true)
  assert.deepEqual(calls, ['ping'])
})

test('denies owner command for non-owner', async () => {
  const registry = createPluginRegistry()
  let executed = false
  registry.add({ command: 'secret', ownerOnly: true, async execute() { executed = true } }, 'secret.js')
  const { message, replies } = createMessage('!secret')

  const result = await routeMessage(message, { registry, prefixes: ['!'], owners: [] })
  assert.equal(result.reason, 'guard-denied')
  assert.equal(executed, false)
  assert.deepEqual(replies, ['Perintah ini hanya untuk owner.'])
})

test('enforces group and admin guards', async () => {
  const registry = createPluginRegistry()
  registry.add({ command: 'admin', groupOnly: true, adminOnly: true, async execute() {} }, 'admin.js')
  const denied = createMessage('!admin', { isGroup: true, isAdmin: Promise.resolve(false) })
  const allowed = createMessage('!admin', { isGroup: true, isAdmin: Promise.resolve(true) })

  assert.equal((await routeMessage(denied.message, { registry, prefixes: ['!'] })).reason, 'guard-denied')
  assert.equal((await routeMessage(allowed.message, { registry, prefixes: ['!'] })).ok, true)
})

test('plugin error does not prevent routing the next message', async () => {
  const registry = createPluginRegistry()
  const calls = []
  registry.add({ command: 'broken', async execute() { throw new Error('broken') } }, 'broken.js')
  registry.add({ command: 'healthy', async execute() { calls.push('healthy') } }, 'healthy.js')

  const first = createMessage('!broken')
  const second = createMessage('!healthy')
  assert.equal((await routeMessage(first.message, { registry, prefixes: ['!'] })).ok, false)
  assert.equal((await routeMessage(second.message, { registry, prefixes: ['!'] })).ok, true)
  assert.deepEqual(calls, ['healthy'])
})
