import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [react()],

  server: {
    host: '127.0.0.1',
    port: 3000,
    strictPort: true,

    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },

      '/actuator': {
        target: 'http://127.0.0.1:8080',
        changeOrigin: true,
      },

      '/ws': {
        target: 'ws://127.0.0.1:8080',
        changeOrigin: true,
        ws: true,
      },
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: [
      './src/test/setup.ts',
    ],
    clearMocks: true,
    restoreMocks: true,
  },
})