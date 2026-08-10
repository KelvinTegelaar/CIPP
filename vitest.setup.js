import '@testing-library/jest-dom/vitest'
import './tests/mocks/require-context'
import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'
import { webcrypto } from 'node:crypto'

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

// jsdom ships crypto.getRandomValues but not crypto.subtle, which the PKCE S256
// challenge in CIPPM365OAuthButton needs. Node's webcrypto is the same API browsers
// expose in a secure context.
if (globalThis.crypto && !globalThis.crypto.subtle) {
  Object.defineProperty(globalThis.crypto, 'subtle', {
    value: webcrypto.subtle,
    configurable: true,
  })
}

// Suppress jsdom "Not implemented" warnings for getComputedStyle with pseudo-elements
const originalConsoleError = console.error
console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('Not implemented: Window')) return
  originalConsoleError(...args)
}
