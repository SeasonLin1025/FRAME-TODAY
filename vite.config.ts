import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base './' 保证产物在任意前缀（含 /s/{appId}/）下相对解析
export default defineConfig({
  plugins: [react()],
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    chunkSizeWarningLimit: 4000,
  },
})
