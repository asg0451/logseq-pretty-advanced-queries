// Vitest alias shim that re-exports prettier/standalone but with the `format`
// function defined as a normal, configurable property so that `vi.spyOn()` can
// stub it during tests.
import * as real from 'prettier/standalone.mjs'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const format = (real as any).format

// Re-export everything else unchanged.
export * from 'prettier/standalone.mjs'

export default {
  ...real,
  format,
}
