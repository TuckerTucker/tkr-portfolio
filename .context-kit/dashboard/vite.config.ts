import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 42001,
    strictPort: true,
    host: true
  },
  preview: {
    port: 42001,
    strictPort: true,
    host: true
  }
})
