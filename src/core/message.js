export function resolveMessageText(message) {
  if (!message || typeof message !== 'object') return ''
  if (message.conversation) return message.conversation
  if (message.extendedTextMessage?.text) return message.extendedTextMessage.text
  if (message.imageMessage?.caption) return message.imageMessage.caption
  if (message.videoMessage?.caption) return message.videoMessage.caption
  if (message.documentMessage?.caption) return message.documentMessage.caption
  if (message.buttonsResponseMessage?.selectedButtonId) return message.buttonsResponseMessage.selectedButtonId
  if (message.listResponseMessage?.singleSelectReply?.selectedRowId) return message.listResponseMessage.singleSelectReply.selectedRowId
  return ''
}

export function resolveMessageType(message) {
  if (!message || typeof message !== 'object') return null
  const keys = Object.keys(message).filter((key) => !key.startsWith('contextInfo'))
  if (keys.length === 1) return keys[0]
  const primary = keys.find((key) =>
    ['conversation', 'extendedTextMessage', 'imageMessage', 'videoMessage', 'documentMessage'].includes(key)
  )
  return primary ?? keys[0] ?? null
}

export function normalizeMessage(rawMessage, options = {}) {
  const isEnvelope = rawMessage && typeof rawMessage === 'object' && 'key' in rawMessage
  const message = isEnvelope ? rawMessage.message ?? null : rawMessage ?? null
  const key = rawMessage?.key ?? {}
  const chat = key.remoteJid ?? null
  const isGroup = typeof chat === 'string' && chat.endsWith('@g.us')
  const sender = key.participant ?? (isGroup ? null : chat)
  const fromMe = Boolean(key.fromMe)
  const type = resolveMessageType(message)
  const txt = resolveMessageText(message)
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
