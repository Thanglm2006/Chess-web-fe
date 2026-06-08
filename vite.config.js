import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép các thiết bị khác trong cùng Wi-Fi truy cập
    hmr: {
      protocol: 'ws',
    },
    proxy: {
      '/api/state': 'http://localhost:5000',
      '/api/reset': 'http://localhost:5000',
      '/api/models': 'http://localhost:5000',
      '/api/move': 'http://localhost:5000',
      '/api/ai_move': 'http://localhost:5000',
      '/api': {
        target: 'https://chess.caelestial.store',
        changeOrigin: true,
      },
      '/ws': {
        target: 'ws://chess.caelestial.store',
        ws: true,
      }
    }
  }
})
