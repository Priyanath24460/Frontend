import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/upload-contract-with-cases': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/preprocess-text': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/analyze-contract-risks': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/detect-contract-type': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/analyze-clauses': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/api/v1': {
        target: 'http://localhost:8002',
        changeOrigin: true,
      },
      // Route analyze-specific requests to the remote analyze API
      '/api/analyze': {
        target: 'https://analyze-api.pasindi.me',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api\/analyze/, ''),
        proxyTimeout: 300000,
      },
      // Keep generic /api routes pointing to local backend
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  }
})
