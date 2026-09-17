import assert from 'node:assert/strict'
import test from 'node:test'

import { normalizeMessage } from '../src/core/message.js'
import {
  captionMessage,
  groupTextMessage,
  privateTextMessage,
  quotedMessage
} from './fixtures/messages.js'

test('normalizes a private text message', () => {
  const message = normalizeMessage(privateTextMessage)

  assert.equal(message.id, 'private-1')
  assert.equal(message.chat, '6281111111111@s.whatsapp.net')
  assert.equal(message.sender, '6281111111111@s.whatsapp.net')
  assert.equal(message.fromMe, false)
  assert.equal(message.isGroup, false)
  assert.equal(message.text, 'Halo bot')
  assert.equal(message.type, 'conversation')
  assert.deepEqual(message.mentions, [])
  assert.equal(message.quoted, null)
})

test('normalizes a group message with mentions', () => {
  const message = normalizeMessage(groupTextMessage)

  assert.equal(message.chat, '120363000000000000@g.us')
  assert.equal(message.isGroup, true)
  assert.equal(message.sender, '6282222222222@s.whatsapp.net')
  assert.equal(message.text, 'Halo @6283333333333')
  assert.deepEqual(message.mentions, ['6283333333333@s.whatsapp.net'])
})

test('extracts media caption and mentions from contextInfo', () => {
  const message = normalizeMessage(captionMessage)

  assert.equal(message.text, 'Foto laporan')
  assert.equal(message.type, 'imageMessage')
  assert.deepEqual(message.mentions, ['6286666666666@s.whatsapp.net'])
})

test('exposes quoted message metadata', () => {
  const message = normalizeMessage(quotedMessage)

  assert.equal(message.quoted.id, 'original-1')
  assert.equal(message.quoted.sender, '6284444444444@s.whatsapp.net')
  assert.equal(message.quoted.text, 'Pesan asli')
  assert.equal(message.quoted.type, 'conversation')
})

test('handles invalid input safely', () => {
  const withoutMessage = normalizeMessage({ key: { id: 'x', remoteJid: null } })
  assert.equal(withoutMessage.text, '')
  assert.equal(withoutMessage.sender, null)
  assert.deepEqual(withoutMessage.mentions, [])
  assert.equal(withoutMessage.quoted, null)

  const empty = normalizeMessage(null)
  assert.equal(empty.id, null)
  assert.equal(empty.text, '')
})

test('reply sends text via socket and group admin metadata is lazy', async () => {
  const sent = []
  const capturedQuoted = {}
  const fakeSock = {
    user: { id: '6285555555555@s.whatsapp.net' },
    sendMessage: async (chatId, payload, options) => {
      sent.push({ chatId, payload, options })
      capturedQuoted.quotedMessage = options?.quoted
      return { key: { id: 'sent-1' } }
    },
    groupMetadata: async () => ({
      participants: [
        { id: '6282222222222@s.whatsapp.net', admin: 'admin' },
        { id: '6285555555555@s.whatsapp.net', admin: 'superadmin' }
      ]
    })
  }

  const message = normalizeMessage(groupTextMessage, { sock: fakeSock })
  await message.reply('Pong!')

  assert.equal(sent.length, 1)
  assert.equal(sent[0].payload.text, 'Pong!')
  assert.deepEqual(sent[0].payload, { text: 'Pong!' })
  assert.equal(await message.isAdmin, true)
  assert.equal(await message.isBotAdmin, true)
  assert.equal(message.raw === groupTextMessage, true)
})