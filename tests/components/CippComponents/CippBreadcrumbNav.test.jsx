import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippBreadcrumbNav } from '../../../src/components/CippComponents/CippBreadcrumbNav'

// second require.context consumer, this one globs every pages/**/tabOptions.json. covers the
// subdirectory + regex arms of the polyfill that the tutorial glob (flat, no subdirs) doesn't.
// 'Groups' only reaches the trail through src/pages/tenant/administration/tenants/tabOptions.json
const routerState = vi.hoisted(() => ({ pathname: '/tenant/administration/tenants/groups' }))
const layoutState = vi.hoisted(() => ({ isMobile: false }))
vi.mock('../../../src/hooks/use-breakpoint', async (importOriginal) => ({
  ...(await importOriginal()),
  useIsMobileLayout: () => layoutState.isMobile,
}))
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: routerState.pathname,
    asPath: routerState.pathname,
    query: {},
    isReady: true,
    push: () => Promise.resolve(),
    replace: () => Promise.resolve(),
    events: { on: () => {}, off: () => {}, emit: () => {} },
  }),
}))

describe('CippBreadcrumbNav', () => {
  beforeEach(() => {
    routerState.pathname = '/tenant/administration/tenants/groups'
    layoutState.isMobile = false
  })

  // The dashboard's rail is one crumb saying "Overview" directly above a picker saying
  // "Overview" — a single crumb is no hierarchy, so on phones the rail stands down.
  it('hides the rail on mobile when there is no hierarchy to show', () => {
    routerState.pathname = '/'
    layoutState.isMobile = true
    renderWithProviders(<CippBreadcrumbNav />)

    expect(screen.queryByLabelText('page hierarchy')).not.toBeInTheDocument()
  })

  // "Overview > Identity" is the dashboard's own tab set — the exact list the view picker
  // beneath it presents, so on phones it says nothing the page doesn't.
  it('hides the rail on mobile across all dashboard views, not just the root', () => {
    routerState.pathname = '/dashboardv2/identity'
    layoutState.isMobile = true
    renderWithProviders(<CippBreadcrumbNav />)

    expect(screen.queryByLabelText('page hierarchy')).not.toBeInTheDocument()
  })

  it('keeps the dashboard rail on desktop', () => {
    routerState.pathname = '/dashboardv2/identity'
    renderWithProviders(<CippBreadcrumbNav />)
    expect(screen.getByLabelText('page hierarchy')).toBeInTheDocument()
  })

  it('keeps a single-crumb rail on desktop, and deep rails on mobile', () => {
    routerState.pathname = '/'
    renderWithProviders(<CippBreadcrumbNav />)
    expect(screen.getByLabelText('page hierarchy')).toBeInTheDocument()
  })

  it('keeps a multi-crumb rail on mobile', () => {
    layoutState.isMobile = true
    renderWithProviders(<CippBreadcrumbNav />)
    expect(screen.getByText('Groups')).toBeInTheDocument()
  })

  it('labels the tab crumb from the tabOptions require.context', () => {
    renderWithProviders(<CippBreadcrumbNav />)

    expect(screen.getByLabelText('page hierarchy')).toBeInTheDocument()
    expect(screen.getByText('Groups')).toBeInTheDocument()
  })
})
