import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { renderWithProviders, settingsWith } from '../test-utils'

const nav = vi.hoisted(() => ({ pathname: '/' }))
vi.mock('next/navigation', () => ({
  usePathname: () => nav.pathname,
  useRouter: () => ({ push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(''),
}))

const idle = vi.hoisted(() => ({
  isSuccess: false,
  isFetching: false,
  isPending: false,
  isError: false,
  data: undefined,
  mutate: () => {},
  reset: () => {},
  refetch: () => {},
}))
// SideNav only renders for users with more than two roles
const me = vi.hoisted(() => ({
  isSuccess: true,
  data: { clientPrincipal: { userRoles: ['anonymous', 'authenticated', 'admin'] } },
}))
vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: ({ url }) => (url === '/api/me' ? { ...idle, ...me } : idle),
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}))
vi.mock('../../src/components/CippComponents/CippSponsor', () => ({ CippSponsor: () => null }))

import { SideNav } from '../../src/layouts/side-nav'

const items = [
  { title: 'Dashboard', path: '/' },
  {
    title: 'Identity',
    type: 'header',
    items: [
      {
        title: 'Administration',
        path: '/identity/administration',
        items: [{ title: 'Users', path: '/identity/administration/users' }],
      },
    ],
  },
]

// rerender() would drop renderWithProviders' wrappers, so drive the re-render from inside
const Harness = () => {
  const [, setTick] = React.useState(0)
  React.useEffect(() => {
    nav.rerender = () => setTick((t) => t + 1)
  }, [])
  return <SideNav items={items} pinned />
}

const renderNav = () =>
  renderWithProviders(<Harness />, { settings: settingsWith({ bookmarkSidebar: false }) })

describe('SideNav', () => {
  // Ctrl+K navigates with router.push, the nav stays mounted and only the pathname changes
  it('expands the parent sections when the route moves into them after mount', async () => {
    nav.pathname = '/'
    renderNav()
    expect(screen.queryByText('Users')).toBeNull()

    nav.pathname = '/identity/administration/users'
    act(() => nav.rerender())

    await waitFor(() => expect(screen.getByText('Users')).toBeVisible())
  })
})
