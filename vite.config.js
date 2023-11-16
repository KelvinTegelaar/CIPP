import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // default is dist
    outDir: 'build',
  },
  server: {
    port: 3000,
    host: true,
  },
  css: {
    preprocessorOptions: {
      sass: {
        additionalData: '',
        sassOptions: {
          quietDeps: true,
        },
      },
    },
  },
  resolve: {
    // needed for absolute paths
    alias: {
      src: resolve('src/'),
    },
  },
})
