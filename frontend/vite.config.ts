import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    server: {
        proxy: {
            // when frontend calls `/api/...`, proxy it to your backend
            '/api': {
                target: 'https://automatic-pancake-wrrpg66ggvj535gq-8080.app.github.dev',
                changeOrigin: true,                
            },
        },
    },
})
