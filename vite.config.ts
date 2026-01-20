import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['favicon.svg', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'btcwheel',
        short_name: 'btcwheel',
        description: 'Impara la Bitcoin Wheel Strategy con gamification e AI tutor',
        theme_color: '#34d399',
        background_color: '#0f172a',
        display: 'standalone',
        orientation: 'portrait',
        icons: [
          {
            src: '/icons/icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-128x128.png',
            sizes: '128x128',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-152x152.png',
            sizes: '152x152',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-384x384.png',
            sizes: '384x384',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ],
        categories: ["education", "finance"],
        screenshots: [
          {
            src: "/screenshots/dashboard.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow"
          },
          {
            src: "/screenshots/lesson.png",
            sizes: "540x720",
            type: "image/png",
            form_factor: "narrow"
          }
        ],
        shortcuts: [
          {
            name: "Dashboard",
            short_name: "Dashboard",
            description: "Vai alla dashboard principale",
            url: "/",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
          },
          {
            name: "Simulatore",
            short_name: "Trading",
            description: "Apri il simulatore di trading",
            url: "/?view=simulation",
            icons: [{ src: "/icons/icon-96x96.png", sizes: "96x96" }]
          }
        ]
      },
      workbox: {
        cleanupOutdatedCaches: true,
        sourcemap: true
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    target: 'esnext',
    outDir: 'build',
  },
  server: {
    port: 3000,
    open: true,
    // Proxy per evitare CORS con le API Pionex
    proxy: {
      '/api/pionex': {
        target: 'https://api.pionex.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/pionex/, ''),
        secure: true,
      },
    },
  },
});