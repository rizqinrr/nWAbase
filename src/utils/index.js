const USER_JID_SUFFIX = '@s.whatsapp.net'
const SUPPORTED_JID_PATTERN = /^\d+(?::\d+)?@(s\.whatsapp\.net|g\.us|lid)$/

export function normalizeJid(input) {
  if (input === null || input === undefined) return null

  const value = String(input).trim()
  if (!value) return null
  if (value.includes('@')) return SUPPORTED_JID_PATTERN.test(value) ? value : null

  const number = value.replace(/[^0-9]/g, '')
  return number ? `${number}${USER_JID_SUFFIX}` : null
}

export function parseJids(input) {
  const values = Array.isArray(input) ? input : String(input ?? '').split(',')
  const jids = values.map(normalizeJid).filter(Boolean)
  return [...new Set(jids)]
}

export function extractMentions(text) {
  if (typeof text !== 'string') return []
  const matches = text.match(/@([0-9]{5,20})/g) ?? []
  return parseJids(matches.map((mention) => mention.slice(1)))
}

export function formatDuration(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return '0d'

  const totalSeconds = Math.floor(ms / 1000)
  const days = Math.floor(totalSeconds / 86400)
  const hours = Math.floor((totalSeconds % 86400) / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const parts = []

  if (days) parts.push(`${days}h`)
  if (hours || days) parts.push(`${hours}j`)
  if (minutes || hours || days) parts.push(`${minutes}m`)
  parts.push(`${seconds}d`)

  return parts.join(' ')
}

export function formatUptime(ms) {
  if (typeof ms !== 'number' || !Number.isFinite(ms) || ms <= 0) return '0h 0m 0s'

  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return `${hours}h ${minutes}m ${seconds}s`
}

export function sleep(ms) {
  const delay = typeof ms === 'number' && Number.isFinite(ms) && ms > 0 ? ms : 0
  return new Promise((resolve) => setTimeout(resolve, delay))
}
