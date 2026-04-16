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
      includeAssets: ['evac.png', 'map.png', 'sms.png', 'hazard.png', 'rescue.png', 'logo-black-192x192.png', 'logo-black-512x512.png', 'logo-1c1c1e.png'],
      manifest: {
        name: 'Tabang', 
        short_name: 'Tabang',
        description: 'Disaster Response Coordination and Incident Reporting Platform',
        theme_color: '#1c1c1e', 
        background_color: '#f4f4f5',
        display: 'standalone', 
        icons: [
          {
            src: 'logo-black-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: 'logo-black-1024x1024.png',
            sizes: '1024x1024',
            type: 'image/png',
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
