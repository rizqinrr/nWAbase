import assert from 'node:assert/strict'
import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import {
  closeDB,
  deleteSetting,
  getDB,
  getSetting,
  initDB,
  setSetting
} from '../src/database/index.js'

test('persists settings and supports JSON values', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nwabase-db-'))
  const dbPath = join(directory, 'nested', 'app.db')

  try {
    initDB(dbPath)
    assert.equal(getDB().pragma('journal_mode', { simple: true }), 'wal')

    setSetting('string', 'value')
    setSetting('object', { enabled: true })
    setSetting('array', [1, 2, 3])
    setSetting('string', 'updated')

    assert.equal(getSetting('string'), 'updated')
    assert.deepEqual(getSetting('object'), { enabled: true })
    assert.deepEqual(getSetting('array'), [1, 2, 3])
    assert.equal(getSetting('missing', 'fallback'), 'fallback')
  } finally {
    closeDB()
    await rm(directory, { recursive: true, force: true })
  }
})

test('deletes settings and rejects invalid keys', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nwabase-db-'))
  const dbPath = join(directory, 'app.db')

  try {
    initDB(dbPath)
    setSetting('temporary', 123)
    assert.equal(deleteSetting('temporary'), true)
    assert.equal(deleteSetting('temporary'), false)
    assert.equal(getSetting('temporary', null), null)
    assert.throws(() => setSetting('', 'value'), /key/)
    assert.throws(() => getSetting('', null), /key/)
  } finally {
    closeDB()
    await rm(directory, { recursive: true, force: true })
  }
})

test('closes database and leaves no temporary artifact', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nwabase-db-'))
  const dbPath = join(directory, 'app.db')

  initDB(dbPath)
  closeDB()
  assert.throws(() => getDB(), /not initialized/)
  await rm(directory, { recursive: true, force: true })
  await assert.rejects(readFile(dbPath))
})
