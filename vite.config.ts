import { defineConfig } from 'vite'
import path from 'path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        // Usamos path.resolve directamente
        return path.resolve(process.cwd(), 'src/assets', filename)
      }
    },
  }
}

export default defineConfig({
  plugins: [
    figmaAssetResolver(),
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(process.cwd(), './src'),
      // Agregamos esta línea para forzar a Vite a encontrar el runtime de React
      'react/jsx-runtime': 'react/jsx-runtime.js',
    },
  },
  // Añadimos esto para asegurar que procese bien las dependencias en Vercel
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
})
