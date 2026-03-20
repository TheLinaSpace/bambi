import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import flare from 'flare-dev/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), flare()],
})
