import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    allowedHosts: ['solitario.l-lab.cl'],
  },
  preview: {
    host: true,
  },
  build: {
    chunkSizeWarningLimit: 1300,
  },
})
