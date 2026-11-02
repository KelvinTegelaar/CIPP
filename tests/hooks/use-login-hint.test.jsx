import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ApiGetCall } from '../../src/api/ApiCall'
import { useLoginHint } from '../../src/hooks/use-login-hint'

let settings = {}
let me = { data: undefined, isSuccess: false }
vi.mock('../../src/api/ApiCall', () => ({ ApiGetCall: vi.fn(() => me) }))
vi.mock('../../src/hooks/use-settings', () => ({ useSettings: () => settings }))

const upn = 'admin@contoso.onmicrosoft.com'
const signedIn = () => ({ isSuccess: true, data: { clientPrincipal: { userDetails: upn } } })

describe('useLoginHint', () => {
  beforeEach(() => {
    settings = {}
    me = { data: undefined, isSuccess: false }
    ApiGetCall.mockClear()
  })

  it('subscribes to the shared authmecipp query rather than issuing its own /api/me call', () => {
    renderHook(() => useLoginHint())
    expect(ApiGetCall).toHaveBeenCalledTimes(1)
    expect(ApiGetCall).toHaveBeenCalledWith({ url: '/api/me', queryKey: 'authmecipp' })
  })

  it('returns a pass-through mapper while the preference is off', () => {
    me = signedIn()
    const { result } = renderHook(() => useLoginHint())
    expect(result.current('https://portal.azure.com/x')).toBe('https://portal.azure.com/x')
  })

  it('appends the signed-in UPN once the preference is on', () => {
    settings = { UserSpecificSettings: { portalLinks: { Login_Hint: true } } }
    me = signedIn()
    const { result } = renderHook(() => useLoginHint())
    expect(new URL(result.current('https://portal.azure.com/x')).searchParams.get('login_hint')).toBe(upn)
  })

  it('keeps the same mapper identity across rerenders so memoised consumers do not recompute', () => {
    settings = { portalLinks: { Login_Hint: true } }
    me = signedIn()
    const { result, rerender } = renderHook(() => useLoginHint())
    const first = result.current
    rerender()
    expect(result.current).toBe(first)
  })

  it('hands out a new mapper when /api/me resolves the UPN', () => {
    settings = { portalLinks: { Login_Hint: true } }
    const { result, rerender } = renderHook(() => useLoginHint())
    const before = result.current
    expect(before('https://portal.azure.com/x')).toBe('https://portal.azure.com/x')
    me = signedIn()
    rerender()
    expect(result.current).not.toBe(before)
    expect(new URL(result.current('https://portal.azure.com/x')).searchParams.get('login_hint')).toBe(upn)
  })
})
