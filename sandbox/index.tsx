import React from 'react'
import ReactDOM from 'react-dom/client'
import '../src/index.css'
import App from '../src/App'

// The mock Logseq API needs to be initialised before the plugin UI mounts so
// that any plugin code can import it as a side-effect.
import './mock-logseq'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
