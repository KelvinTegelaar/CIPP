import '@testing-library/jest-dom/vitest'
import './tests/mocks/require-context'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// coverage instrumentation slows lazy chunks and fetches past the 1s default
configure({ asyncUtilTimeout: 10000 })

afterEach(() => {
  cleanup()
})

global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// Suppress jsdom "Not implemented" warnings for getComputedStyle with pseudo-elements
const originalConsoleError = console.error
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Not implemented: Window')) return
  originalConsoleError(...args)
}
