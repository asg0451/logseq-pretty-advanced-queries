import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// If running inside Logseq, register a toolbar button that opens the plugin UI panel.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
if (typeof globalThis !== 'undefined' && (globalThis as any).logseq?.App) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ls = (globalThis as any).logseq

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
