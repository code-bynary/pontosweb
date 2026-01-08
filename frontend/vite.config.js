import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: 5173,
        host: '0.0.0.0', // Listen on all network interfaces
        cors: true,      // Enable CORS on the dev server
        allowedHosts: true, // Allow all hosts to prevent "Invalid Host header" errors
        proxy: {
            '/api': {
                target: 'http://localhost:3001',
                changeOrigin: true
            }
        }
    }
})
