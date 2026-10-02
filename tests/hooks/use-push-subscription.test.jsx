import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

const mutate = vi.fn()
const apiGetCall = vi.fn(() => ({
  data: { pages: [{ Devices: [], PublicKey: 'BKEY' }] },
  isFetching: false,
}))
vi.mock('../../src/api/ApiCall', () => ({
  ApiPostCall: () => ({ mutate, isPending: false }),
  ApiGetCallWithPagination: (...args) => apiGetCall(...args),
}))

let impersonated = null
vi.mock('../../src/utils/impersonation', () => ({
  getImpersonatedRole: () => impersonated,
}))

import {
  pushEnrolmentHint,
  usePushDevices,
  usePushSubscription,
} from '../../src/hooks/use-push-subscription'

const setUserAgent = (ua) =>
  Object.defineProperty(navigator, 'userAgent', {
    value: ua,
    configurable: true,
  })

describe('usePushSubscription', () => {
  const originalMatchMedia = window.matchMedia
  beforeEach(() => {
    impersonated = null
    window.PushManager = function PushManager() {}
    window.Notification = {
      permission: 'default',
      requestPermission: vi.fn(async () => 'granted'),
    }
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        ready: Promise.resolve({
          pushManager: { getSubscription: async () => null },
        }),
      },
    })
    window.matchMedia = vi.fn(() => ({ matches: false }))
    setUserAgent('Mozilla/5.0 (Macintosh) Chrome/130 Safari/537.36')
  })
  afterEach(() => {
    window.matchMedia = originalMatchMedia
    delete window.PushManager
    delete window.Notification
  })

  it('is enabled on a supported desktop browser with a key', () => {
    const { result } = renderHook(() =>
      usePushSubscription({ publicKey: 'BKEY' })
    )
    expect(result.current.blockedReason).toBeNull()
  })

  it('blocks iOS Safari until the app is installed to the Home Screen', () => {
    setUserAgent(
      'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) Version/18.0 Safari/605.1'
    )
    const { result, rerender } = renderHook(() =>
      usePushSubscription({ publicKey: 'BKEY' })
    )
    expect(result.current.blockedReason).toMatch(/Home Screen/)

    window.matchMedia = vi.fn(() => ({ matches: true }))
    rerender()
    expect(result.current.blockedReason).toBeNull()
  })

  it('refuses to register while impersonating a role', async () => {
    impersonated = 'readonly'
    const { result } = renderHook(() =>
      usePushSubscription({ publicKey: 'BKEY' })
    )
    expect(result.current.blockedReason).toMatch(/impersonating/)
    await expect(result.current.subscribe()).rejects.toThrow(/impersonating/)
    expect(window.Notification.requestPermission).not.toHaveBeenCalled()
    expect(mutate).not.toHaveBeenCalled()
  })

  it('blocks without an instance public key', () => {
    const { result } = renderHook(() =>
      usePushSubscription({ publicKey: undefined })
    )
    expect(result.current.blockedReason).toMatch(/not ready/)
  })

  it('reads the paginated device cache and words the hint by device count', () => {
    const { result } = renderHook(() => usePushDevices())
    expect(apiGetCall).toHaveBeenCalledWith(
      expect.objectContaining({
        url: '/api/ListPushSubscriptions',
        queryKey: 'ListPushSubscriptions',
      })
    )
    expect(result.current.publicKey).toBe('BKEY')
    expect(pushEnrolmentHint(result.current)).toMatch(
      /needs a registered device/
    )
    expect(pushEnrolmentHint({ devices: [{}] })).toMatch(
      /the 1 device you registered/
    )
    expect(pushEnrolmentHint({ devices: [{}, {}] })).toMatch(
      /the 2 devices you registered/
    )
  })
})
