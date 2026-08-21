import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'

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
vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: () => idle,
  ApiPostCall: () => idle,
  ApiGetCallWithPagination: () => ({ ...idle, fetchNextPage: () => {} }),
}))

const routerState = vi.hoisted(() => ({ push: vi.fn() }))
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/',
    query: {},
    isReady: true,
    push: routerState.push,
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

    for (const label of ['Users', 'Groups', 'Applications', 'Licenses', 'BitLocker', 'Pages']) {
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
