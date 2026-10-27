import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Keep in sync with "paths" in tsconfig.app.json.
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
  server: {
    // In development the browser talks to Vite, which forwards /api to the Go server.
    // This keeps requests same-origin, so CORS is only needed for separate deployments.
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
})
