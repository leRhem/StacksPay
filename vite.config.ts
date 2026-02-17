import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    proxy: {
      // Proxy Stacks testnet API calls through the dev server to bypass CORS
      '/api/stacks-testnet': {
        target: 'https://api.testnet.hiro.so',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stacks-testnet/, ''),
        secure: true,
      },
      '/api/stacks-mainnet': {
        target: 'https://api.hiro.so',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/stacks-mainnet/, ''),
        secure: true,
      },
    },
  },
})
