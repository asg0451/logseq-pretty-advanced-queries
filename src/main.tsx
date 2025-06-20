import { StrictMode } from 'react'
// Import the official Logseq plugin API which initialises the global `logseq`
// variable and provides the `logseq.ready()` handshake.
import '@logseq/libs'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

function mountApp() {
  const container = document.getElementById('root')!
  if (!container.hasChildNodes()) {
    createRoot(container).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  }

  // After the React tree is mounted we can hook Logseq-only features if present.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ls = (globalThis as any).logseq

  console.log(`mountApp; ${ls}`)

  if (ls?.App) {
    // Expose a command that Logseq can call from the toolbar template.
    ls.provideModel?.({
      openAdvancedQueryEditor() {
        // Show the plugin's main UI iframe/panel.
        ls.showMainUI?.()
      },
    })

    // Register the toolbar icon HTML. We rely on Tabler Icons which Logseq already bundles.
    ls.App.registerUIItem?.('toolbar', {
      key: 'advanced-query-editor',
      template:
        '<a data-on-click="openAdvancedQueryEditor" class="button" title="Advanced Query Editor"><i class="ti ti-code"></i></a>',
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Runtime environments
// ─────────────────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
declare const logseq: any | undefined

// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof globalThis !== 'undefined' && (globalThis as any).logseq) {
  // Inside Logseq → wait for the plugin handshake before mounting.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ;(globalThis as any).logseq.ready(() => mountApp()).catch(console.error)
} else {
  console.log('standalone')
  // Stand-alone / sandbox → mount immediately.
  mountApp()
}
