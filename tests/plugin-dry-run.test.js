import assert from 'node:assert/strict'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import test from 'node:test'

const script = fileURLToPath(new URL('../scripts/test-plugins.js', import.meta.url))
const validDirectory = fileURLToPath(new URL('../plugins', import.meta.url))
const invalidDirectory = fileURLToPath(new URL('./fixtures/plugins', import.meta.url))

test('plugin dry-run reports plugin and trigger totals', () => {
  const result = spawnSync(process.execPath, [script, validDirectory], { encoding: 'utf8' })

  assert.equal(result.status, 0)
  assert.match(result.stdout, /Loaded 1 plugin\(s\) with 2 trigger\(s\)\./)
})

test('plugin dry-run exits nonzero for invalid plugins', () => {
  const result = spawnSync(process.execPath, [script, invalidDirectory], { encoding: 'utf8' })

  assert.equal(result.status, 1)
  assert.match(result.stderr, /\[(?:INVALID_COMMAND|DUPLICATE_TRIGGER)\]/)
})
