import assert from 'node:assert/strict'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

import ping from '../plugins/example/ping.js'
import { scanPlugins } from '../src/core/plugins.js'
import { formatUptime } from '../src/utils/index.js'

test('plugin loader loads ping command and alias', async () => {
  const result = await scanPlugins(fileURLToPath(new URL('../plugins', import.meta.url)))

  assert.equal(result.ok, true)
  assert.equal(result.registry.get('ping').name, ping.name)
  assert.equal(result.registry.get('p').name, ping.name)
})

test('ping plugin replies with status and uptime', async () => {
  const replies = []
  const message = {
    reply(value) {
      replies.push(value)
      return Promise.resolve()
    }
  }

  await ping.execute(message, {})

  assert.equal(replies.length, 1)
  assert.match(replies[0], /^Pong! Bot aktif\.\nUptime: \d+h \d+m \d+s$/)
  assert.equal(formatUptime(0), '0h 0m 0s')
})
