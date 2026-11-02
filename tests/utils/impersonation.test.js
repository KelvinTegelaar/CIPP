import {
  getImpersonatedRole,
  subscribeImpersonation,
  enterImpersonation,
  exitImpersonation,
  impersonationCacheParams,
} from '../../src/utils/impersonation'

const KEY = 'cipp_impersonate_role'

describe('impersonation store', () => {
  let reloadSpy

  beforeEach(() => {
    window.localStorage.clear()
    // jsdom's location.reload is not configurable via vi.spyOn directly
    reloadSpy = vi.fn()
    Object.defineProperty(window, 'location', {
      value: { ...window.location, reload: reloadSpy },
      writable: true,
    })
  })

  it('is null by default and reflects the stored role', () => {
    expect(getImpersonatedRole()).toBeNull()
    window.localStorage.setItem(KEY, 'helpdesk')
    expect(getImpersonatedRole()).toBe('helpdesk')
  })

  it('enterImpersonation lowercases, stores, clears caches and reloads', () => {
    window.localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', 'x')
    window.localStorage.setItem('REACT_QUERY_OFFLINE_CACHE_extra', 'y')
    window.localStorage.setItem('app.settings', 'keep-me')
    const queryClient = { clear: vi.fn() }

    enterImpersonation('HelpDesk', queryClient)

    expect(window.localStorage.getItem(KEY)).toBe('helpdesk')
    expect(queryClient.clear).toHaveBeenCalledTimes(1)
    expect(window.localStorage.getItem('REACT_QUERY_OFFLINE_CACHE')).toBeNull()
    expect(window.localStorage.getItem('REACT_QUERY_OFFLINE_CACHE_extra')).toBeNull()
    expect(window.localStorage.getItem('app.settings')).toBe('keep-me')
    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })

  it('exitImpersonation removes the key, clears caches and reloads', () => {
    window.localStorage.setItem(KEY, 'helpdesk')
    window.localStorage.setItem('REACT_QUERY_OFFLINE_CACHE', 'x')
    const queryClient = { clear: vi.fn() }

    exitImpersonation(queryClient)

    expect(window.localStorage.getItem(KEY)).toBeNull()
    expect(window.localStorage.getItem('REACT_QUERY_OFFLINE_CACHE')).toBeNull()
    expect(reloadSpy).toHaveBeenCalledTimes(1)
  })

  it('notifies subscribers on enter and exit, and unsubscribe works', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeImpersonation(listener)

    enterImpersonation('readonly', { clear: vi.fn() })
    expect(listener).toHaveBeenCalledTimes(1)

    exitImpersonation({ clear: vi.fn() })
    expect(listener).toHaveBeenCalledTimes(2)

    unsubscribe()
    enterImpersonation('editor', { clear: vi.fn() })
    expect(listener).toHaveBeenCalledTimes(2)
  })

  it('impersonationCacheParams segregates the Craft cache key only while impersonating', () => {
    expect(impersonationCacheParams()).toEqual({})
    window.localStorage.setItem(KEY, 'helpdesk')
    expect(impersonationCacheParams()).toEqual({ _imp: 'helpdesk' })
  })

  it('survives a throwing localStorage without crashing', () => {
    const original = window.localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: () => {
          throw new Error('denied')
        },
        setItem: () => {
          throw new Error('denied')
        },
        removeItem: () => {
          throw new Error('denied')
        },
      },
      configurable: true,
    })

    expect(getImpersonatedRole()).toBeNull()
    expect(() => exitImpersonation({ clear: vi.fn() })).not.toThrow()

    Object.defineProperty(window, 'localStorage', { value: original, configurable: true })
  })
})

describe('buildVersionedHeaders impersonation header', () => {
  beforeEach(() => {
    window.localStorage.clear()
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ version: '1.0' }) })
  })

  it('adds x-cipp-impersonate-role only while impersonating', async () => {
    const { buildVersionedHeaders } = await import('../../src/utils/cippVersion')

    const plain = await buildVersionedHeaders()
    expect(plain['x-cipp-impersonate-role']).toBeUndefined()

    window.localStorage.setItem(KEY, 'helpdesk')
    const impersonated = await buildVersionedHeaders()
    expect(impersonated['x-cipp-impersonate-role']).toBe('helpdesk')
  })
})
