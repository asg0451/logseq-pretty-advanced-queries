// Mock DOM APIs that aren't properly implemented in jsdom but are needed by CodeMirror
const mockRect = {
  top: 0,
  left: 0,
  bottom: 20,
  right: 100,
  width: 100,
  height: 20,
  x: 0,
  y: 0,
  toJSON: () => {},
}

function createMockClientRects() {
  const rects = [mockRect] as DOMRect[]
  const mockList = Object.assign(rects, {
    item: (index: number) => (index === 0 ? mockRect : null),
  })
  return mockList as DOMRectList
}

Object.defineProperty(Range.prototype, 'getClientRects', {
  writable: true,
  value: function () {
    return createMockClientRects()
  },
})

Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
  writable: true,
  value: function () {
    return mockRect
  },
})

// Mock getClientRects for Text nodes as well
Object.defineProperty(Text.prototype, 'getClientRects', {
  writable: true,
  value: function () {
    return createMockClientRects()
  },
})

// Mock getBoundingClientRect for all elements
Element.prototype.getBoundingClientRect = function () {
  return mockRect
}

// Mock ResizeObserver if not available
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor() {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// Extend Vitest's expect with jest-dom matchers
import '@testing-library/jest-dom/vitest'

// Ensure prettier.format is configurable so that Vitest can spyOn it reliably.
import { vi } from 'vitest'

vi.mock('prettier/standalone', async () => {
  const actual = await vi.importActual<typeof import('prettier/standalone')>(
    'prettier/standalone',
  )

  // Create a brand-new object so that property descriptors are configurable
  const wrapped: typeof actual = {
    ...actual,
    // Reattach the format function directly (not as an accessor) so that Vitest
    // can spyOn/override it in individual tests.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    format: (actual as any).format,
  }

  return wrapped
})
