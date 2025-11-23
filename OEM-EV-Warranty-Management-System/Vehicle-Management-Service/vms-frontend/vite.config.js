import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// Cấu hình Alias (@/) và Plugins
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Alias @/ trỏ đến thư mục src/
      '@': path.resolve(__dirname, './src'), 
    },
  },
})