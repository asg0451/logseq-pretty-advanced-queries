import { useState, useCallback } from 'react'
import './App.css'
import CodeMirrorEditor from './components/CodeMirrorEditor'
import { runQuery } from './utils/queryRunner'
import ResultViewer from './components/ResultViewer'

function App() {
  // Seed the editor with a comprehensive advanced-query template that showcases the new functionality.
  const [code, setCode] = useState(`{:title "Advanced Query Example"
 :query [:find ?b :where [?b :block/refs #{"TODO"}]]
 :view "table"
 :collapsed false}`)

  const [result, setResult] = useState<string>('')
  const [isRunning, setIsRunning] = useState(false)

  const execute = useCallback(async () => {
    try {
      setIsRunning(true)
      const pretty = await runQuery(code)
      setResult(pretty)
    } catch (err) {
      setResult(`Error: ${(err as Error).message}`)

      console.error(err)
    } finally {
      setIsRunning(false)
    }
  }, [code])

  const handleClose = useCallback(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logseq = (globalThis as any).logseq

    if (logseq?.hideMainUI) {
      // Running inside Logseq - hide the plugin UI to return to main Logseq interface
      logseq.hideMainUI()
    } else {
      // Running standalone - show message or close window if possible
      const shouldClose = window.confirm('Close the Advanced Query Editor?')
      if (shouldClose) {
        window.close()
      }
    }
  }, [])

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto' }}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
        }}
      >
        <h1 style={{ textAlign: 'center', margin: 0, flex: 1 }}>
          Advanced Query Editor (Sandbox)
        </h1>
        <button
          type="button"
          onClick={handleClose}
          style={{
            background: 'none',
            border: '1px solid #ccc',
            borderRadius: '4px',
            padding: '0.5rem',
            cursor: 'pointer',
            fontSize: '16px',
            lineHeight: 1,
          }}
          title="Close and return to Logseq"
        >
          ✕
        </button>
      </div>
      <CodeMirrorEditor value={code} onChange={setCode} onRun={execute} />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={execute} disabled={isRunning}>
          {isRunning ? 'Running…' : 'Run'}
        </button>
      </div>

      <ResultViewer result={result} />
    </main>
  )
}

export default App
