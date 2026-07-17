import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const apiProxyTarget =
    env.VITE_API_TARGET ||
    env.VITE_API_BASE_URL ||
    'https://api.life-design.me'

  return {
    plugins: [react()],
    // 默认 /admin/ 供后端子路径部署；Vercel 独立域名在 vercel.json 中设为 /
    base: env.VITE_BASE_PATH || '/admin/',
    server: {
      port: 5173,
      strictPort: true,
      proxy: {
        '/api': {
          // 优先使用线上后端，本地未起服务时也可测试添加/编辑肯定语
          target: apiProxyTarget,
          changeOrigin: true,
        }
      }
    }
  }
})

