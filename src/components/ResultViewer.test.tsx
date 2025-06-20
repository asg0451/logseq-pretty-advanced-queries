import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'

import ResultViewer from './ResultViewer'

// A basic smoke test ensuring the viewer renders without runtime errors
// and displays the passed result string.
describe('ResultViewer', () => {
  it('renders result text and copy button', () => {
    const sample = '{"hello": "world"}'
    render(<ResultViewer result={sample} />)

    // Ensures that the "Copy" button and the JSON text appear in the document.
    expect(screen.getByRole('button', { name: /copy/i })).toBeInTheDocument()
    expect(screen.getByText(sample)).toBeInTheDocument()
  })

  it('renders nothing when result is empty', () => {
    const { container } = render(<ResultViewer result="" />)
    expect(container.firstChild).toBeNull()
  })
})
