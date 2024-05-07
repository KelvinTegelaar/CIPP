import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import browserslistToEsbuild from 'browserslist-to-esbuild'
// eslint-disable-next-line import/default
import eslint from 'vite-plugin-eslint'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      // if any eslint warnings, allow build to complete
      // errors will fail the build
      ...eslint({
        failOnWarning: false,
      }),
      apply: 'build',
    },
    {
      // in dev mode, still allow build to complete
      ...eslint({
        failOnError: false,
        failOnWarning: false,
      }),
      apply: 'serve',
      enforce: 'post',
    },
  ],
  build: {
    outDir: 'build',
    assetsDir: 'static',
    target: browserslistToEsbuild(),
    // enable source map for debugging
    sourcemap: true,
  },
  server: {
    port: 3000,
    // since swa is bound to this port, kill the dev server if it's in use
    strictPort: true,
    host: true,
  },
  resolve: {
    // needed for importing using absolute paths
    alias: {
      src: resolve('src/'),
    },
  },
})
