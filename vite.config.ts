import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/teaching-2026.ss.prse.braeuer.team5/', // <--- dein Repo-Name
  plugins: [react()],
})
