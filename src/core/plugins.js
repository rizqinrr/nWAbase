import { watch as watchFileSystem } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { pathToFileURL } from 'node:url'

const BOOLEAN_METADATA = [
  'ownerOnly',
  'groupOnly',
  'privateOnly',
  'adminOnly',
  'botAdminOnly',
  'typing',
  'wait'
]

export class PluginError extends Error {
  constructor(code, message, details = {}) {
    super(message)
    this.name = 'PluginError'
    this.code = code
    this.details = details
  }
}

function createScanError(error, code, message, details = {}) {
  if (error instanceof PluginError) return error
  return new PluginError(code, message, {
    ...details,
    cause: error?.code ?? error?.name ?? 'UNKNOWN_ERROR'
  })
}

function normalizeTriggerValues(value, field) {
  if (value === undefined) return []
  const values = Array.isArray(value) ? value : [value]
  if (!values.every((item) => typeof item === 'string')) {
    throw new PluginError('INVALID_TRIGGER', `${field} must be a string or array of strings`, { field })
  }

  const normalized = values.map((item) => item.trim().toLowerCase())
  if (normalized.some((item) => item.length === 0)) {
    throw new PluginError('INVALID_TRIGGER', `${field} must not contain an empty trigger`, { field })
  }

  return normalized
}

export function validatePlugin(plugin, file = '<unknown>') {
  if (!plugin || typeof plugin !== 'object' || Array.isArray(plugin)) {
    throw new PluginError('INVALID_PLUGIN', `plugin in ${file} must default export an object`, { file })
  }

  if (typeof plugin.execute !== 'function') {
    throw new PluginError('INVALID_EXECUTE', `plugin in ${file} must define an execute function`, { file })
  }

  const commands = normalizeTriggerValues(plugin.command, 'command')
  if (commands.length === 0) {
    throw new PluginError('INVALID_COMMAND', `plugin in ${file} must define at least one command trigger`, { file })
  }

  const aliases = [
    ...normalizeTriggerValues(plugin.alias, 'alias'),
    ...normalizeTriggerValues(plugin.aliases, 'aliases')
  ]

  const seen = new Map()
  const registerTrigger = (trigger, field) => {
    if (seen.has(trigger)) {
      throw new PluginError('DUPLICATE_TRIGGER', `duplicate trigger "${trigger}" in ${file}`, {
        trigger,
        file,
        field,
        firstField: seen.get(trigger)
      })
    }
    seen.set(trigger, field)
  }
  for (const trigger of commands) registerTrigger(trigger, 'command')
  for (const trigger of aliases) registerTrigger(trigger, 'alias')
  const triggers = [...seen.keys()]

  for (const field of BOOLEAN_METADATA) {
    if (plugin[field] !== undefined && typeof plugin[field] !== 'boolean') {
      throw new PluginError('INVALID_METADATA', `${field} in ${file} must be a boolean`, { file, field })
    }
  }

  return { plugin, file, triggers }
}

export function createPluginRegistry() {
  const triggers = new Map()
  const metadata = new Map()

  return {
    add(plugin, file) {
      const validated = validatePlugin(plugin, file)
      for (const trigger of validated.triggers) {
        if (triggers.has(trigger)) {
          throw new PluginError('DUPLICATE_TRIGGER', `duplicate plugin trigger: ${trigger}`, {
            trigger,
            file,
            existingFile: metadata.get(trigger)?.file
          })
        }
      }
      for (const trigger of validated.triggers) {
        triggers.set(trigger, plugin)
        metadata.set(trigger, validated)
      }
      return validated
    },
    get(trigger) {
      if (typeof trigger !== 'string') return undefined
      return triggers.get(trigger.trim().toLowerCase())
    },
    getMetadata(trigger) {
      if (typeof trigger !== 'string') return undefined
      return metadata.get(trigger.trim().toLowerCase())
    },
    has(trigger) {
      return this.get(trigger) !== undefined
    },
    entries() {
      return triggers.entries()
    },
    values() {
      return [...new Set(triggers.values())]
    },
    get size() {
      return triggers.size
    }
  }
}

export async function findPluginFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true })
  const files = []

  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await findPluginFiles(path)))
    if (entry.isFile() && extname(entry.name) === '.js') files.push(path)
  }

  return files
}

export async function scanPlugins(directory, options = {}) {
  const registry = createPluginRegistry()
  const errors = []
  const scanVersion = String(options.version ?? Date.now())
  let files = []

  try {
    files = await findPluginFiles(directory)
  } catch (error) {
    return {
      registry,
      errors: [createScanError(error, 'PLUGIN_SCAN_FAILED', `unable to scan plugin directory`, { directory: relative(process.cwd(), directory) })],
      files,
      ok: false
    }
  }

  let ok = true
  for (const file of files) {
    try {
      const url = pathToFileURL(file)
      if (options.cacheBust !== false) url.searchParams.set('v', scanVersion)
      const module = options.importer ? await options.importer(url.href, file) : await import(url.href)
      registry.add(module.default, relative(directory, file))
    } catch (error) {
      errors.push(createScanError(error, 'PLUGIN_LOAD_FAILED', `unable to load plugin ${relative(directory, file)}`, {
        file: relative(directory, file)
      }))
      ok = false
    }
  }

  return { registry, errors, files, ok }
}

export function createPluginManager(options = {}) {
  if (typeof options.directory !== 'string' || !options.directory.trim()) {
    throw new PluginError('INVALID_DIRECTORY', 'plugin directory must be a non-empty string')
  }

  const directory = options.directory
  let activeRegistry = options.registry ?? createPluginRegistry()
  let watcher = null
  let debounceTimer = null
  let lifecycleGeneration = 0
  let reloadGeneration = 0

  const reload = async () => {
    const generation = ++reloadGeneration
    const lifecycle = lifecycleGeneration
    const candidate = await scanPlugins(directory, options)
    if (lifecycle !== lifecycleGeneration || generation !== reloadGeneration) {
      return { registry: activeRegistry, errors: [], swapped: false, stale: true }
    }
    if (!candidate.ok) {
      return { registry: activeRegistry, errors: candidate.errors, swapped: false }
    }
    activeRegistry = candidate.registry
    return { registry: activeRegistry, errors: [], swapped: true }
  }

  const load = async () => {
    const candidate = await scanPlugins(directory, options)
    if (!candidate.ok) {
      throw new PluginError('PLUGIN_LOAD_FAILED', 'unable to load plugin registry', {
        errors: candidate.errors.map((error) => error.code ?? 'UNKNOWN_ERROR')
      })
    }
    activeRegistry = candidate.registry
    return candidate
  }

  const startWatching = () => {
    if (!options.watchPlugins || watcher) return false
    const watch = options.watch ?? watchFileSystem
    const generation = ++lifecycleGeneration
    const onChange = () => {
      if (!watcher || generation !== lifecycleGeneration) return
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        if (!watcher || generation !== lifecycleGeneration) return
        reload().then((result) => {
          if (!result.swapped && !result.stale) options.onError?.(result.errors)
        }).catch((error) => options.onError?.([error]))
      }, options.debounceMs ?? 50)
    }

    try {
      watcher = watch(directory, { recursive: true }, onChange)
      watcher.on?.('error', (error) => {
        if (watcher && generation === lifecycleGeneration) options.onError?.([error])
      })
      return true
    } catch (error) {
      options.onError?.([error])
      watcher = null
      return false
    }
  }

  const closeWatcher = () => {
    lifecycleGeneration += 1
    clearTimeout(debounceTimer)
    debounceTimer = null
    watcher?.close()
    watcher = null
  }

  return {
    reload,
    load,
    startWatching,
    closeWatcher,
    get registry() {
      return activeRegistry
    },
    get watching() {
      return watcher !== null
    }
  }
}
