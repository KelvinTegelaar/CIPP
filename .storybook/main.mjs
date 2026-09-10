import path from 'node:path'
import { fileURLToPath } from 'node:url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type { import('@storybook/react-vite').StorybookConfig } */
const config = {
  stories: ['../tests/**/*.mdx', '../tests/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-docs',
    '@storybook/addon-themes',
    '@storybook/addon-vitest',
    'msw-storybook-addon',
  ],
  features: {
    sidebarOnboardingChecklist: false,
  },
  core: {
    disableWhatsNewNotifications: true,
  },
  framework: '@storybook/react-vite',
  async viteFinal(config) {
    return {
      ...config,
      plugins: [
        ...(config.plugins || []),
        {
          // Real Microsoft auth can't run in Storybook (MSAL popups, device codes),
          // so every import of CIPPM365OAuthButton resolves to a mock that reports
          // instant auth success. Relative imports can't be object-alias'd, hence a
          // resolveId hook instead of an entry in resolve.alias below.
          name: 'cipp-mock-m365-oauth-button',
          enforce: 'pre',
          resolveId(source) {
            if (source.endsWith('CippComponents/CIPPM365OAuthButton')) {
              return path.resolve(dirname, '../tests/mocks/cipp-m365-oauth-button.jsx')
            }
          },
        },
      ],
      resolve: {
        ...config.resolve,
        // CIPP is a Next.js app but uses @storybook/react-vite because @storybook/nextjs
        // doesn't work with this project. These aliases replace Next.js modules with
        // lightweight mocks so components render without a Next.js runtime.
        alias: {
          ...config.resolve?.alias,
          'next/dynamic': path.resolve(dirname, '../tests/mocks/next-dynamic.jsx'),
          'next/router': path.resolve(dirname, '../tests/mocks/next-router.js'),
          'next/navigation': path.resolve(dirname, '../tests/mocks/next-navigation.js'),
          'next/head': path.resolve(dirname, '../tests/mocks/next-head.js'),
          'next/image': path.resolve(dirname, '../tests/mocks/next-image.js'),
          'next/link': path.resolve(dirname, '../tests/mocks/next-link.js'),
        },
      },
      define: {
        ...(config.define || {}),
        // Next.js components reference process.env and global, these don't exist in a
        // pure Vite browser context, so we shim them to avoid ReferenceErrors.
        'process.env': '{}',
        global: 'window',
      },
      build: {
        ...config.build,
        rollupOptions: {
          ...config.build?.rollupOptions,
          onwarn(warning, warn) {
            // Suppress "use client" directive warnings from React Server Components-aware
            // libraries (e.g. @mui/material). These directives are harmless in Storybook
            // since everything runs client-side, but Rollup treats them as errors.
            if (warning.code === 'MODULE_LEVEL_DIRECTIVE') return
            warn(warning)
          },
        },
      },
    }
  },
  staticDirs: ['../public'],
}

export default config
