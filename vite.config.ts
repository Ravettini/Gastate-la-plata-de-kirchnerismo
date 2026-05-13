import 'dotenv/config'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createRequire } from 'node:module'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { dashboardVitePlugin } from './server/dashboard-vite-plugin.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const require = createRequire(import.meta.url)

/** Ruta real a la carpeta del paquete `leaflet` (evita fallos de resolución en Vite con subpaths). */
function leafletPackageDir(): string {
  return path.dirname(require.resolve('leaflet/package.json'))
}

const leafletDir = leafletPackageDir()

export default defineConfig({
  plugins: [react(), dashboardVitePlugin()],
  resolve: {
    alias: [
      {
        find: /^leaflet\/dist\/(.*)$/,
        replacement: `${path.resolve(leafletDir, 'dist')}/$1`,
      },
    ],
  },
  optimizeDeps: {
    include: ['leaflet', 'react-leaflet'],
  },
})
