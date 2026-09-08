import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 2000 },
  resolve: {
    alias: {
      'firebase/app': path.resolve(__dirname, 'src/firebase.js'),
      'firebase/auth': path.resolve(__dirname, 'src/firebase.js'),
      'firebase/firestore': path.resolve(__dirname, 'src/firebase.js'),
      'firebase/analytics': path.resolve(__dirname, 'src/firebase.js'),
    },
  },
})
