import assert from 'node:assert/strict'
import test from 'node:test'

import { parseConfig } from '../src/config.js'

test('uses documented defaults', () => {
  assert.deepEqual(parseConfig({}), {
    botName: 'nWAbase',
    owners: [],
    prefixes: ['!'],
    pairingCode: '',
    usePairingCode: true,
    watchPlugins: false,
    sessionDbPath: './store/session.db',
    appDbPath: './store/app.db'
  })
})

test('trims and deduplicates list values', () => {
  const settings = parseConfig({
    BOT_NAME: '  Test Bot  ',
    OWNER_NUMBER: '  owner-a, owner-b, owner-a ',
    PREFIX: '!, ., !',
    PAIRING_CODE: '  custom-code  ',
    USE_PAIRING_CODE: 'FALSE',
    WATCH_PLUGINS: '1',
    SESSION_DB_PATH: ' ./data/session.db ',
    APP_DB_PATH: './data/app.db'
  })

  assert.deepEqual(settings, {
    botName: 'Test Bot',
    owners: ['owner-a', 'owner-b'],
    prefixes: ['!', '.'],
    pairingCode: 'custom-code',
    usePairingCode: false,
    watchPlugins: true,
    sessionDbPath: './data/session.db',
    appDbPath: './data/app.db'
  })
})

test('accepts zero as false', () => {
  const settings = parseConfig({ USE_PAIRING_CODE: '0', WATCH_PLUGINS: '0' })

  assert.equal(settings.usePairingCode, false)
  assert.equal(settings.watchPlugins, false)
})

test('rejects invalid booleans', () => {
  assert.throws(
    () => parseConfig({ USE_PAIRING_CODE: 'yes' }),
    /USE_PAIRING_CODE.*yes/
  )
})

test('rejects empty configured lists', () => {
  assert.throws(() => parseConfig({ PREFIX: ' , ' }), /PREFIX/)
})

test('rejects blank paths', () => {
  assert.throws(() => parseConfig({ APP_DB_PATH: '   ' }), /APP_DB_PATH/)
})
