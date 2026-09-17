import assert from 'node:assert/strict'
import test from 'node:test'

import { parseCommand } from '../src/core/handler.js'

test('parses a command with one prefix', () => {
  assert.deepEqual(parseCommand('  !Ping one  two  ', ['!']), {
    matched: true,
    prefix: '!',
    command: 'ping',
    args: ['one', 'two'],
    text: 'one two'
  })
})

test('parses the first matching prefix from multiple prefixes', () => {
  assert.equal(parseCommand('.status now', ['!', '.']).prefix, '.')
  assert.equal(parseCommand('/status now', ['!', '.']), null)
})

test('ignores non-command and blank input', () => {
  assert.equal(parseCommand('hello', ['!']), null)
  assert.equal(parseCommand('   ', ['!']), null)
  assert.equal(parseCommand(null, ['!']), null)
})

test('normalizes prefixes and command case', () => {
  assert.deepEqual(parseCommand(' #  HeLLo ', [' ! ', '#' ]), {
    matched: true,
    prefix: '#',
    command: 'hello',
    args: [],
    text: ''
  })
})
