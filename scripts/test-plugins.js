import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { scanPlugins } from '../src/core/plugins.js'

const pluginDirectory = process.argv[2]
  ? resolve(process.argv[2])
  : fileURLToPath(new URL('../plugins/', import.meta.url))

try {
  await access(pluginDirectory)
  const result = await scanPlugins(pluginDirectory)

  for (const error of result.errors) {
    console.error(`[${error.code}] ${error.message}`)
  }

  if (!result.ok) process.exitCode = 1

  console.log(`Loaded ${result.registry.values().length} plugin(s) with ${result.registry.size} trigger(s).`)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
