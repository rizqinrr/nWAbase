import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import test from 'node:test'

import { createPluginManager, createPluginRegistry } from '../src/core/plugins.js'

test('initial load fails fast without activating a partial registry', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tests', 'tmp-reload-'))
  await writeFile(join(directory, 'valid.js'), 'export default { command: "valid", execute() {} }')
  await writeFile(join(directory, 'broken.js'), 'export default { command: [], execute() {} }')
  const active = createPluginRegistry()
  active.add({ command: 'active', execute() {} }, 'active.js')

  try {
    const manager = createPluginManager({ directory, registry: active, watchPlugins: false })
    await assert.rejects(() => manager.load(), (error) => {
      assert.equal(error.code, 'PLUGIN_LOAD_FAILED')
      return true
    })
    assert.equal(manager.registry.get('active').command, 'active')
    assert.equal(manager.registry.get('valid'), undefined)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('keeps active registry when reload candidate has an error', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tests', 'tmp-reload-'))
  const active = createPluginRegistry()
  active.add({ command: 'active', execute() {} }, 'active.js')
  await writeFile(join(directory, 'broken.js'), 'export default { command: [], execute() {} }')

  try {
    const manager = createPluginManager({ directory, registry: active, watchPlugins: false })
    const result = await manager.reload()
    assert.equal(result.swapped, false)
    assert.equal(manager.registry.get('active').command, 'active')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('swaps registry only when every plugin is valid', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tests', 'tmp-reload-'))
  await writeFile(join(directory, 'next.js'), 'export default { command: "next", execute() {} }')
  const active = createPluginRegistry()
  active.add({ command: 'active', execute() {} }, 'active.js')

  try {
    const manager = createPluginManager({ directory, registry: active, watchPlugins: false })
    const result = await manager.reload()
    assert.equal(result.swapped, true)
    assert.equal(manager.registry.get('next').command, 'next')
    assert.equal(manager.registry.get('active'), undefined)
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('ignores stale reload results and results after watcher close', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tests', 'tmp-reload-'))
  const active = createPluginRegistry()
  active.add({ command: 'active', execute() {} }, 'active.js')
  await writeFile(join(directory, 'plugin.js'), 'export default {}')
  const resolvers = []
  const importer = async () => new Promise((resolve) => {
    resolvers.push(resolve)
  })
  const waitForResolvers = async (count) => {
    const deadline = Date.now() + 2000
    while (resolvers.length < count) {
      assert.ok(Date.now() < deadline, 'importer did not start before timeout')
      await new Promise((resolve) => setTimeout(resolve, 1))
    }
  }

  try {
    const manager = createPluginManager({ directory, registry: active, watchPlugins: false, importer })
    const first = manager.reload()
    const second = manager.reload()
    await waitForResolvers(2)
    resolvers[1]({ default: { command: 'latest', execute() {} } })
    resolvers[0]({ default: { command: 'stale', execute() {} } })
    await Promise.all([first, second])
    assert.equal(manager.registry.get('latest').command, 'latest')

    const pending = manager.reload()
    await waitForResolvers(3)
    manager.closeWatcher()
    resolvers[2]({ default: { command: 'closed', execute() {} } })
    const result = await pending
    assert.equal(result.swapped, false)
    assert.equal(manager.registry.get('latest').command, 'latest')
  } finally {
    await rm(directory, { recursive: true, force: true })
  }
})

test('rejects invalid manager directory and reports watcher startup failure', () => {
  assert.throws(() => createPluginManager(), /plugin directory/)
  const errors = []
  const manager = createPluginManager({
    directory: 'plugins',
    watchPlugins: true,
    watch: () => {
      throw new Error('watch unavailable')
    },
    onError: (received) => errors.push(...received)
  })

  assert.equal(manager.startWatching(), false)
  assert.equal(errors[0].message, 'watch unavailable')
})

test('watcher reports reload errors without replacing active registry', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tests', 'tmp-reload-'))
  await writeFile(join(directory, 'broken.js'), 'export default { command: [], execute() {} }')
  const errors = []
  let onChange
  const manager = createPluginManager({
    directory,
    watchPlugins: true,
    debounceMs: 5,
    watch: (_path, _options, callback) => {
      onChange = callback
      return { close() {} }
    },
    onError: (received) => errors.push(...received)
  })

  try {
    assert.equal(manager.startWatching(), true)
    onChange('change', 'broken.js')
    await new Promise((resolve) => setTimeout(resolve, 30))
    assert.equal(errors[0].code, 'INVALID_COMMAND')
    assert.equal(manager.registry.size, 0)
  } finally {
    manager.closeWatcher()
    await rm(directory, { recursive: true, force: true })
  }
})

test('forwards asynchronous watcher errors without crashing', () => {
  const errors = []
  let watcherError
  const watcher = {
    on: (event, callback) => {
      if (event === 'error') watcherError = callback
    },
    close() {}
  }
  const manager = createPluginManager({
    directory: 'plugins',
    watchPlugins: true,
    watch: () => watcher,
    onError: (received) => errors.push(...received)
  })

  assert.equal(manager.startWatching(), true)
  watcherError(new Error('watcher failed'))
  assert.equal(errors[0].message, 'watcher failed')
  manager.closeWatcher()
})

test('watcher callback reloads with debounce and ignores events after close', async () => {
  const directory = await mkdtemp(join(process.cwd(), 'tests', 'tmp-reload-'))
  await writeFile(join(directory, 'next.js'), 'export default { command: "next", execute() {} }')
  let onChange
  let reloadCount = 0
  const manager = createPluginManager({
    directory,
    watchPlugins: true,
    debounceMs: 5,
    watch: (_path, _options, callback) => {
      onChange = callback
      return { close() {} }
    }
  })

  try {
    assert.equal(manager.startWatching(), true)
    onChange('change', 'next.js')
    onChange('change', 'next.js')
    await new Promise((resolve) => setTimeout(resolve, 30))
    reloadCount += manager.registry.has('next') ? 1 : 0
    assert.equal(reloadCount, 1)
    manager.closeWatcher()
    onChange('change', 'next.js')
    await new Promise((resolve) => setTimeout(resolve, 15))
    assert.equal(manager.registry.has('next'), true)
  } finally {
    manager.closeWatcher()
    await rm(directory, { recursive: true, force: true })
  }
})
