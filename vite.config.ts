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
      '/api/(rus|infoauto|atm|integrity|propuestas|polizas|auth|localidades)': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\/moto/, '/api')
      },
      // Note: we can also just proxy /api to localhost:3000 but it might conflict if Yuju has other APIs.
      // So let's proxy the specific routes needed by the Moto backend.
      '/api/rus': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/infoauto': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/atm': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/integrity': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/sancristobal': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/vehiculos': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/localidades': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/ramos': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/cotizaciones': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/propuesta': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/propuestas': { target: 'http://localhost:3000', changeOrigin: true },
      '/api/polizas': { target: 'http://localhost:3000', changeOrigin: true }
    }
  }
})
