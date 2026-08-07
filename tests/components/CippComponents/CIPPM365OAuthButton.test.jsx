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
  })

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

  it('re-enables the button shortly after the sign-in window is closed without a result', () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    const onAuthError = vi.fn()
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} onAuthError={onAuthError} />)

    fireEvent.click(authButton())
    expect(screen.getByRole('button', { name: /Authenticating/ })).toBeDisabled()

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

  it('does not report a cancellation when a result arrived before the popup closed', () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} />)

    fireEvent.click(authButton())

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

  it('cleans up the popup watcher when a result arrives', () => {
    const popup = { closed: false, close: vi.fn() }
    openSpy.mockReturnValue(popup)
    renderWithTheme(<CIPPM365OAuthButton applicationId={APP_ID} />)

    fireEvent.click(authButton())
    act(() => {
      lastChannel().onmessage({
        data: { type: 'auth_error', error: 'access_denied', errorDescription: 'cancelled' },
      })
    })

    expect(lastChannel().close).toHaveBeenCalled()
    // with the watcher cleared, no timers remain to fire popup_closed later
    expect(vi.getTimerCount()).toBe(0)
  })
})
