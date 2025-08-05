import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/', // DigitalOcean用のベースパス（ルートドメイン）
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
  },
  server: {
    port: 3000,
    host: '0.0.0.0' // DigitalOceanでのホスト設定
  },
  preview: {
    port: 3000,
    host: '0.0.0.0'
  }
})
