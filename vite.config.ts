import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  build: {
    lib: {
      entry: 'src/main.tsx',
      formats: ['iife'],
      name: 'main',
    },
    rollupOptions: {
      // Ensure React is bundled since Logseq will load the single file in its own environment
      external: [],
    },
  },
})
