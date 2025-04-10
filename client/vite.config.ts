// @ts-nocheck
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Cargar variables de entorno según el modo (development, production)
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
      strictPort: true,
      cors: true,
      hmr: {
        clientPort: 5173
      },
      watch: {
        usePolling: true,
      },
      // Permitir hosts específicos
      allowedHosts: [
        'localhost',
        '127.0.0.1',
        'pesito.orellanamatias.com.ar',
        env.HOST_IP || 'localhost'
      ],
      proxy: {
        '/api': {
          target: env.NODE_ENV === 'production' 
            ? `http://backend:3000`
            : `http://localhost:${env.BACKEND_PORT || 3000}`,
          changeOrigin: true,
          secure: false
        }
      }
    }
  }
})
