import { defineConfig } from 'vitest/config'
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin'
import { playwright } from '@vitest/browser-playwright'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const nextAliases = {
  'next/dynamic': path.resolve(dirname, 'tests/mocks/next-dynamic.jsx'),
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
        test: {
          name: 'unit',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['./vitest.setup.js'],
          include: ['tests/**/*.test.{js,jsx}'],
          css: false,
          // the suite is import-bound: isolating each test file re-imports the whole
          // module graph (~5x the time spent in tests), threads + shared context cut
          // the unit wall clock by more than half. shared context means globals, DOM,
          // and storage survive across files in a worker; vitest.setup.js resets them
          pool: 'threads',
          isolate: false,
          // vite 8's transform pipeline imports modules noticeably slower than
          // vite 7's esbuild did; interaction-heavy tests need the headroom
          // (the coverage script already runs with --testTimeout=30000)
          testTimeout: 15000,
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
        },
        test: {
          name: 'storybook',
          globals: true,
          setupFiles: ['./.storybook/vitest.setup.js'],
          // same vite 8 slowdown headroom as the unit project: the heaviest
          // interaction stories exceed the 15s browser-mode default when the
          // whole suite shares one chromium instance. Must stay above the 30s
          // asyncUtilTimeout in .storybook/vitest.setup.js so a slow waitFor
          // reports its own error instead of a bare test timeout
          testTimeout: 60000,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            // all story files run in one shared chromium page, per-file iframe
            // setup is the suite's dominant cost. msw-storybook-addon re-registers
            // handlers per story, so request mocking stays scoped
            isolate: false,
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
