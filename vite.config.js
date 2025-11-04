import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/metamask-score/',
  server: {
    proxy: {
      '/api/1inch': {
        target: 'https://api.1inch.dev',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/1inch/, ''),
        headers: {
          'Authorization': 'Bearer demo-key', // 開發環境使用 demo key
        },
      },
    },
  },
})

