import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  base: '/',
  // Sello de build visible en la UI para verificar de un vistazo si el cliente
  // está en la versión fresca o cacheada.
  define: {
    __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')),
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@db': path.resolve(__dirname, '../packages/database/src'),
      '@ui': path.resolve(__dirname, '../packages/ui/src'),
      '@config': path.resolve(__dirname, '../packages/config/src'),
    },
  },
  server: {
    port: 3000,
    host: true,
    allowedHosts: 'all',
  },
  build: {
    chunkSizeWarningLimit: 1000,
    sourcemap: true,
  },
  // Este proyecto usa rolldown-vite (oxc), no esbuild. En producción marca
  // console.log/info/debug como "pure" para que se eliminen por dead-code
  // (mantiene console.error/warn para que Sentry siga capturando errores).
  oxc: {
    drop: process.env.NODE_ENV === 'production' ? ['debugger'] : [],
    pure: process.env.NODE_ENV === 'production' ? ['console.log', 'console.info', 'console.debug'] : [],
  },
})
