import { useEffect, useRef, useState } from 'react'

interface ResultViewerProps {
  /**
   * Pre-formatted JSON string returned by the query runner. An empty string hides the viewer.
   */
  result: string
}

/**
 * Displays query results inside a scrollable <pre> block. Whenever the `result`
 * prop changes, the viewer scrolls to the bottom. A small copy-to-clipboard
 * button lets users quickly grab the JSON payload.
 */
export default function ResultViewer({ result }: ResultViewerProps) {
  const preRef = useRef<HTMLPreElement>(null)
  const [copied, setCopied] = useState(false)

  // Auto-scroll to bottom whenever new results arrive.
  useEffect(() => {
    const node = preRef.current
    if (node) node.scrollTop = node.scrollHeight
  }, [result])

  // Show nothing when there is no result to render
  if (!result) return null

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setCopied(true)
      // Revert feedback after a short delay
      setTimeout(() => setCopied(false), 1500)
    } catch {
      /* ignored */
    }
  }

  return (
    <div style={{ position: 'relative', marginTop: '1rem' }}>
      <button
        type="button"
        onClick={handleCopy}
        style={{
          position: 'absolute',
          top: 8,
          right: 8,
          padding: '0.25rem 0.5rem',
          fontSize: 12,
          cursor: 'pointer',
        }}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>

      <pre
        ref={preRef}
        className="result-viewer"
        style={{
          background: '#1e1e1e',
          color: '#d4d4d4',
          padding: '1rem',
          maxHeight: 400,
          overflow: 'auto',
          borderRadius: 4,
          whiteSpace: 'pre-wrap',
        }}
      >
        {result}
      </pre>
    </div>
  )
}
