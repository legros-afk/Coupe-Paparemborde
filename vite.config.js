import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',       // nouvelle version activée au rechargement suivant
      manifest: false,                  // public/manifest.json existe déjà
      includeAssets: ['icon-192.png', 'icon-512.png', 'manifest.json', 'art/*.png'],
      workbox: {
        // ne jamais intercepter les helpers d'auth Firebase
        navigateFallbackDenylist: [/^\/__/],
        runtimeCaching: [
          {
            // drapeaux : cache-first, quasi immuables
            urlPattern: /^https:\/\/flagcdn\.com\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'flags',
              expiration: { maxEntries: 80, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
})
