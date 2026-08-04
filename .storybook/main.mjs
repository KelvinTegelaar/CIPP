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
      resolve: {
        ...config.resolve,
        // CIPP is a Next.js app but uses @storybook/react-vite because @storybook/nextjs
        // doesn't work with this project. These aliases replace Next.js modules with
        // lightweight mocks so components render without a Next.js runtime.
        alias: {
          ...config.resolve?.alias,
          // stub for mui-tiptap's uninstalled required peer @tiptap/extension-image
          '@tiptap/extension-image': path.resolve(
            dirname,
            '../tests/mocks/tiptap-extension-image.js',
          ),
          'next/dynamic': path.resolve(dirname, '../tests/mocks/next-dynamic.js'),
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
      esbuild: {
        ...config.esbuild,
        // The codebase uses .js files with JSX syntax. Vite's default esbuild loader
        // only handles JSX in .jsx files, so we override the loader for all .js files.
        jsx: 'automatic',
        jsxImportSource: 'react',
        loader: 'jsx',
        include: /(src|tests|\.storybook)\/.*\.(js|jsx)$/,
        exclude: [],
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
      optimizeDeps: {
        ...config.optimizeDeps,
        // Same JSX-in-.js fix as above, but for Vite's dependency pre-bundling step
        // (esbuild runs separately for optimizeDeps vs transform).
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          jsx: 'automatic',
          jsxImportSource: 'react',
          loader: {
            '.js': 'jsx',
            '.jsx': 'jsx',
          },
        },
      },
    }
  },
  staticDirs: ['../public'],
}

export default config
