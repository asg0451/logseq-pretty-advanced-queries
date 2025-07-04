import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, waitFor } from '@testing-library/react'
import { fireEvent, screen } from '@testing-library/react'
import { useState } from 'react'

import CodeMirrorEditor from './CodeMirrorEditor'

// Import real prettier and plugin
import prettier from 'prettier/standalone'
import clojurePlugin from '@cospaia/prettier-plugin-clojure'

// A simple smoke test to verify the editor can mount without runtime errors.
describe('CodeMirrorEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mounts a CodeMirror instance', async () => {
    const { container } = render(
      <CodeMirrorEditor value={'(println "hello")'} />,
    )

    // Wait until the editor view is attached to DOM
    await waitFor(() => {
      expect(container.querySelector('.cm-editor')).toBeTruthy()
    })
  })

  it('renders format button', () => {
    render(<CodeMirrorEditor value="test code" />)

    // Should always show the Format button
    expect(screen.getByRole('button', { name: /format/i })).toBeInTheDocument()
  })

  it('renders with onRun prop', () => {
    const onRun = () => {}
    render(<CodeMirrorEditor value="test code" onRun={onRun} />)

    // Should show the Run button when onRun is provided
    expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument()
  })

  it('renders undo and redo buttons', () => {
    render(<CodeMirrorEditor value="test code" />)

    // Should always show Undo and Redo buttons
    expect(screen.getByRole('button', { name: /undo/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /redo/i })).toBeInTheDocument()
  })

  it('formats code when format button is clicked', async () => {
    const unformattedCode = '(defn foo[x y](+ x y))'

    // Compute expected formatted result using real prettier
    const formattedCode = await prettier.format(unformattedCode, {
      parser: 'clojure',
      plugins: [clojurePlugin],
    })

    const formatSpy = vi.spyOn(prettier, 'format')

    const onChangeMock = vi.fn()

    render(<CodeMirrorEditor value={unformattedCode} onChange={onChangeMock} />)

    // Wait for editor to mount
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /format/i }),
      ).toBeInTheDocument()
    })

    // Click the format button
    const formatButton = screen.getByRole('button', { name: /format/i })
    fireEvent.click(formatButton)

    // Wait for async formatting to complete
    await waitFor(() => {
      // Verify prettier.format was called
      expect(formatSpy).toHaveBeenCalled()

      // Verify onChange was called with formatted code
      expect(onChangeMock).toHaveBeenCalledWith(formattedCode)
    })

    formatSpy.mockRestore()
  })

  it('handles formatting errors gracefully', async () => {
    const unformattedCode = '(defn incomplete'

    const formatSpy = vi
      .spyOn(prettier, 'format')
      .mockRejectedValue(new Error('Invalid Clojure syntax'))

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    const onChangeMock = vi.fn()

    render(<CodeMirrorEditor value={unformattedCode} onChange={onChangeMock} />)

    // Wait for editor to mount
    await waitFor(() => {
      expect(
        screen.getByRole('button', { name: /format/i }),
      ).toBeInTheDocument()
    })

    // Click the format button
    const formatButton = screen.getByRole('button', { name: /format/i })
    fireEvent.click(formatButton)

    // Wait for error handling
    await waitFor(() => {
      // Verify prettier.format was called
      expect(formatSpy).toHaveBeenCalled()

      // Verify error was logged
      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to format code:',
        expect.any(Error),
      )

      // Verify onChange was NOT called since formatting failed
      expect(onChangeMock).not.toHaveBeenCalled()
    })

    formatSpy.mockRestore()
    consoleSpy.mockRestore()
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

describe('CodeMirrorEditor hotkeys', () => {
  it('invokes onRun when Shift+Enter is pressed', async () => {
    const onRun = vi.fn()
    const { container } = render(<CodeMirrorEditor value="()" onRun={onRun} />)

    const editorEl = container.querySelector('.cm-content') as HTMLElement
    expect(editorEl).toBeTruthy()

    editorEl.focus()

    // Dispatch Shift+Enter keydown
    fireEvent.keyDown(editorEl, { key: 'Enter', code: 'Enter', shiftKey: true })

    // Wait for any async handlers
    await waitFor(() => {
      expect(onRun).toHaveBeenCalledTimes(1)
    })
  })
})
