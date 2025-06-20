import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
  resolve: {
    alias: {
      // Provide a lightweight shim for Prettier during tests so that Vitest can
      // spy on `format` without hitting the non-configurable accessor exported
      // by the real module. The shim lazily imports the actual Prettier at
      // runtime and re-exports it with a plain function value.
      'prettier/standalone': path.resolve(__dirname, 'vitest-prettier-shim.ts'),
    },
  },
})
