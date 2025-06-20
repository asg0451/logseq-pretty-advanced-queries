// Mock DOM APIs that aren't properly implemented in jsdom but are needed by CodeMirror
Object.defineProperty(Range.prototype, 'getClientRects', {
  writable: true,
  value: function() {
    return {
      length: 1,
      item: () => ({
        top: 0,
        left: 0,
        bottom: 20,
        right: 100,
        width: 100,
        height: 20,
        x: 0,
        y: 0,
        toJSON: () => {}
      }),
      [Symbol.iterator]: function* () {
        yield {
          top: 0,
          left: 0,
          bottom: 20,
          right: 100,
          width: 100,
          height: 20,
          x: 0,
          y: 0,
          toJSON: () => {}
        }
      }
    }
  }
})

Object.defineProperty(Range.prototype, 'getBoundingClientRect', {
  writable: true,
  value: function() {
    return {
      top: 0,
      left: 0,
      bottom: 20,
      right: 100,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => {}
    }
  }
})

// Mock ResizeObserver if not available
if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = class ResizeObserver {
    constructor(_callback: any) {}
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}