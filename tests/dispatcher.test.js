import assert from 'node:assert/strict'
import test from 'node:test'

import { createPluginRegistry } from '../src/core/plugins.js'
import { dispatchCommand } from '../src/core/handler.js'

test('dispatches a known plugin with execution context', async () => {
  const registry = createPluginRegistry()
  let received
  registry.add({
    command: 'echo',
    async execute(message, context) {
      received = { message, context }
      await message.reply(context.text)
    }
  }, 'echo.js')
  const replies = []
  const message = { chat: 'chat', reply: async (text) => replies.push(text) }
  const settings = { prefixes: ['!'] }
  const utils = { marker: true }

  const result = await dispatchCommand(message, {
    registry,
    sock: 'socket',
    command: 'echo',
    prefix: '!',
    args: ['hello', 'world'],
    text: 'hello world',
    isOwner: false,
    settings,
    utils
  })

  assert.equal(result.handled, true)
  assert.deepEqual(replies, ['hello world'])
  assert.equal(received.message, message)
  assert.equal(received.context.sock, 'socket')
  assert.deepEqual(received.context.args, ['hello', 'world'])
  assert.equal(received.context.settings, settings)
  assert.equal(received.context.utils, utils)
})

test('ignores unknown command', async () => {
  const result = await dispatchCommand({}, { registry: createPluginRegistry(), command: 'missing' })
  assert.deepEqual(result, { handled: false, reason: 'unknown-command' })
})

test('isolates plugin errors and sends safe reply', async () => {
  const registry = createPluginRegistry()
  registry.add({ command: 'broken', async execute() { throw new Error('secret internal detail') } }, 'broken.js')
  const replies = []
  const result = await dispatchCommand({ reply: async (text) => replies.push(text) }, {
    registry,
    command: 'broken'
  })

  assert.equal(result.handled, true)
  assert.equal(result.ok, false)
  assert.equal(replies[0], 'Plugin gagal dijalankan.')
  assert.equal(replies[0].includes('secret'), false)
})
