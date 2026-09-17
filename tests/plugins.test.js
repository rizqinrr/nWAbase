import assert from 'node:assert/strict'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'

import { createPluginRegistry, scanPlugins } from '../src/core/plugins.js'

test('loads valid plugins recursively and preserves aliases', async () => {
  const result = await scanPlugins(join(process.cwd(), 'tests/fixtures/plugins'))

  assert.equal(result.registry.get('root').name, 'root')
  assert.equal(result.registry.get('hello').name, 'valid')
  assert.equal(result.registry.get('hi').name, 'valid')
  assert.equal(result.registry.get('second').name, 'second')
  assert.equal(result.registry.has('empty'), false)
  assert.ok(result.errors.length >= 2)
})

test('reports cross-file duplicate trigger without replacing the candidate entry', async () => {
  const result = await scanPlugins(join(process.cwd(), 'tests/fixtures/plugins'))
  const duplicate = result.errors.find((error) => error.code === 'DUPLICATE_TRIGGER')

  assert.ok(duplicate)
  assert.equal(duplicate.details.trigger, 'hello')
  assert.equal(duplicate.details.file.replaceAll('\\', '/'), 'nested/z-duplicate.js')
  assert.equal(result.registry.get('hello').name, 'valid')
})

test('skips invalid modules without stopping the scan', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'nwabase-plugins-'))
  await mkdir(join(directory, 'nested'))
  await writeFile(join(directory, 'invalid.js'), 'export default { command: [], execute() {} }')
  await writeFile(join(directory, 'valid.js'), 'export default { command: "ok", execute() {} }')

  try {
    const result = await scanPlugins(directory)
    assert.equal(result.registry.get('ok').command, 'ok')
    assert.equal(result.errors.length, 1)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('candidate registry rejects duplicate triggers while retaining prior registry', () => {
  const registry = createPluginRegistry()
  registry.add({ command: 'existing', execute() {} }, 'existing.js')

  assert.throws(() => registry.add({ command: 'existing', execute() {} }, 'duplicate.js'), /duplicate/i)
  assert.equal(registry.get('existing').command, 'existing')
})
