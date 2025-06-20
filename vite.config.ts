import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), viteSingleFile()],
  // Disable automatic copying of /public since the single-file output embeds
  // everything and we want *only* index.html in dist.
  publicDir: false,
  server: {
    // When running the dev server (`pnpm run dev`) open the standalone page so we
    // can develop the UI outside of Logseq.
    open: '/index.standalone.html',
  },
  build: {
    rollupOptions: {
      // Bundle all deps so Logseq can resolve module specifiers at runtime.
      // No other output tweaks — vite-plugin-singlefile handles chunk inlining.
      //
      // Explicitly set the HTML entry so that only `index.html` is processed in
      // the production bundle.  The standalone page is used purely for local
      // development and testing.
      input: 'index.html',
    },
  },
})
