import assert from 'node:assert/strict'
import test from 'node:test'

import {
  extractMentions,
  formatDuration,
  formatUptime,
  normalizeJid,
  parseJids,
  sleep
} from '../src/utils/index.js'

test('normalizes phone numbers and preserves JIDs', () => {
  assert.equal(normalizeJid(' 6281234567890 '), '6281234567890@s.whatsapp.net')
  assert.equal(normalizeJid('6281234567890@s.whatsapp.net'), '6281234567890@s.whatsapp.net')
  assert.equal(normalizeJid(''), null)
  assert.equal(normalizeJid(null), null)
})

test('parses unique JIDs from strings and arrays', () => {
  assert.deepEqual(
    parseJids('6281234567890, 6281234567890@s.whatsapp.net, 6289876543210'),
    ['6281234567890@s.whatsapp.net', '6289876543210@s.whatsapp.net']
  )
  assert.deepEqual(parseJids(['6281234567890', '', null]), ['6281234567890@s.whatsapp.net'])
})

test('extracts unique mentions', () => {
  assert.deepEqual(
    extractMentions('Halo @6281234567890 dan @6281234567890, @6289876543210'),
    ['6281234567890@s.whatsapp.net', '6289876543210@s.whatsapp.net']
  )
  assert.deepEqual(extractMentions(null), [])
})

test('formats durations without undefined values', () => {
  assert.equal(formatDuration(0), '0d')
  assert.equal(formatDuration(3723000), '1j 2m 3d')
  assert.equal(formatDuration(-1), '0d')
  assert.equal(formatUptime(86400000), '24h 0m 0s')
})

test('sleep resolves immediately for zero duration', async () => {
  const startedAt = Date.now()
  await sleep(0)
  assert.ok(Date.now() - startedAt < 100)
})
