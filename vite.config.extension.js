import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'

// Chrome Extension build configuration
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist-extension',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        background: resolve(__dirname, 'public/background.js')
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js'
        },
        chunkFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]'
      }
    },
    target: 'es2015', // Chrome extension compatibility
    minify: 'terser',
    sourcemap: false // Disable sourcemaps for production extension
  },
  define: {
    // Chrome extension environment
    'process.env.NODE_ENV': '"production"',
    'process.env.CHROME_EXTENSION': 'true'
  },
  server: {
    port: 5173,
    host: true
  }
})
