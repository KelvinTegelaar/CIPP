import React from 'react'
import { screen, fireEvent, act } from '@testing-library/react'
import { renderWithTheme } from '../../test-utils'
import { CIPPM365OAuthButton } from '../../../src/components/CippComponents/CIPPM365OAuthButton'

vi.mock('../../../src/api/ApiCall', async () => (await import('../../mocks/api-call')).apiCallMock())
import { api, getResult } from '../../mocks/api-call'

// only rendered for promptBeforeAuth / device-code paths, cut their import trees
vi.mock('../../../src/components/CippComponents/CippApiDialog', () => ({
  CippApiDialog: () => null,
}))
vi.mock('../../../src/components/CippComponents/CippCopyToClipboard', () => ({
  CippCopyToClipBoard: ({ text }) => <span>{text}</span>,
}))

const APP_ID = 'f8b2c3d4-9e01-4a23-8b45-6c7d8e9f0a1b'

// The popup flow listens on BroadcastChannel('cipp_auth') for the /authredirect
// callback. A controllable stub lets tests deliver results synchronously.
class MockBroadcastChannel {
  static instances = []
  constructor(name) {
    this.name = name
    this.onmessage = null
    this.postMessage = vi.fn()
    this.close = vi.fn()
    MockBroadcastChannel.instances.push(this)
  }
}

const lastChannel = () => MockBroadcastChannel.instances.at(-1)

const authButton = () => screen.getByRole('button', { name: /Login with Microsoft|Authenticating/ })

describe('CIPPM365OAuthButton popup flow', () => {
  let openSpy

  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('BroadcastChannel', MockBroadcastChannel)
    MockBroadcastChannel.instances.length = 0
    api.get = getResult({ data: { applicationId: APP_ID } })
    openSpy = vi.spyOn(window, 'open')
    // The PKCE S256 challenge awaits a real digest, which settles on the event loop
    // rather than the microtask queue and so cannot be flushed under fake timers.
    // A resolved stub keeps the popup setup that follows it deterministic.
    vi.spyOn(globalThis.crypto.subtle, 'digest').mockResolvedValue(new Uint8Array(32).buffer)
  })

  // Everything after the digest - the BroadcastChannel and the popup watcher - is set up
  // in a microtask, so tests touching those have to let the click settle first.
  const settleAuthStart = () => act(async () => {})

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('fails fast with a clear error when the browser blocks the popup', () => {
    openSpy.mockReturnValue(null)
    const onAuthError = vi.fn()
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} onAuthError={onAuthError} />)

    fireEvent.click(authButton())

    expect(screen.getByText(/blocked by the browser/)).toBeInTheDocument()
    expect(onAuthError).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'popup_blocked' }))
    // not stuck on "Authenticating..." - immediately retryable
    expect(screen.getByRole('button', { name: 'Login with Microsoft' })).toBeEnabled()
  })

  it('re-enables the button shortly after the sign-in window is closed without a result', async () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    const onAuthError = vi.fn()
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} onAuthError={onAuthError} />)

    fireEvent.click(authButton())
    expect(screen.getByRole('button', { name: /Authenticating/ })).toBeDisabled()
    await settleAuthStart()

    popup.closed = true
    // 1s watcher tick spots the closed window, then the 2s grace period elapses
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    act(() => {
      vi.advanceTimersByTime(2000)
    })

    expect(screen.getByText(/sign-in window was closed/)).toBeInTheDocument()
    expect(onAuthError).toHaveBeenCalledWith(expect.objectContaining({ errorCode: 'popup_closed' }))
    expect(screen.getByRole('button', { name: 'Login with Microsoft' })).toBeEnabled()
  })

  it('does not report a cancellation when a result arrived before the popup closed', async () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} />)

    fireEvent.click(authButton())
    await settleAuthStart()

    // the /authredirect callback posts its result, then the popup closes itself
    act(() => {
      lastChannel().onmessage({
        data: {
          type: 'auth_error',
          error: 'access_denied',
          errorDescription: 'The user cancelled at the Microsoft sign-in page.',
        },
      })
    })
    popup.closed = true
    act(() => {
      vi.advanceTimersByTime(10000)
    })

    // the real result is shown, never overridden by the popup-closed cancellation
    expect(screen.getByText(/Authentication Error: access_denied/)).toBeInTheDocument()
    expect(screen.queryByText(/sign-in window was closed/)).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Login with Microsoft' })).toBeEnabled()
  })

  it('cleans up the popup watcher when a result arrives', async () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} />)

    fireEvent.click(authButton())
    await settleAuthStart()
    act(() => {
      lastChannel().onmessage({
        data: { type: 'auth_error', error: 'access_denied', errorDescription: 'cancelled' },
      })
    })

    expect(lastChannel().close).toHaveBeenCalled()
    // with the watcher cleared, no timers remain to fire popup_closed later
    expect(vi.getTimerCount()).toBe(0)
  })

  it('cancels the pending close check when a result lands during the grace period', async () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} />)

    fireEvent.click(authButton())
    await settleAuthStart()

    // the callback closes the popup first, so the watcher schedules its grace check...
    popup.closed = true
    act(() => {
      vi.advanceTimersByTime(1000)
    })
    // ...and the result lands inside that window
    act(() => {
      lastChannel().onmessage({
        data: { type: 'auth_error', error: 'access_denied', errorDescription: 'cancelled' },
      })
    })

    // nothing left pending that could fire against a subsequent attempt
    expect(vi.getTimerCount()).toBe(0)

    act(() => {
      vi.advanceTimersByTime(5000)
    })
    expect(screen.getByText(/Authentication Error: access_denied/)).toBeInTheDocument()
    expect(screen.queryByText(/sign-in window was closed/)).not.toBeInTheDocument()
  })
})

describe('CIPPM365OAuthButton device code flow', () => {
  let openSpy

  beforeEach(() => {
    vi.useFakeTimers()
    api.get = getResult({ data: { applicationId: APP_ID } })
    openSpy = vi.spyOn(window, 'open')
    // keep the poll pending so the flow stays mid-authentication
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ status: 'pending', error: 'authorization_pending' }),
      })
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  const codeResponse = (userCode, deviceCode) => ({
    ok: true,
    json: async () => ({
      user_code: userCode,
      device_code: deviceCode,
      expires_in: 900,
      interval: 5,
    }),
  })

  const pendingResponse = {
    ok: true,
    json: async () => ({ status: 'pending', error: 'authorization_pending' }),
  }

  it('offers a fresh code instead of locking up when the sign-in window is closed', async () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    global.fetch = vi.fn().mockResolvedValue(codeResponse('FHA953X4X', 'dev-code-1'))

    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} useDeviceCode />)

    // first click retrieves the device code
    fireEvent.click(screen.getByRole('button', { name: /Login with Microsoft/ }))
    await act(async () => {})

    // second click opens the popup and starts polling
    global.fetch = vi.fn().mockResolvedValue(pendingResponse)
    fireEvent.click(screen.getByRole('button', { name: /Authenticate with Code/ }))
    await act(async () => {})
    expect(screen.getByRole('button', { name: /Authenticating/ })).toBeDisabled()

    // the user closes the sign-in window
    popup.closed = true
    await act(async () => {
      vi.advanceTimersByTime(1000)
    })

    const restart = screen.getByRole('button', { name: /Start over with a new code/ })
    expect(restart).toBeEnabled()
    // the copy must not promise that the old code can be reused - it is consumed once entered
    expect(screen.getByText(/cannot be used again/)).toBeInTheDocument()

    // starting over requests a new code and retires the old poll
    global.fetch = vi.fn().mockResolvedValue(codeResponse('NEWCODE99', 'dev-code-2'))
    fireEvent.click(restart)
    await act(async () => {})

    expect(screen.getByText('NEWCODE99')).toBeInTheDocument()

    // the superseded poll must not keep hitting the old device code
    global.fetch.mockClear()
    await act(async () => {
      vi.advanceTimersByTime(30000)
    })
    const polledOldCode = global.fetch.mock.calls.some(([url]) =>
      String(url).includes('dev-code-1')
    )
    expect(polledOldCode).toBe(false)
  })
})
