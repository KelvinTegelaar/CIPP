import { defineConfig, globalIgnores } from 'eslint/config'
import eslintConfigNext from 'eslint-config-next'
import eslintConfigPrettier from 'eslint-config-prettier'

/** @type {import('eslint').Linter.Config[]} */
const eslintConfig = defineConfig([
  ...eslintConfigNext,
  eslintConfigPrettier,
  {
    rules: {
      'no-unused-vars': 'off',
      // this rule is annoying on strings with quotes in them
      'react/no-unescaped-entities': 'off',
      'jsx-a11y/alt-text': 'off',
      '@next/next/no-img-element': 'off',
      '@next/next/no-page-custom-font': 'off',
      'react/display-name': 'off',
      'react/no-children-prop': 'off',
      'react/jsx-max-props-per-line': [
        0,
        {
          maximum: 10,
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    '.next/**',
    'out/**',
    'build/**',
    'next-env.d.ts',
  ]),
])

export default eslintConfig
