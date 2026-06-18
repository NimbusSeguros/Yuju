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
<<<<<<< HEAD
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

=======
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
>>>>>>> dfbac8d (UI Refinement: standardized result cards, mobile optimization, and fixed AutoCotizador layout)
