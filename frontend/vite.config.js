import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
    hmr: false,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      // Proxy /cortes/* to the Cortes Studio Next.js app on port 3001
      // ws: true enables WebSocket proxying (needed for Next.js HMR / dev overlay)
      '/cortes': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      // Next.js HMR WebSocket can also connect on /_next/webpack-hmr (no basePath)
      '/_next': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        ws: true,
      },
      // Next.js font optimization serves fonts at /__nextjs_font/
      '/__nextjs_font': {
        target: 'http://localhost:3001',
        changeOrigin: true,
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
    strictPort: true,
    allowedHosts: true,
  },
  build: {
    chunkSizeWarningLimit: 2000,
    target: 'es2020',
  },
})
