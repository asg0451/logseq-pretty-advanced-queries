import { useState } from 'react'
import './App.css'
import CodeMirrorEditor from './components/CodeMirrorEditor'

function App() {
  // Seed the editor with a tiny advanced-query template.
  const [code, setCode] = useState(`{:title "Ad-hoc"
 :query [:find ?b :where [?b :block/refs #{"TODO"}]]}`)

  return (
    <main style={{ maxWidth: 800, margin: '2rem auto' }}>
      <h1 style={{ textAlign: 'center' }}>Advanced Query Editor (Sandbox)</h1>
      <CodeMirrorEditor value={code} onChange={setCode} />
    </main>
  )
}

export default App
