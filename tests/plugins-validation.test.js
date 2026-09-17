import assert from 'node:assert/strict'
import test from 'node:test'

import { createPluginRegistry, validatePlugin } from '../src/core/plugins.js'

const validPlugin = {
  name: 'Example',
  command: ['Ping', ' pong '],
  aliases: ['P'],
  execute: async () => 'ok'
}

test('validates and normalizes plugin triggers', () => {
  const plugin = validatePlugin(validPlugin, 'example.js')

  assert.deepEqual(plugin.triggers, ['ping', 'pong', 'p'])
  assert.equal(plugin.plugin, validPlugin)
  assert.equal(plugin.file, 'example.js')
})

test('rejects plugins without commands or execute function', () => {
  assert.throws(() => validatePlugin({ execute: async () => {} }, 'missing-command.js'), /command/)
  assert.throws(() => validatePlugin({ command: 'ping' }, 'missing-execute.js'), /execute/)
  assert.throws(() => validatePlugin({ command: ['   '], execute: async () => {} }, 'empty.js'), /trigger/)
  assert.throws(
    () => validatePlugin({ command: ['ping', '   '], execute: async () => {} }, 'partially-empty.js'),
    /trigger/
  )
})

test('rejects unsupported guard value types', () => {
  assert.throws(
    () => validatePlugin({ command: 'ping', execute: async () => {}, ownerOnly: 'yes' }, 'guard.js'),
    /ownerOnly/
  )
})

test('rejects duplicate triggers within one plugin', () => {
  assert.throws(
    () => validatePlugin({ command: ['ping', 'PING'], execute: async () => {} }, 'duplicate-command.js'),
    (error) => {
      assert.equal(error.code, 'DUPLICATE_TRIGGER')
      assert.equal(error.details.trigger, 'ping')
      assert.equal(error.details.file, 'duplicate-command.js')
      return true
    }
  )

  assert.throws(
    () => validatePlugin({ command: 'ping', alias: ['PING'], execute: async () => {} }, 'duplicate-alias.js'),
    /duplicate trigger/i
  )
})

test('rejects duplicate triggers in a candidate registry', () => {
  const registry = createPluginRegistry()
  registry.add(validPlugin, 'first.js')
  assert.throws(
    () => registry.add({ command: 'PING', execute: async () => {} }, 'second.js'),
    (error) => {
      assert.equal(error.code, 'DUPLICATE_TRIGGER')
      assert.equal(error.details.trigger, 'ping')
      assert.equal(error.details.file, 'second.js')
      assert.equal(error.details.existingFile, 'first.js')
      return true
    }
  )
})

test('does not mutate registry when add validation fails', () => {
  const registry = createPluginRegistry()
  registry.add(validPlugin, 'first.js')

  assert.throws(() => registry.add({ command: 'new', execute: 'invalid' }, 'invalid.js'))
  assert.equal(registry.size, 3)
  assert.equal(registry.get('new'), undefined)
})
