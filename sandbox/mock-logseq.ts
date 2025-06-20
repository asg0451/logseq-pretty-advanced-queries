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

// A minimal mock for the `App` namespace to satisfy plugin integrations that
// register toolbar items. The real Logseq host injects HTML into its UI; here
// we just log the registration call so that tests & the sandbox don't crash.
export interface LogseqApp {
  registerUIItem: (
    slot: string,
    opts: { key: string; template: string },
  ) => void
}

export interface Logseq {
  DB: LogseqDB
  UI: LogseqUI
  App: LogseqApp
  showMainUI: () => void
  provideModel: (model: Record<string, unknown>) => void
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

const App: LogseqApp = {
  registerUIItem(slot, opts) {
    console.info('[mock-logseq] App.registerUIItem', slot, opts)
  },
}

function showMainUI() {
  console.info('[mock-logseq] showMainUI called')
}

function provideModel(model: Record<string, unknown>) {
  console.info('[mock-logseq] provideModel called', model)
}

export const logseq: Logseq = {
  DB,
  UI,
  App,
  showMainUI,
  provideModel,
}

// Provide a default export to mirror the global logseq variable that plugins
// receive at runtime.
export default logseq
