import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/guerrillamail': {
        target: 'https://api.guerrillamail.com/ajax.php',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/guerrillamail/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            proxyReq.setHeader('Accept', 'application/json');
            proxyReq.setHeader('Cache-Control', 'no-cache');
          });
        }
      }
    }
  }
});