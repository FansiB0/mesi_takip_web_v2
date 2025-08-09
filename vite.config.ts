import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages için base path (repository adı)
  base: process.env.NODE_ENV === 'production' ? '/mesi_takip_web_v2/' : '/',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
    minify: 'esbuild',
  },
  server: {
    // Development server için CORS ayarları
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  },
  define: {
    // Global değişkenler
          __USE_SUPABASE__: JSON.stringify(true),
  },
});
