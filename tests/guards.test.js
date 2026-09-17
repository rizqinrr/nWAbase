import assert from 'node:assert/strict'
import test from 'node:test'

import { checkPluginGuards } from '../src/core/handler.js'

const baseMessage = {
  sender: '6281111111111@s.whatsapp.net',
  isGroup: false,
  isAdmin: Promise.resolve(false),
  isBotAdmin: Promise.resolve(false)
}

test('allows owner-only plugin for normalized owner number', async () => {
  const result = await checkPluginGuards({ ownerOnly: true }, baseMessage, {
    owners: ['6281111111111']
  })
  assert.deepEqual(result, { allowed: true, isOwner: true })
})

test('denies owner-only plugin without exposing owner data', async () => {
  const result = await checkPluginGuards({ ownerOnly: true }, baseMessage, {
    owners: ['6289999999999']
  })
  assert.equal(result.allowed, false)
  assert.equal(result.message, 'Perintah ini hanya untuk owner.')
  assert.equal(result.message.includes('628'), false)
})

test('enforces group-only and private-only guards', async () => {
  assert.equal((await checkPluginGuards({ groupOnly: true }, baseMessage, {})).allowed, false)
  assert.equal((await checkPluginGuards({ privateOnly: true }, baseMessage, {})).allowed, true)
  assert.equal((await checkPluginGuards({ privateOnly: true }, { ...baseMessage, isGroup: true }, {})).allowed, false)
})

test('awaits sender and bot admin status', async () => {
  const groupMessage = {
    ...baseMessage,
    isGroup: true,
    isAdmin: Promise.resolve(true),
    isBotAdmin: Promise.resolve(true)
  }
  assert.equal((await checkPluginGuards({ adminOnly: true }, groupMessage, {})).allowed, true)
  assert.equal((await checkPluginGuards({ botAdminOnly: true }, groupMessage, {})).allowed, true)
  assert.equal((await checkPluginGuards({ adminOnly: true }, { ...groupMessage, isAdmin: Promise.resolve(false) }, {})).allowed, false)
})

test('rejects contradictory group and private guards', async () => {
  const result = await checkPluginGuards({ groupOnly: true, privateOnly: true }, baseMessage, {})
  assert.equal(result.allowed, false)
  assert.equal(result.message, 'Konfigurasi plugin tidak valid.')
})
