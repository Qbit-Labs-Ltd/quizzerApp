import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react({
      // This tells the React plugin to include JS files for JSX transformation
      include: "**/*.{jsx,js}"
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.json']
  },
  // Fix the esbuild configuration - remove the incorrect loader syntax
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})