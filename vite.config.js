import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'

// https://vite.dev/config/
export default defineConfig({
  base: '/', // Use root path for custom domain
  plugins: [
    react(),
    {
      name: 'copy-storybook',
      closeBundle() {
        // Copy storybook-static to dist/storybook during build
        const srcDir = path.resolve(__dirname, 'storybook-static')
        const destDir = path.resolve(__dirname, 'dist/storybook')
        
        if (fs.existsSync(srcDir)) {
          // Create destination directory
          fs.mkdirSync(destDir, { recursive: true })
          
          // Copy files recursively
          const copyRecursive = (src, dest) => {
            const stat = fs.statSync(src)
            if (stat.isDirectory()) {
              fs.mkdirSync(dest, { recursive: true })
              fs.readdirSync(src).forEach(file => {
                copyRecursive(path.join(src, file), path.join(dest, file))
              })
            } else {
              fs.copyFileSync(src, dest)
            }
          }
          
          copyRecursive(srcDir, destDir)
          console.log('Storybook files copied to dist/storybook')
        }
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  preview: {
    port: 4173,
    strictPort: true,
    host: true
  }
})
