import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
    },
    proxy: {
      '/api/auth': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/api/matchmaking': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://localhost:8080',
        ws: true,
      },
      '/api/state': 'http://localhost:5000',
      '/api/reset': 'http://localhost:5000',
      '/api/models': 'http://localhost:5000',
      '/api/move': 'http://localhost:5000',
      '/api/ai_move': 'http://localhost:5000',
    }
  }
})
