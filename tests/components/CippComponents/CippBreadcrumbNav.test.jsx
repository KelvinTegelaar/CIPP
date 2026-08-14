import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippBreadcrumbNav } from '../../../src/components/CippComponents/CippBreadcrumbNav'

// second require.context consumer, this one globs every pages/**/tabOptions.json. covers the
// subdirectory + regex arms of the polyfill that the tutorial glob (flat, no subdirs) doesn't.
// 'Groups' only reaches the trail through src/pages/tenant/administration/tenants/tabOptions.json
vi.mock('next/router', () => ({
  useRouter: () => ({
    pathname: '/tenant/administration/tenants/groups',
    asPath: '/tenant/administration/tenants/groups',
    query: {},
    isReady: true,
    push: () => Promise.resolve(),
    replace: () => Promise.resolve(),
    events: { on: () => {}, off: () => {}, emit: () => {} },
  }),
}))

describe('CippBreadcrumbNav', () => {
  it('labels the tab crumb from the tabOptions require.context', () => {
    renderWithProviders(<CippBreadcrumbNav />)

    expect(screen.getByLabelText('page hierarchy')).toBeInTheDocument()
    expect(screen.getByText('Groups')).toBeInTheDocument()
  })
})
