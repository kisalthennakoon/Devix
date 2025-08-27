import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
//import * as fs from 'fs';


// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],

    server: {
        // https: {
        //     cert: fs.readFileSync('cert.pem'),
        //     key: fs.readFileSync('key.pem'),
        // },
        proxy: {
            // when frontend calls `/api/...`, proxy it to your backend
            
            '/api': {
                target: 'https://jubilant-umbrella-4jgxj65g9r5gf799g-8080.app.github.dev',
                changeOrigin: true,
            },
        },
    },
})
