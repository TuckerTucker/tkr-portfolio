import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 42001,
    host: true,
    cors: true
  },
  preview: {
    port: 42001,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@services': resolve(__dirname, './src/services'),
      '@views': resolve(__dirname, './src/views'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types')
    }
  },
  define: {
    // Environment variables
    __DEV__: JSON.stringify(process.env.NODE_ENV === 'development')
  }
})