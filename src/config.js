import 'dotenv/config'

const DEFAULTS = {
  BOT_NAME: 'nWAbase',
  OWNER_NUMBER: '',
  PREFIX: '!',
  PAIRING_CODE: '',
  USE_PAIRING_CODE: 'true',
  WATCH_PLUGINS: 'false',
  SESSION_DB_PATH: './store/session.db',
  APP_DB_PATH: './store/app.db'
}

function readValue(env, key) {
  return String(env[key] ?? DEFAULTS[key]).trim()
}

function parseList(env, key) {
  const value = readValue(env, key)
  const items = [...new Set(value.split(',').map((item) => item.trim()).filter(Boolean))]

  if (items.length === 0 && value !== '') {
    throw new Error(`${key} must contain at least one non-empty value`)
  }

  return items
}

function parseBoolean(env, key) {
  const value = readValue(env, key).toLowerCase()

  if (value === 'true' || value === '1') return true
  if (value === 'false' || value === '0') return false

  throw new Error(`${key} must be true, false, 1, or 0; received ${value}`)
}

function parsePath(env, key) {
  const value = readValue(env, key)

  if (!value) throw new Error(`${key} must not be empty`)

  return value
}

export function parseConfig(env = process.env) {
  const botName = readValue(env, 'BOT_NAME')
  const pairingCode = readValue(env, 'PAIRING_CODE')

  if (!botName) throw new Error('BOT_NAME must not be empty')

  return {
    botName,
    owners: parseList(env, 'OWNER_NUMBER'),
    prefixes: parseList(env, 'PREFIX'),
    pairingCode,
    usePairingCode: parseBoolean(env, 'USE_PAIRING_CODE'),
    watchPlugins: parseBoolean(env, 'WATCH_PLUGINS'),
    sessionDbPath: parsePath(env, 'SESSION_DB_PATH'),
    appDbPath: parsePath(env, 'APP_DB_PATH')
  }
}

export const settings = parseConfig()
