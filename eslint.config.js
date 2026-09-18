import js from '@eslint/js'
import { defineConfig } from 'eslint/config'
import globals from 'globals'

export default defineConfig([
  {
    ignores: ['node_modules/**', 'store/**', 'coverage/**', 'dist/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    },
    rules: {
      'no-console': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }]
    }
  }
])
