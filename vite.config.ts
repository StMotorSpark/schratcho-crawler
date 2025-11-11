import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Set base path for GitHub Pages deployment
  // When GITHUB_PAGES env var is set, use repository name as base path
  base: process.env.GITHUB_PAGES === 'true' ? '/schratcho-crawler/' : '/',
})
