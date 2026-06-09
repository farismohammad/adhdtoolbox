import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const ttsProxyTarget = env.VITE_TTS_PROXY_TARGET?.replace(/\/$/, '')

  return {
    plugins: [react(), tailwindcss()],
    server: ttsProxyTarget
      ? {
          proxy: {
            '/api': {
              target: ttsProxyTarget,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, ''),
            },
          },
        }
      : undefined,
  }
})
