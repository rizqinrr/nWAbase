import assert from 'node:assert/strict'
import test from 'node:test'

import { requestPairing } from '../src/core/connection.js'

test('uses the first configured owner number for pairing', async () => {
  const calls = []
  const code = await requestPairing({
    sock: {
      requestPairingCode(number, customCode) {
        calls.push([number, customCode])
        return Promise.resolve('1234-5678')
      }
    },
    settings: {
      usePairingCode: true,
      owners: ['628123@s.whatsapp.net'],
      pairingCode: ''
    }
  })

  assert.equal(code, '1234-5678')
  assert.deepEqual(calls, [['628123', undefined]])
})

test('asks for a number when no owner is configured', async () => {
  const prompts = []
  const calls = []

  await requestPairing({
    sock: {
      requestPairingCode(number) {
        calls.push(number)
        return Promise.resolve('code')
      }
    },
    settings: { usePairingCode: true, owners: [], pairingCode: '' },
    askPhoneNumber(prompt) {
      prompts.push(prompt)
      return Promise.resolve('+62 812-3456')
    }
  })

  assert.equal(prompts.length, 1)
  assert.deepEqual(calls, ['628123456'])
})

test('falls back to an automatic pairing code when custom code is rejected', async () => {
  const calls = []
  const sock = {
    requestPairingCode(number, customCode) {
      calls.push([number, customCode])
      if (customCode) return Promise.reject(new Error('rejected'))
      return Promise.resolve('automatic')
    }
  }

  const code = await requestPairing({
    sock,
    settings: {
      usePairingCode: true,
      owners: ['628123'],
      pairingCode: 'CUSTOM123'
    }
  })

  assert.equal(code, 'automatic')
  assert.deepEqual(calls, [
    ['628123', 'CUSTOM123'],
    ['628123', undefined]
  ])
})

test('skips pairing when disabled or credentials are registered', async () => {
  let called = false
  const sock = {
    requestPairingCode() {
      called = true
    }
  }

  assert.equal(await requestPairing({ sock, settings: { usePairingCode: false } }), null)
  assert.equal(
    await requestPairing({ sock, settings: { usePairingCode: true }, registered: true }),
    null
  )
  assert.equal(called, false)
})

test('rejects an invalid prompted phone number', async () => {
  for (const phoneNumber of ['not-a-number', '123', '081234567890', '1'.repeat(16)]) {
    await assert.rejects(
      requestPairing({
        sock: { requestPairingCode() {} },
        settings: { usePairingCode: true, owners: [] },
        askPhoneNumber: async () => phoneNumber
      }),
      /valid phone number/i
    )
  }
})

test('falls back to prompt when configured owners are blank', async () => {
  const numbers = []

  await requestPairing({
    sock: {
      requestPairingCode(number) {
        numbers.push(number)
        return Promise.resolve('code')
      }
    },
    settings: { usePairingCode: true, owners: ['  '], pairingCode: '' },
    askPhoneNumber: async () => '6281233456'
  })

  assert.deepEqual(numbers, ['6281233456'])
})
