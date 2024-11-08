import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'; // if this doesn't work run npm install -D @types/node

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@shared': path.resolve(__dirname, './shared')
    }
  }
})
