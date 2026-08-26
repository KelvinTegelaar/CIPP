import { describe, expect, it, vi } from 'vitest'
import {
  dispatchRowOpen,
  resolveRowOpenLink,
  rowOpenEnabled,
} from '../../../src/components/CippTable/util-row-open'

describe('rowOpenEnabled', () => {
  it('returns false when rowOpen is missing', () => {
    expect(rowOpenEnabled(null, { id: '1' })).toBe(false)
  })

  it('returns false when condition fails', () => {
    expect(
      rowOpenEnabled(
        { link: '/user/[id]', condition: (row) => Boolean(row.id) },
        {}
      )
    ).toBe(false)
  })

  it('returns true for link config', () => {
    expect(rowOpenEnabled({ link: '/user/[id]' }, { id: 'abc' })).toBe(true)
  })

  it('returns true for onOpen config', () => {
    expect(rowOpenEnabled({ onOpen: () => {} }, { id: 'abc' })).toBe(true)
  })
})

describe('resolveRowOpenLink', () => {
  it('resolves template placeholders', () => {
    expect(
      resolveRowOpenLink(
        { link: '/identity/administration/users/user?userId=[id]' },
        { id: 'user-123' }
      )
    ).toBe('/identity/administration/users/user?userId=user-123')
  })

  it('returns null when placeholders remain unresolved', () => {
    expect(
      resolveRowOpenLink({ link: '/user/[missing]' }, { id: 'user-123' })
    ).toBeNull()
  })

  it('resolves [Tenant] from fallback when row lacks Tenant', () => {
    expect(
      resolveRowOpenLink(
        {
          link: '/identity/administration/users/user?userId=[id]&tenantFilter=[Tenant]',
        },
        { id: 'user-123' },
        { fallbackTenant: 'contoso.onmicrosoft.com' }
      )
    ).toBe(
      '/identity/administration/users/user?userId=user-123&tenantFilter=contoso.onmicrosoft.com'
    )
  })

  it('resolves [Tenant] from currentTenant when row lacks tenant fields', () => {
    expect(
      resolveRowOpenLink(
        {
          link: '/tenant/administration/applications/enterprise-app?spId=[id]&tenantFilter=[Tenant]',
        },
        { id: 'sp-123' },
        { currentTenant: 'contoso.onmicrosoft.com' }
      )
    ).toBe(
      '/tenant/administration/applications/enterprise-app?spId=sp-123&tenantFilter=contoso.onmicrosoft.com'
    )
  })

  it('resolves [tenantId] from currentTenant when row lacks tenantId', () => {
    expect(
      resolveRowOpenLink(
        {
          link: '/identity/administration/users/user?userId=[azureAdUserId]&tenantFilter=[tenantId]',
        },
        { azureAdUserId: 'user-123' },
        { currentTenant: 'contoso.onmicrosoft.com' }
      )
    ).toBe(
      '/identity/administration/users/user?userId=user-123&tenantFilter=contoso.onmicrosoft.com'
    )
  })
})

describe('dispatchRowOpen', () => {
  it('calls onOpen when provided', () => {
    const onOpen = vi.fn()
    const row = { id: '1' }
    const router = { push: vi.fn() }

    expect(dispatchRowOpen({ onOpen }, row, router)).toBe(true)
    expect(onOpen).toHaveBeenCalledWith(row)
    expect(router.push).not.toHaveBeenCalled()
  })

  it('router.push for internal links', () => {
    const router = { push: vi.fn() }
    const row = { id: 'abc' }

    expect(
      dispatchRowOpen(
        { link: '/identity/administration/users/user?userId=[id]' },
        row,
        router
      )
    ).toBe(true)

    expect(router.push).toHaveBeenCalledWith(
      '/identity/administration/users/user?userId=abc',
      undefined,
      { shallow: true }
    )
  })

  it('window.open for external links', () => {
    const router = { push: vi.fn() }
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    expect(
      dispatchRowOpen(
        { link: 'https://example.com/[id]', external: true },
        { id: 'abc' },
        router
      )
    ).toBe(true)

    expect(openSpy).toHaveBeenCalledWith(
      'https://example.com/abc',
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })
})
