import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js',
  },
  server: {
    proxy: {
      // Forward all /api requests to the Flask backend in development
      '/api': {
        target: 'http://localhost:5555',
        changeOrigin: true,
      },
    },
  },
})
