import { describe, expect, it, vi } from 'vitest'
import {
  actionMatchesRowOpen,
  dispatchRowOpen,
  partitionRowMenuActions,
  resolveRowOpenHref,
  resolveRowOpenLink,
  rowOpenEnabled,
  rowOpenSupportsNewTab,
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

  it('window.open with absolute href when newTab is set', () => {
    const router = { push: vi.fn() }
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null)

    expect(
      dispatchRowOpen(
        { link: '/identity/administration/users/user?userId=[id]' },
        { id: 'abc' },
        router,
        { newTab: true }
      )
    ).toBe(true)

    expect(router.push).not.toHaveBeenCalled()
    expect(openSpy).toHaveBeenCalledWith(
      `${window.location.origin}/identity/administration/users/user?userId=abc`,
      '_blank',
      'noopener,noreferrer'
    )
    openSpy.mockRestore()
  })
})

describe('resolveRowOpenHref', () => {
  it('returns absolute URL for internal paths', () => {
    expect(
      resolveRowOpenHref(
        { link: '/identity/administration/users/user?userId=[id]' },
        { id: 'abc' }
      )
    ).toBe(
      `${window.location.origin}/identity/administration/users/user?userId=abc`
    )
  })
})

describe('rowOpenSupportsNewTab', () => {
  it('returns false for onOpen-only configs', () => {
    expect(rowOpenSupportsNewTab({ onOpen: () => {} }, { id: '1' })).toBe(false)
  })

  it('returns true when link resolves', () => {
    expect(
      rowOpenSupportsNewTab(
        { link: '/identity/administration/users/user?userId=[id]' },
        { id: 'abc' }
      )
    ).toBe(true)
  })
})

describe('actionMatchesRowOpen', () => {
  const rowOpen = { link: '/identity/administration/users/user?userId=[id]' }
  const row = { id: 'user-123' }

  it('matches identical link templates', () => {
    expect(
      actionMatchesRowOpen(
        { label: 'View User', link: rowOpen.link },
        rowOpen,
        row
      )
    ).toBe(true)
  })

  it('does not match different destinations', () => {
    expect(
      actionMatchesRowOpen(
        { label: 'Edit User', link: '/identity/administration/users/user/edit?userId=[id]' },
        rowOpen,
        row
      )
    ).toBe(false)
  })
})

describe('partitionRowMenuActions', () => {
  it('splits pinned actions from the scrollable menu list', () => {
    const actions = [
      { label: 'View User', link: '/identity/administration/users/user?userId=[id]' },
      {
        label: 'Edit User',
        pinned: true,
        link: '/identity/administration/users/user/edit?userId=[id]',
      },
    ]

    const { pinnedActions, menuActions } = partitionRowMenuActions(actions)

    expect(pinnedActions).toHaveLength(1)
    expect(pinnedActions[0].label).toBe('Edit User')
    expect(menuActions).toHaveLength(1)
    expect(menuActions[0].label).toBe('View User')
  })

  it('promotes pinned actions above the scrollable menu list', () => {
    const actions = [
      { label: 'Quick task', pinned: true },
      { label: 'Other action' },
    ]

    const { pinnedActions, menuActions } = partitionRowMenuActions(actions)

    expect(pinnedActions).toHaveLength(1)
    expect(pinnedActions[0].label).toBe('Quick task')
    expect(menuActions).toHaveLength(1)
    expect(menuActions[0].label).toBe('Other action')
  })

  it('keeps multiple pinned actions in declaration order', () => {
    const actions = [
      { label: 'Pinned other', pinned: true },
      {
        label: 'View User',
        pinned: true,
        link: '/identity/administration/users/user?userId=[id]',
      },
      { label: 'Edit User', link: '/identity/administration/users/user/edit?userId=[id]' },
    ]

    const { pinnedActions, menuActions } = partitionRowMenuActions(actions)

    expect(pinnedActions.map((action) => action.label)).toEqual([
      'Pinned other',
      'View User',
    ])
    expect(menuActions).toHaveLength(1)
    expect(menuActions[0].label).toBe('Edit User')
  })

  it('preserves declaration order when pinned actions are non-contiguous', () => {
    const actions = [
      { label: 'View Device', pinned: true },
      { label: 'Sync' },
      { label: 'View in Intune', pinned: true, external: true },
      { label: 'Retire' },
      { label: 'Edit Device', pinned: true },
    ]

    const { pinnedActions, menuActions } = partitionRowMenuActions(actions)

    expect(pinnedActions.map((action) => action.label)).toEqual([
      'View Device',
      'View in Intune',
      'Edit Device',
    ])
    expect(menuActions.map((action) => action.label)).toEqual(['Sync', 'Retire'])
  })
})
