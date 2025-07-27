import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'
import { copyFileSync, mkdirSync, existsSync } from 'fs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Chrome Extension build configuration
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-extension-files',
      writeBundle() {
        // Copy background.js directly without processing
        copyFileSync(
          resolve(__dirname, 'public/background.js'),
          resolve(__dirname, 'dist-extension/background.js')
        )
        
        // Copy manifest.json
        copyFileSync(
          resolve(__dirname, 'public/manifest.json'),
          resolve(__dirname, 'dist-extension/manifest.json')
        )
        
        // Copy icons directory
        const iconsDir = resolve(__dirname, 'dist-extension/icons')
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true })
        }
        
        // Copy PNG icons
        const iconSizes = ['16', '32', '48', '128']
        iconSizes.forEach(size => {
          const srcPath = resolve(__dirname, `public/icons/icon-${size}.png`)
          const destPath = resolve(__dirname, `dist-extension/icons/icon-${size}.png`)
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath)
          }
        })
        
        // Copy other assets
        const assetsToCore = ['logo.svg', 'favicon.svg']
        assetsToCore.forEach(asset => {
          const srcPath = resolve(__dirname, `public/${asset}`)
          const destPath = resolve(__dirname, `dist-extension/${asset}`)
          if (existsSync(srcPath)) {
            copyFileSync(srcPath, destPath)
          }
        })
      }
    }
  ],
  build: {
    outDir: 'dist-extension',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html')
      },
      output: {
        entryFileNames: 'assets/[name]-[hash].js',
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
        format: 'iife' // Use IIFE format for Chrome extension compatibility
      }
    },
    target: 'es2015',
    minify: 'terser',
    sourcemap: false
  },
  define: {
    'process.env.NODE_ENV': '"production"',
    'process.env.CHROME_EXTENSION': 'true'
  }
})
