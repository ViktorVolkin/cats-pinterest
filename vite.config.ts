import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    plugins: [react()],
    server: {
      proxy: {
        '/images': 'http://localhost:3000',
        '/favourites': 'http://localhost:3000'
      }
    },
    define: {
      __API_BASE_URL__: JSON.stringify(env.VITE_API_BASE_URL || '')
    }
  }
})
