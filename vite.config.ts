import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  // Disable automatic copying of /public since the single-file output embeds
  // everything and we want *only* index.html in dist.
  publicDir: false,
  build: {
    rollupOptions: {
      // Bundle all deps so Logseq can resolve module specifiers at runtime.
      // No other output tweaks — vite-plugin-singlefile handles chunk inlining.
    },
  },
})
