import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const config = [
  {
    ignores: ['.next/**', 'node_modules/**', '.local/**', 'attached_assets/**'],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      // performance.now() in useRef initialiser is a common FPS-counter
      // pattern; it only runs once on mount, not on every render.
      '@typescript-eslint/no-explicit-any': 'warn',
      // Allow unused vars that start with _ (intentional ignores)
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
]

export default config
