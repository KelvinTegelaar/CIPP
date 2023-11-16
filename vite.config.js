import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'build',
  },
  server: {
    port: 3000,
    host: true,
  },
  resolve: {
    // needed for importing using absolute paths
    alias: {
      src: resolve('src/'),
    },
  },
})
