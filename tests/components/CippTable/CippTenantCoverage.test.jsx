import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippTenantCoverage } from '../../../src/components/CippTable/CippTenantCoverage'

const openMenu = async (user, label) => {
  expect(screen.getByText(label)).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Sync' }))
  return {
    fill: screen.getByRole('menuitem', { name: 'Load missing tenants' }),
    reload: screen.getByRole('menuitem', { name: 'Reload all tenants' }),
  }
}

describe('CippTenantCoverage', () => {
  it('shows a partial cache and loads only the missing tenants', async () => {
    const user = userEvent.setup()
    const onCacheAction = vi.fn()
    renderWithProviders(
      <CippTenantCoverage
        metadata={{ CachedTenants: 40, ExpectedTenants: 133 }}
        onCacheAction={onCacheAction}
      />
    )

    const { fill } = await openMenu(user, '40 of 133 tenants')
    await user.click(fill)

    expect(onCacheAction).toHaveBeenCalledWith('FillMissing')
  })

  it('offers only a full reload when every tenant is cached', async () => {
    const user = userEvent.setup()
    const onCacheAction = vi.fn()
    renderWithProviders(
      <CippTenantCoverage
        metadata={{ CachedTenants: 133, ExpectedTenants: 133 }}
        onCacheAction={onCacheAction}
      />
    )

    const { fill, reload } = await openMenu(user, '133 tenants')
    expect(fill).toHaveAttribute('aria-disabled', 'true')
    await user.click(reload)

    expect(onCacheAction).toHaveBeenCalledWith('RefreshCache')
  })

  it('starts nothing while a run is already filling the cache', () => {
    renderWithProviders(
      <CippTenantCoverage
        metadata={{ CachedTenants: 40, ExpectedTenants: 133, QueueId: 'q-1' }}
        onCacheAction={vi.fn()}
      />
    )

    expect(screen.getByText('40 of 133 tenants')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Sync' })).toBeDisabled()
  })

  it('renders nothing for a response that is not an AllTenants cache', () => {
    const { container } = renderWithProviders(
      <CippTenantCoverage metadata={{}} onCacheAction={vi.fn()} />
    )
    expect(container).toBeEmptyDOMElement()
  })
})
