import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import browserslistToEsbuild from 'browserslist-to-esbuild'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
    assetsDir: 'static',
    target: browserslistToEsbuild(),
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
