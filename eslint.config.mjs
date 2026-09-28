import nextVitals from 'eslint-config-next/core-web-vitals'
import nextTs from 'eslint-config-next/typescript'
import prettier from 'eslint-config-prettier/flat'
import {defineConfig, globalIgnores} from 'eslint/config'

const eslintConfig = defineConfig([
  ...nextVitals,
  prettier,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    '.yarn/**',
    'assets/**',
    'out/**',
    'public/**',
    'build/**',
    'next-env.d.ts'
  ])
])

export default eslintConfig
