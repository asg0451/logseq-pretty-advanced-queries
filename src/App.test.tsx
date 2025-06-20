import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'

import App from './App'

// Mock the utils/queryRunner module since we're testing UI behavior
vi.mock('./utils/queryRunner', () => ({
  runQuery: vi.fn().mockResolvedValue('mocked result'),
}))

describe('App', () => {
  beforeEach(() => {
    // Clear any existing global logseq
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (globalThis as any).logseq
    // Mock window.confirm and window.close
    vi.spyOn(window, 'confirm').mockImplementation(() => false)
    vi.spyOn(window, 'close').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('renders the main heading and close button', () => {
    render(<App />)

    expect(
      screen.getByText('Advanced Query Editor (Sandbox)'),
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '✕' })).toBeInTheDocument()
    // Use getAllByRole to get all run buttons and check that at least one exists
    const runButtons = screen.getAllByRole('button', { name: /run/i })
    expect(runButtons.length).toBeGreaterThan(0)
  })

  it('calls logseq.hideMainUI when close button is clicked in Logseq environment', () => {
    const mockHideMainUI = vi.fn()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(globalThis as any).logseq = {
      hideMainUI: mockHideMainUI,
    }

    render(<App />)

    const closeButton = screen.getByRole('button', { name: '✕' })
    fireEvent.click(closeButton)

    expect(mockHideMainUI).toHaveBeenCalledOnce()
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('shows confirmation dialog in standalone environment when close button is clicked', () => {
    // No logseq object - standalone environment
    render(<App />)

    const closeButton = screen.getByRole('button', { name: '✕' })
    fireEvent.click(closeButton)

    expect(window.confirm).toHaveBeenCalledWith(
      'Close the Advanced Query Editor?',
    )
    expect(window.close).not.toHaveBeenCalled() // because we mocked confirm to return false
  })

  it('calls window.close when user confirms in standalone environment', () => {
    vi.spyOn(window, 'confirm').mockImplementation(() => true)

    render(<App />)

    const closeButton = screen.getByRole('button', { name: '✕' })
    fireEvent.click(closeButton)

    expect(window.confirm).toHaveBeenCalledWith(
      'Close the Advanced Query Editor?',
    )
    expect(window.close).toHaveBeenCalledOnce()
  })
})
