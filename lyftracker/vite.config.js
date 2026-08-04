import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `base` is set for GitHub Pages project sites (served under /testing/).
// It is overridable via the BASE_PATH env var and defaults to './' locally so
// the build also works on StackBlitz and when opened directly.
export default defineConfig({
  base: process.env.BASE_PATH || './',
  plugins: [react()],
})
