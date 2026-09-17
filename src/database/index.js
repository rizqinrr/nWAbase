import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

let database = null

function assertKey(key) {
  if (typeof key !== 'string' || !key.trim()) throw new Error('setting key must be a non-empty string')
  return key.trim()
}

export function initDB(dbPath) {
  if (typeof dbPath !== 'string' || !dbPath.trim()) throw new Error('database path must be a non-empty string')
  closeDB()
  mkdirSync(dirname(dbPath), { recursive: true })
  database = new Database(dbPath)
  database.pragma('journal_mode = WAL')
  database.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value_json TEXT NOT NULL,
      updated_at INTEGER NOT NULL
    )
  `)
  return database
}

export function getDB() {
  if (!database) throw new Error('database is not initialized')
  return database
}

export function closeDB() {
  if (database) database.close()
  database = null
}

export function getSetting(key, fallback = undefined) {
  const row = getDB().prepare('SELECT value_json FROM settings WHERE key = ?').get(assertKey(key))
  return row ? JSON.parse(row.value_json) : fallback
}

export function setSetting(key, value) {
  const normalizedKey = assertKey(key)
  const valueJson = JSON.stringify(value)
  if (valueJson === undefined) throw new Error(`setting ${normalizedKey} cannot be undefined`)

  getDB()
    .prepare(`
      INSERT INTO settings (key, value_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET
        value_json = excluded.value_json,
        updated_at = excluded.updated_at
    `)
    .run(normalizedKey, valueJson, Date.now())
}

export function deleteSetting(key) {
  const result = getDB().prepare('DELETE FROM settings WHERE key = ?').run(assertKey(key))
  return result.changes > 0
}
