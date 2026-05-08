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
    allowedHosts: true,
    proxy: {
      // Rutas de Moto
      '/api/rus': { target: 'https://apiyujumotos.com', changeOrigin: true },
      '/api/infoauto': { target: 'https://apiyujumotos.com', changeOrigin: true },
      '/api/atm': { target: 'https://apiyujumotos.com', changeOrigin: true },
      '/api/integrity': { target: 'https://apiyujumotos.com', changeOrigin: true },
      '/api/leads': { target: 'https://apiyujumotos.com', changeOrigin: true },
      '/api/san-cristobal': { target: 'https://apiyujumotos.com', changeOrigin: true },
      
      // Rutas de Auto / General
      '/api/auth': { target: 'https://www.api-yuju.com.ar', changeOrigin: true },
      '/api': {
        target: 'https://www.api-yuju.com.ar',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})
