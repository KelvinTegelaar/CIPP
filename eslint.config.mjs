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
      // JSX must live in .jsx files: vite 8's oxc transform (vitest/storybook)
      // decides JSX handling purely by file extension
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx'] }],
    },
  },
  {
    // csf meta is an anonymous default export by convention
    files: ['tests/**/*.stories.jsx', '.storybook/**'],
    rules: {
      'import/no-anonymous-default-export': 'off',
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
