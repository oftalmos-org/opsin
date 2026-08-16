import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_URL || 'http://localhost:8106'

  return {
    plugins: [react()],
    server: {
      port: 8006,
      strictPort: true,
      proxy: {
        '/api/remote': {
          target: backendTarget,
          changeOrigin: true,
        },
        '/ws/remote': {
          target: backendTarget,
          ws: true,
          changeOrigin: true,
        },
      },
    },
  }
})
