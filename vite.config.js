import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo.jpg', 'background-gym.jpg'],
      manifest: {
        name: 'Pro Flex Fitness Gym',
        short_name: 'GymPro',
        description: 'Professional Gym Management System',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'logo.jpg',
            sizes: '192x192',
            type: 'image/jpeg'
          },
          {
            src: 'logo.jpg',
            sizes: '512x512',
            type: 'image/jpeg'
          }
        ]
      }
    })
  ],
  server: {
    port: 3000,
  },
})

