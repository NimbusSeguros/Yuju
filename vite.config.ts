import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // ⚠️ SECURITY: Especificar hosts permitidos explícitamente
    allowedHosts: ['localhost', '127.0.0.1'],
    proxy: {
      // Desarrollo local: todas las rutas van al backend en localhost:3000
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

