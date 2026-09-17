import { normalizeJid } from '../utils/index.js'

const GUARD_DENIAL_MESSAGES = {
  ownerOnly: 'Perintah ini hanya untuk owner.',
  groupOnly: 'Perintah ini hanya di dalam grup.',
  privateOnly: 'Perintah ini hanya di chat pribadi.',
  adminOnly: 'Perintah ini hanya untuk admin grup.',
  botAdminOnly: 'Bot harus menjadi admin grup untuk perintah ini.'
}

function resolveAdminFlag(value) {
  if (typeof value === 'boolean') return Promise.resolve(value)
  if (value && typeof value.then === 'function') return value
  return Promise.resolve(false)
}

export function parseCommand(input, prefixes = ['!']) {
  if (typeof input !== 'string') return null
  const text = input.trim()
  if (!text) return null

  const normalizedPrefixes = prefixes
    .filter((prefix) => typeof prefix === 'string')
    .map((prefix) => prefix.trim())
    .filter(Boolean)
    .sort((a, b) => b.length - a.length)
  const prefix = normalizedPrefixes.find((candidate) => text.startsWith(candidate))
  if (!prefix) return null

  const withoutPrefix = text.slice(prefix.length).trim()
  if (!withoutPrefix) return null
  const parts = withoutPrefix.split(/\s+/)
  const command = parts.shift()?.toLowerCase() ?? ''
  if (!command) return null

  return { matched: true, prefix, command, args: parts, text: parts.join(' ') }
}

function jidIdentity(jid) {
  const normalized = normalizeJid(jid)
  if (!normalized) return null
  return normalized.split('@')[0].split(':')[0]
}

export async function checkPluginGuards(pluginMetadata = {}, message = {}, options = {}) {
  const owners = Array.isArray(options.owners) ? options.owners : []
  const senderIdentity = jidIdentity(message.sender ?? '')
  const isOwner = owners.some((owner) => {
    const ownerIdentity = jidIdentity(owner)
    return ownerIdentity && senderIdentity && ownerIdentity === senderIdentity
  })

  if (pluginMetadata.groupOnly && pluginMetadata.privateOnly) {
    return { allowed: false, isOwner, message: 'Konfigurasi plugin tidak valid.' }
  }
  if (pluginMetadata.ownerOnly && !isOwner) return { allowed: false, isOwner, message: GUARD_DENIAL_MESSAGES.ownerOnly }
  if (pluginMetadata.groupOnly && !message.isGroup) return { allowed: false, isOwner, message: GUARD_DENIAL_MESSAGES.groupOnly }
  if (pluginMetadata.privateOnly && message.isGroup) return { allowed: false, isOwner, message: GUARD_DENIAL_MESSAGES.privateOnly }

  const [senderAdmin, botAdmin] = await Promise.all([
    pluginMetadata.adminOnly ? resolveAdminFlag(message.isAdmin) : Promise.resolve(false),
    pluginMetadata.botAdminOnly ? resolveAdminFlag(message.isBotAdmin) : Promise.resolve(false)
  ])
  if (pluginMetadata.adminOnly && !senderAdmin) return { allowed: false, isOwner, message: GUARD_DENIAL_MESSAGES.adminOnly }
  if (pluginMetadata.botAdminOnly && !botAdmin) return { allowed: false, isOwner, message: GUARD_DENIAL_MESSAGES.botAdminOnly }

  return { allowed: true, isOwner }
}

function parseUnprefixedCommand(input) {
  if (typeof input !== 'string' || !input.trim()) return null
  const parts = input.trim().split(/\s+/)
  const command = parts.shift()?.toLowerCase() ?? ''
  if (!command) return null
  return { matched: true, prefix: '', command, args: parts, text: parts.join(' ') }
}

export async function routeMessage(message, options = {}) {
  const parsed = message?.interactiveCommand
    ? parseUnprefixedCommand(message.interactiveCommand)
    : parseCommand(message?.text ?? message?.txt, options.prefixes ?? ['!'])
  if (!parsed) return { handled: false, reason: 'not-command' }

  const plugin = options.registry?.get(parsed.command)
  if (!plugin) return { handled: false, reason: 'unknown-command', parsed }

  const guards = await checkPluginGuards(plugin, message, options)
  if (!guards.allowed) {
    await message?.reply?.(guards.message)
    return { handled: true, ok: false, reason: 'guard-denied', parsed, guards }
  }

  return dispatchCommand(message, {
    ...options,
    ...parsed,
    isOwner: guards.isOwner
  })
}

export async function dispatchCommand(message, options = {}) {
  const plugin = options.registry?.get(options.command)
  if (!plugin) return { handled: false, reason: 'unknown-command' }

  const context = {
    sock: options.sock,
    args: options.args ?? [],
    text: options.text ?? '',
    command: options.command,
    prefix: options.prefix ?? '',
    isOwner: Boolean(options.isOwner),
    settings: options.settings,
    utils: options.utils
  }

  try {
    await plugin.execute(message, context)
    return { handled: true, ok: true, plugin }
  } catch (error) {
    try {
      await message?.reply?.('Plugin gagal dijalankan.')
    } catch {}
    options.onError?.(error, plugin)
    return { handled: true, ok: false, plugin }
  }
}
