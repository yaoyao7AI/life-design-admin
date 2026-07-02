import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/admin/',  // 部署到 /admin 路径
  server: {
    port: 5175,  // 使用不同的端口，避免与用户前端冲突
    proxy: {
      '/api': {
        // 优先使用线上后端，本地未起服务时也可测试添加/编辑肯定语
        target: 'http://123.56.17.118:3000',
        changeOrigin: true,
      }
    }
  }
})

