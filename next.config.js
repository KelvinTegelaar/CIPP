const disableOptimizePackageImports = process.env.NEXT_DISABLE_OPTIMIZE_PACKAGE_IMPORTS === '1'

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
  experimental: {
    optimizePackageImports: disableOptimizePackageImports
      ? []
      : [
          '@mui/material',
          '@mui/icons-material',
          '@mui/lab',
          '@mui/system',
          '@mui/x-date-pickers',
          'material-react-table',
          'mui-tiptap',
          'recharts',
          '@react-pdf/renderer',
        ],
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
    turbopackFileSystemCacheForDev: false,
    turbopackMemoryLimit: 4096,
  },
  images: {
    unoptimized: true,
  },
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  async redirects() {
    return []
  },
  output: 'export',
  distDir: './out',
}

module.exports = config
