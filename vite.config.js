import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: { port: 5183, host: '127.0.0.1' },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
    rollupOptions: {
      output: {
        manualChunks: {
          three: ['three'],
          r3f: ['@react-three/fiber', '@react-three/drei'],
          motion: ['gsap', 'lenis'],
        },
      },
    },
  },
})
