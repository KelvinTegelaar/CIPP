import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../../test-utils'

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }))
vi.mock('../../../src/hooks/use-breakpoint', async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
}))

const bookmarkState = vi.hoisted(() => ({ bookmarks: [] }))
vi.mock('../../../src/hooks/use-user-bookmarks', () => ({
  useUserBookmarks: () => ({ bookmarks: bookmarkState.bookmarks, setBookmarks: () => {} }),
}))

const idle = vi.hoisted(() => ({
  isSuccess: false,
  isFetching: false,
  isLoading: false,
  isError: false,
  data: undefined,
  refetch: () => {},
}))
// per-url responses for the scopes that read from the tenant caches; everything else idles
const apiState = vi.hoisted(() => ({ byUrl: {}, calls: [] }))
vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: ({ url, waiting = true }) => {
    apiState.calls.push({ url, waiting })
    return apiState.byUrl[url] ?? idle
  },
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}))

const routerState = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }))
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/identity/administration/users',
    query: { tenantFilter: 'testdomain.com' },
    isReady: true,
    push: routerState.push,
    replace: routerState.replace,
    events: { on: () => {}, off: () => {} },
  }),
}))

vi.mock('../../../src/hooks/use-permissions', () => ({
  // the page index filters by permission; 'Identity.User.Read' satisfies the config's
  // 'Identity.User.*' requirement so the Users pages exist to be found
  usePermissions: () => ({ userPermissions: ['Identity.User.Read'], userRoles: ['superadmin'] }),
}))

import { CippUniversalSearchV2 } from '../../../src/components/CippCards/CippUniversalSearchV2'

describe('CippUniversalSearchV2 mobile layout', () => {
  beforeEach(() => {
    layoutState.isMobile = false
    bookmarkState.bookmarks = []
    routerState.push = vi.fn()
  })

  it('keeps the scope dropdown on desktop, no chips', () => {
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" />)
    expect(screen.getByRole('button', { name: /pages/i })).toBeInTheDocument()
    expect(screen.queryByText('Users', { selector: '.MuiChip-label' })).not.toBeInTheDocument()
  })

  // The desktop scope dropdown cost two taps, and entity search had no direct mobile entry
  // point at all — one chip per scope closes that.
  it('renders one chip per scope on mobile and switches with a tap', async () => {
    layoutState.isMobile = true
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" />)

    for (const label of ['Tenants', 'Users', 'Groups', 'Applications', 'Licenses', 'BitLocker', 'Pages']) {
      expect(screen.getByText(label, { selector: '.MuiChip-label' })).toBeInTheDocument()
    }

    await user.click(screen.getByText('Users', { selector: '.MuiChip-label' }))
    expect(screen.getByPlaceholderText(/search users/i)).toBeInTheDocument()

    // BitLocker reveals its lookup sub-choice as a second chip row
    await user.click(screen.getByText('BitLocker', { selector: '.MuiChip-label' }))
    expect(screen.getByText('Key ID', { selector: '.MuiChip-label' })).toBeInTheDocument()
    expect(screen.getByText('Device ID', { selector: '.MuiChip-label' })).toBeInTheDocument()
  })

  it('fills the empty state with bookmarks that navigate and close', async () => {
    layoutState.isMobile = true
    bookmarkState.bookmarks = [
      { label: 'GDAP Relationships', path: '/tenant/gdap-management/relationships', category: 'Tenant' },
    ]
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" onConfirm={onConfirm} />)

    expect(screen.getByText('Bookmarks')).toBeInTheDocument()
    await user.click(screen.getByText('GDAP Relationships'))
    expect(routerState.push).toHaveBeenCalledWith('/tenant/gdap-management/relationships')
    expect(onConfirm).toHaveBeenCalled()
  })

  // userEvent.click fires mousedown -> click; the outside-click closer ran on mousedown,
  // unmounted the row, and the click landed on nothing — results vanished, no navigation.
  it('navigates when a page result is tapped, instead of just closing', async () => {
    layoutState.isMobile = true
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" onConfirm={onConfirm} />)

    await user.type(screen.getByPlaceholderText(/search pages/i), 'users')
    const result = await screen.findAllByRole('menuitem')
    await user.click(result[0])

    expect(routerState.push).toHaveBeenCalled()
    expect(onConfirm).toHaveBeenCalled()
  })

  it('renders page results in flow on mobile, not in a portal panel', async () => {
    layoutState.isMobile = true
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" />)

    await user.type(screen.getByPlaceholderText(/search pages/i), 'users')
    // the floating panel marks itself; in-flow results must not
    expect(document.querySelector('[data-dropdown-portal]')).toBeNull()
  })
})

describe('CippUniversalSearchV2 keyboard selection', () => {
  beforeEach(() => {
    layoutState.isMobile = false
    bookmarkState.bookmarks = []
    routerState.push = vi.fn()
  })

  // A lone hit used to need an ArrowDown before Enter would open it; Enter alone just
  // re-ran the (no-op for Pages) search and left the user sitting on the result.
  it('opens the only result on Enter without arrowing down first', async () => {
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" onConfirm={onConfirm} />)

    await user.type(screen.getByPlaceholderText(/search pages/i), 'vacation')
    expect(await screen.findAllByRole('menuitem')).toHaveLength(1)

    await user.keyboard('{Enter}')

    expect(routerState.push).toHaveBeenCalledWith(
      '/identity/administration/vacation-mode',
      undefined,
      { shallow: true },
    )
    expect(onConfirm).toHaveBeenCalled()
  })

  it('does not pick a result on Enter when several match and none is highlighted', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" />)

    await user.type(screen.getByPlaceholderText(/search pages/i), 'users')
    expect((await screen.findAllByRole('menuitem')).length).toBeGreaterThan(1)

    await user.keyboard('{Enter}')

    expect(routerState.push).not.toHaveBeenCalled()
  })

  it('still opens the highlighted result on Enter when several match', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" />)

    await user.type(screen.getByPlaceholderText(/search pages/i), 'users')
    await screen.findAllByRole('menuitem')

    await user.keyboard('{ArrowDown}{Enter}')

    expect(routerState.push).toHaveBeenCalledTimes(1)
  })
})

describe('CippUniversalSearchV2 scope cycling', () => {
  beforeEach(() => {
    layoutState.isMobile = false
    bookmarkState.bookmarks = []
    routerState.push = vi.fn()
  })

  // Switching scope used to mean leaving the keyboard for the dropdown. Tab walks the
  // scopes in menu order and keeps the typed term so it can be re-scoped, not retyped.
  it('cycles the scope with Tab and Shift+Tab, keeping the typed text', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Users" />)

    const field = screen.getByPlaceholderText(/search users/i)
    await user.type(field, 'john')

    await user.keyboard('{Tab}')
    expect(screen.getByPlaceholderText(/search groups/i)).toHaveValue('john')
    expect(screen.getByRole('button', { name: /groups/i })).toBeInTheDocument()

    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(screen.getByPlaceholderText(/search users/i)).toHaveValue('john')
  })

  it('wraps from Pages (last) to Tenants (first) and back', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" />)

    await user.click(screen.getByPlaceholderText(/search pages/i))
    await user.keyboard('{Tab}')
    expect(screen.getByPlaceholderText(/search tenants/i)).toBeInTheDocument()

    await user.keyboard('{Shift>}{Tab}{/Shift}')
    expect(screen.getByPlaceholderText(/search pages/i)).toBeInTheDocument()
  })

  it('shows page results immediately after tabbing into the Pages scope with a term typed', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="BitLocker" />)

    await user.type(screen.getByPlaceholderText(/search bitlocker/i), 'vacation')
    await user.keyboard('{Tab}')

    expect(screen.getByPlaceholderText(/search pages/i)).toHaveValue('vacation')
    expect(await screen.findAllByRole('menuitem')).toHaveLength(1)
  })
})

describe('CippUniversalSearchV2 tenant scope', () => {
  const ok = (data) => ({ ...idle, isSuccess: true, data })
  const tenants = [
    { customerId: 'AllTenants', displayName: '*All Tenants', defaultDomainName: 'AllTenants' },
    { customerId: 'c04', displayName: 'CyberDrain 04', defaultDomainName: 'cyberdrain04.onmicrosoft.com', initialDomainName: 'cyberdrain04.onmicrosoft.com' },
    { customerId: 'c05', displayName: 'CyberDrain 05', defaultDomainName: 'cyberdrain05.onmicrosoft.com', initialDomainName: 'cyberdrain05.onmicrosoft.com' },
    { customerId: 'partner', displayName: 'Partner Tenant', defaultDomainName: 'partner.onmicrosoft.com', initialDomainName: 'partner.onmicrosoft.com' },
  ]
  const groups = [
    {
      Id: 'g-all',
      Name: 'All Tenants (Excluding Partner)',
      GroupType: 'dynamic',
      Members: [
        { customerId: 'c04', displayName: 'CyberDrain 04', defaultDomainName: 'cyberdrain04.onmicrosoft.com' },
        { customerId: 'c05', displayName: 'CyberDrain 05', defaultDomainName: 'cyberdrain05.onmicrosoft.com' },
      ],
    },
    {
      Id: 'g-premium',
      Name: 'Business Premium License available',
      GroupType: 'dynamic',
      Members: [{ customerId: 'c04', displayName: 'CyberDrain 04', defaultDomainName: 'cyberdrain04.onmicrosoft.com' }],
    },
  ]

  beforeEach(() => {
    layoutState.isMobile = false
    bookmarkState.bookmarks = []
    routerState.push = vi.fn()
    routerState.replace = vi.fn()
    apiState.byUrl = {
      '/api/listTenants': ok(tenants),
      '/api/ListTenantGroups': ok({ Results: groups }),
    }
  })

  it('lists every member of a group when the group name is searched', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Tenants" />)

    await user.type(screen.getByPlaceholderText(/search tenants/i), 'excluding partner')
    const rows = await screen.findAllByRole('menuitem')

    expect(rows).toHaveLength(2)
    expect(rows[0]).toHaveTextContent('CyberDrain 04')
    expect(rows[1]).toHaveTextContent('CyberDrain 05')
    // the partner tenant is not a member, and must not sneak in via its own name
    expect(screen.queryByText('Partner Tenant')).not.toBeInTheDocument()
  })

  it('shows a matching tenant with a chip per group it belongs to', async () => {
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Tenants" />)

    await user.type(screen.getByPlaceholderText(/search tenants/i), 'cyberdrain04.onmicrosoft.com')
    const rows = await screen.findAllByRole('menuitem')

    expect(rows).toHaveLength(1)
    expect(rows[0]).toHaveTextContent('CyberDrain 04')
    for (const chip of ['All Tenants (Excluding Partner)', 'Business Premium License available']) {
      expect(screen.getByText(chip, { selector: '.MuiChip-label' })).toBeInTheDocument()
    }
  })

  it('switches to the tenant on Enter when it is the only hit', async () => {
    const handleUpdate = vi.fn()
    const onConfirm = vi.fn()
    const user = userEvent.setup()
    renderWithProviders(
      <CippUniversalSearchV2 defaultSearchType="Tenants" onConfirm={onConfirm} />,
      { settings: settingsWith({ handleUpdate }) },
    )

    await user.type(screen.getByPlaceholderText(/search tenants/i), 'cyberdrain04.onmicrosoft.com')
    await screen.findAllByRole('menuitem')
    await user.keyboard('{Enter}')

    expect(routerState.replace).toHaveBeenCalledWith(
      {
        pathname: '/identity/administration/users',
        query: { tenantFilter: 'cyberdrain04.onmicrosoft.com' },
      },
      undefined,
      { shallow: true },
    )
    expect(handleUpdate).toHaveBeenCalledWith({ currentTenant: 'cyberdrain04.onmicrosoft.com' })
    expect(onConfirm).toHaveBeenCalled()
  })

  // Both queries share the tenant selector's cache keys; they must stay disabled outside
  // the Tenants scope so opening the search never triggers a tenant-list fetch by itself.
  it('only enables the tenant and group queries while the Tenants scope is active', async () => {
    apiState.calls = []
    const user = userEvent.setup()
    renderWithProviders(<CippUniversalSearchV2 defaultSearchType="Pages" />)

    const tenantCalls = () =>
      apiState.calls.filter((c) => c.url === '/api/listTenants' || c.url === '/api/ListTenantGroups')
    expect(tenantCalls().length).toBeGreaterThan(0)
    expect(tenantCalls().every((c) => c.waiting === false)).toBe(true)

    apiState.calls = []
    await user.click(screen.getByPlaceholderText(/search pages/i))
    await user.keyboard('{Tab}')
    expect(screen.getByPlaceholderText(/search tenants/i)).toBeInTheDocument()
    expect(tenantCalls().some((c) => c.waiting === true)).toBe(true)
  })
})
