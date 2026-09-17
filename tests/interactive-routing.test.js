import assert from 'node:assert/strict'
import test from 'node:test'

import { extractInteractiveCommand, normalizeMessage } from '../src/core/message.js'
import { createPluginRegistry } from '../src/core/plugins.js'
import { routeMessage } from '../src/core/handler.js'

test('extracts native flow response command safely', () => {
  const message = {
    interactiveResponseMessage: {
      nativeFlowResponseMessage: {
        paramsJson: JSON.stringify({ id: 'menu', command: 'Ping one' })
      }
    }
  }
  assert.equal(extractInteractiveCommand(message), 'Ping one')
  assert.equal(extractInteractiveCommand({ interactiveResponseMessage: { nativeFlowResponseMessage: { paramsJson: '{bad' } } }), null)
})

test('extracts button and single select response IDs', () => {
  assert.equal(extractInteractiveCommand({ buttonsResponseMessage: { selectedButtonId: 'ping' } }), 'ping')
  assert.equal(extractInteractiveCommand({ listResponseMessage: { singleSelectReply: { selectedRowId: 'status now' } } }), 'status now')
})

test('routes recognized interactive response without prefix', async () => {
  const registry = createPluginRegistry()
  const calls = []
  registry.add({ command: 'ping', async execute(_message, context) { calls.push(context) } }, 'ping.js')
  const message = normalizeMessage({
    key: { id: 'interactive-1', remoteJid: '6281111111111@s.whatsapp.net', fromMe: false },
    message: { buttonsResponseMessage: { selectedButtonId: 'ping hello' } }
  })

  const result = await routeMessage(message, { registry, prefixes: ['!'] })
  assert.equal(result.ok, true)
  assert.equal(calls[0].command, 'ping')
  assert.deepEqual(calls[0].args, ['hello'])
  assert.equal(calls[0].prefix, '')
})

test('does not route arbitrary unprefixed text', async () => {
  const registry = createPluginRegistry()
  registry.add({ command: 'ping', async execute() {} }, 'ping.js')
  const result = await routeMessage({ text: 'ping' }, { registry, prefixes: ['!'] })
  assert.equal(result.reason, 'not-command')
})
