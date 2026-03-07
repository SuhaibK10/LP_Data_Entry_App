import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

/**
 * Vite Configuration
 *
 * - `host: true` exposes the dev server on the local network,
 *   allowing factory staff to test on their phones via http://<ip>:5173
 * - Default port 5173 is used; change if conflicts arise.
 */
export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
  },
})
