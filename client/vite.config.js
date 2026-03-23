import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(), 
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['edited-logo.png', 'logo-192.png', 'logo-512.png', 'logo-black-192.png', 'logo-black-512.png'],
      manifest: {
        name: 'Tabang', 
        short_name: 'Tabang',
        description: 'Disaster Response Coordination and Incident Reporting Platform',
        theme_color: '#f4f4f5', 
        background_color: '#1c1c1e',
        display: 'standalone', 
        icons: [
          {
            src: 'logo-black-192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-black-512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      workbox: {
        maximumFileSizeToCacheInBytes: 5000000, 
      }
    })
  ],
  server: {
    allowedHosts: true
  }
})
