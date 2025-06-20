// Minimal mocked subset of the Logseq plugin API scoped for the sandbox development harness.
// The real API surface is much larger – we only implement what the plugin needs at this stage.
/* eslint-disable @typescript-eslint/no-explicit-any */

import { blocks } from './seed'

export interface LogseqDB {
  /**
   * Execute a DataScript/advanced query against the in-memory database. In the
   * real Logseq API this returns an array of tuples. For the mock we just return
   * the entire dataset for now so that the UI can render something.
   */
  datascriptQuery: (query: any) => Promise<any[]>
}

// We don't need any UI-specific typings yet; represent as an empty object type
// to appease the `@typescript-eslint/no-empty-object-type` rule.
export type LogseqUI = Record<string, never>

export interface Logseq {
  DB: LogseqDB
  UI: LogseqUI
}

// ────────────────────────────────────────────────────────────────────────────
// Implementation
// ────────────────────────────────────────────────────────────────────────────

const DB: LogseqDB = {
  datascriptQuery: async (query: any) => {
    // Naive implementation: echo the query alongside a copy of the seeded
    // blocks so that the caller can observe the round-trip. Replace with a real
    // DataScript engine later once needed.
    console.info('[mock-logseq] datascriptQuery executed', query)
    return Promise.resolve(blocks)
  },
}

// Empty UI stub – extend when we start integrating toolbar & modals.
const UI: LogseqUI = {}

export const logseq: Logseq = {
  DB,
  UI,
}

// Provide a default export to mirror the global logseq variable that plugins
// receive at runtime.
export default logseq
