const MESSAGE_WRAPPERS = new Set(['ephemeralMessage', 'viewOnceMessage', 'viewOnceMessageV2', 'viewOnceMessageV2Extension'])

export function extractInteractiveCommand(message) {
  const unwrapped = unwrapMessage(message)
  if (!unwrapped || typeof unwrapped !== 'object') return null

  const buttonId = unwrapped.buttonsResponseMessage?.selectedButtonId
  if (typeof buttonId === 'string' && buttonId.trim()) return buttonId.trim()

  const selectedRowId = unwrapped.listResponseMessage?.singleSelectReply?.selectedRowId
  if (typeof selectedRowId === 'string' && selectedRowId.trim()) return selectedRowId.trim()

  const paramsJson = unwrapped.interactiveResponseMessage?.nativeFlowResponseMessage?.paramsJson
  if (typeof paramsJson !== 'string') return null
  try {
    const params = JSON.parse(paramsJson)
    const command = params?.command ?? params?.id
    return typeof command === 'string' && command.trim() ? command.trim() : null
  } catch {
    return null
  }
}



export function unwrapMessage(message) {
  let current = message
  while (current && typeof current === 'object') {
    const wrapperType = Object.keys(current).find((key) => MESSAGE_WRAPPERS.has(key))
    if (!wrapperType) return current
    current = current[wrapperType]?.message ?? null
  }
  return current
}

export function resolveMessageText(message) {
  const unwrapped = unwrapMessage(message)
  if (!unwrapped || typeof unwrapped !== 'object') return ''
  if (unwrapped.conversation) return unwrapped.conversation
  if (unwrapped.extendedTextMessage?.text) return unwrapped.extendedTextMessage.text
  if (unwrapped.imageMessage?.caption) return unwrapped.imageMessage.caption
  if (unwrapped.videoMessage?.caption) return unwrapped.videoMessage.caption
  if (unwrapped.documentMessage?.caption) return unwrapped.documentMessage.caption
  if (unwrapped.buttonsResponseMessage?.selectedButtonId) return unwrapped.buttonsResponseMessage.selectedButtonId
  if (unwrapped.listResponseMessage?.singleSelectReply?.selectedRowId) return unwrapped.listResponseMessage.singleSelectReply.selectedRowId
  return ''
}

export function resolveMessageType(message) {
  const unwrapped = unwrapMessage(message)
  if (!unwrapped || typeof unwrapped !== 'object') return null
  const keys = Object.keys(unwrapped).filter((key) => !key.startsWith('contextInfo'))
  if (keys.length === 1) return keys[0]
  const primary = keys.find((key) =>
    ['conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage', 'documentMessage'].includes(key)
  )
  return primary ?? keys[0] ?? null
}

export function normalizeMessage(rawMessage, options = {}) {
  const isEnvelope = rawMessage && typeof rawMessage === 'object' && 'key' in rawMessage
  const message = isEnvelope ? unwrapMessage(rawMessage.message ?? null) : unwrapMessage(rawMessage ?? null)
  const key = rawMessage?.key ?? {}
  const chat = key.remoteJid ?? null
  const isGroup = typeof chat === 'string' && chat.endsWith('@g.us')
  const sender = key.participant ?? (isGroup ? null : chat)
  const fromMe = Boolean(key.fromMe)
  const type = resolveMessageType(message)
  const txt = resolveMessageText(message)
  const interactiveCommand = extractInteractiveCommand(message)
  const content = type ? message?.[type] : null
  const contextInfo = content?.contextInfo ?? {}
  const mentions = Array.isArray(contextInfo.mentionedJid) ? contextInfo.mentionedJid : []
  const quotedRaw = contextInfo.quotedMessage ?? null
  const quoted = quotedRaw
    ? {
        id: contextInfo.stanzaId ?? null,
        sender: contextInfo.participant ?? null,
        type: resolveMessageType(quotedRaw),
        text: resolveMessageText(quotedRaw),
        raw: quotedRaw
      }
    : null
  const sock = options.sock ?? null

  const reply = (content, chatId = chat, extra = {}) => {
    if (!sock) return Promise.resolve(null)
    const payload = typeof content === 'string' ? { text: content } : content
    return sock.sendMessage(chatId, payload, { quoted: rawMessage, ...extra })
  }

  const metadataLookup = async (jid) => {
    if (!sock?.groupMetadata || !chat || !jid) return false
    try {
      const metadata = await sock.groupMetadata(chat)
      const participant = metadata?.participants?.find((participant) => participant.id === jid)
      return Boolean(participant && (participant.admin === 'admin' || participant.admin === 'superadmin'))
    } catch {
      return false
    }
  }

  let adminCache = null
  let botAdminCache = null

  const lazyAdmin = (() => {
    let resolved = false
    let value = false
    return () =>
      new Promise((resolve) => {
        if (resolved) return resolve(value)
        metadataLookup(sender).then((result) => {
          resolved = true
          value = result
          resolve(value)
        })
      })
  })()

  const lazyBotAdmin = (() => {
    let resolved = false
    let value = false
    return () =>
      new Promise((resolve) => {
        if (resolved) return resolve(value)
        metadataLookup(sock?.user?.id ?? null).then((result) => {
          resolved = true
          value = result
          resolve(value)
        })
      })
  })()

  return {
    key,
    id: key.id ?? null,
    chat,
    sender,
    fromMe,
    isGroup,
    type,
    txt,
    text: txt,
    interactiveCommand,
    mentions,
    quoted,
    reply,
    get isAdmin() {
      if (adminCache !== null) return Promise.resolve(adminCache)
      return lazyAdmin().then((result) => {
        adminCache = result
        return result
      })
    },
    get isBotAdmin() {
      if (botAdminCache !== null) return Promise.resolve(botAdminCache)
      return lazyBotAdmin().then((result) => {
        botAdminCache = result
        return result
      })
    },
    raw: rawMessage ?? null
  }
}
