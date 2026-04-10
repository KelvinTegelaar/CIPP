/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: false,
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
  experimental: {
    webpackMemoryOptimizations: true,
    preloadEntriesOnStart: false,
    turbopackFileSystemCacheForDev: false,
    turbopackMemoryLimit: 4096,
  },
  async redirects() {
    return []
  },
  output: 'export',
  distDir: './out',
}

module.exports = config
