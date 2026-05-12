import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react()],
    base: env.VITE_BASE_HREF || '/',
    server: {
      port: 5173,
      proxy: {
        // local dev: proxy /admin, /products, /uploads, etc. → API
        '/admin': env.VITE_API_BASE_URL || 'http://localhost:8001',
        '/banners': env.VITE_API_BASE_URL || 'http://localhost:8001',
        '/categories': env.VITE_API_BASE_URL || 'http://localhost:8001',
        '/products': env.VITE_API_BASE_URL || 'http://localhost:8001',
        '/services': env.VITE_API_BASE_URL || 'http://localhost:8001',
        '/uploads': env.VITE_API_BASE_URL || 'http://localhost:8001',
        '/static': env.VITE_API_BASE_URL || 'http://localhost:8001',
        '/media': env.VITE_API_BASE_URL || 'http://localhost:8001',
      },
    },
  };
});
