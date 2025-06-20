import { useState, useCallback } from 'react'
import './App.css'
import CodeMirrorEditor from './components/CodeMirrorEditor'
import { runQuery } from './utils/queryRunner'

function App() {
  // Seed the editor with a tiny advanced-query template.
  const [code, setCode] = useState(`{:title "Ad-hoc"
 :query [:find ?b :where [?b :block/refs #{"TODO"}]]}`)

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

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h1 style={{ textAlign: 'center' }}>Advanced Query Editor (Sandbox)</h1>
      <CodeMirrorEditor value={code} onChange={setCode} onRun={execute} />

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button type="button" onClick={execute} disabled={isRunning}>
          {isRunning ? 'Running…' : 'Run'}
        </button>
      </div>

      {result && (
        <pre
          style={{
            background: '#1e1e1e',
            color: '#d4d4d4',
            padding: '1rem',
            marginTop: '1rem',
            maxHeight: 400,
            overflow: 'auto',
            borderRadius: 4,
          }}
        >
          {result}
        </pre>
      )}
    </main>
  )
}

export default App
