import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
plugins: [react()],
// server: {
//   proxy: {
//     "/backend": {
//       target: "https://automatic-pancake-wrrpg66ggvj535gq-8080.app.github.dev",
//       changeOrigin: true,
//       secure: false,
//       rewrite: (path) => path.replace(/^\/backend/, "")
//     }
//   }
// }
})
