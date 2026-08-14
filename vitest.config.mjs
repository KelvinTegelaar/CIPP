import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextAliases = {
  // stub for mui-tiptap's uninstalled required peer, see mocks/tiptap-extension-image.js
  '@tiptap/extension-image': path.resolve(dirname, 'tests/mocks/tiptap-extension-image.js'),
  'next/dynamic': path.resolve(dirname, 'tests/mocks/next-dynamic.js'),
  'next/router': path.resolve(dirname, 'tests/mocks/next-router.js'),
  'next/navigation': path.resolve(dirname, 'tests/mocks/next-navigation.js'),
  'next/head': path.resolve(dirname, 'tests/mocks/next-head.js'),
  'next/image': path.resolve(dirname, 'tests/mocks/next-image.js'),
  'next/link': path.resolve(dirname, 'tests/mocks/next-link.js'),
}

// vitest gives every module its own cjs `require`, which shadows the globalThis polyfill in
// tests/mocks/require-context.js. jsdom only - the browser project has no local require
const requireContextPlugin = {
  name: 'cipp-require-context',
  enforce: 'pre',
  transform(code, id) {
    if (id.includes('/node_modules/') || !code.includes('require.context(')) {
      return null
    }
    // lookbehind so an already-prefixed call isn't rewritten to globalThis.globalThis.require
    return {
      code: code.replace(/(?<![.\w$])require\.context\(/g, 'globalThis.require.context('),
      map: null,
    }
  },
}

export default defineConfig({
  esbuild: {
    jsx: 'automatic',
    jsxImportSource: 'react',
    loader: 'jsx',
    include: /(src|tests|\.storybook)\/.*\.(js|jsx)$/,
    exclude: [],
  },
  resolve: { alias: nextAliases },
  define: { 'process.env': '{}' },
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'text-summary'],
      reportsDirectory: './coverage',
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/components/**/index.js'],
    },
    projects: [
      {
        plugins: [requireContextPlugin],
        resolve: { alias: nextAliases },
        define: { 'process.env': '{}' },
        esbuild: {
          jsx: 'automatic',
          jsxImportSource: 'react',
          loader: 'jsx',
          include: /(src|tests|\.storybook)\/.*\.(js|jsx)$/,
          exclude: [],
        },
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.js'],
          include: ['tests/**/*.test.{js,jsx}'],
          css: false,
          teardownTimeout: 5000,
          forceExit: true,
        },
      },
      {
        plugins: [storybookTest({ configDir: path.resolve(dirname, '.storybook') })],
        resolve: { alias: nextAliases },
        define: { 'process.env': '{}' },
        optimizeDeps: {
          include: [
            'react',
            'react-dom',
            'react/jsx-dev-runtime',
            'react-redux',
            '@reduxjs/toolkit',
            '@tanstack/react-query',
            '@mui/material/styles',
            '@mui/material',
            '@mui/system',
            'material-react-table',
            'msw/browser',
            'msw-storybook-addon/csf3',
          ],
          esbuildOptions: {
            jsx: 'automatic',
            loader: { '.js': 'jsx' },
          },
        },
        test: {
          name: 'storybook',
          globals: true,
          setupFiles: ['./.storybook/vitest.setup.js'],
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            // dockerized runs (cipp-storybook) have the default 64MB /dev/shm, which
            // chromium exhausts on heavier story trees and dies mid-run - use /tmp
            instances: [
              { browser: 'chromium', launch: { args: ['--disable-dev-shm-usage'] } },
            ],
          },
        },
      },
    ],
  },
})
