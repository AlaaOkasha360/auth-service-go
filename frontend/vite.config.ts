import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // In development the browser talks to Vite, which forwards /api to the Go server.
    // This keeps requests same-origin, so CORS is only needed for separate deployments.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
