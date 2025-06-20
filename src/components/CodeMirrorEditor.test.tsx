import { describe, expect, it } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { fireEvent, screen } from '@testing-library/react'
import { useState } from 'react'

import CodeMirrorEditor from './CodeMirrorEditor'

// A simple smoke test to verify the editor can mount without runtime errors.
describe('CodeMirrorEditor', () => {
  it('mounts a CodeMirror instance', async () => {
    const { container } = render(
      <CodeMirrorEditor value={'(println "hello")'} />,
    )

    // Wait until the editor view is attached to DOM
    await waitFor(() => {
      expect(container.querySelector('.cm-editor')).toBeTruthy()
    })
  })
})

// Add test to ensure the editor is not remounted (loses focus) on value updates.
function Harness() {
  const [value, setValue] = useState('(println "hi")')
  return (
    <>
      <CodeMirrorEditor value={value} onChange={setValue} />
      {/* Button to force external value change, simulating parent re-render */}
      <button data-testid="bump" onClick={() => setValue(prev => prev + ' ')}>
        bump
      </button>
    </>
  )
}

describe('CodeMirrorEditor stability', () => {
  it('does not remount the editor when value prop changes', async () => {
    const { container } = render(<Harness />)

    // Initial editor element
    const initialEditor = container.querySelector('.cm-editor')
    expect(initialEditor).toBeTruthy()

    // Trigger parent state update that changes `value` prop.
    fireEvent.click(screen.getByTestId('bump'))

    // Wait for DOM updates
    await waitFor(() => {
      const editorAfter = container.querySelector('.cm-editor')
      expect(editorAfter).toBe(initialEditor)
    })
  })
})
