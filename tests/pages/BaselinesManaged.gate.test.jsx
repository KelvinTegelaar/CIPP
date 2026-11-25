import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
import { api, getResult } from '../mocks/api-call'

import Page from '../../src/pages/tenant/baselines/managed/index.jsx'

const loading = getResult({ isSuccess: false, isFetching: true })
const extensionOff = getResult({ data: { GitHub: { Enabled: true } } })
const extensionOn = getResult({
  data: { CyberDrainManagedBaselines: { Enabled: true } },
})
const unreadable = getResult({ isSuccess: false, isError: true })
const emptyList = getResult({ data: { Results: [] } })

const withExtension = (integrations) => (opts) =>
  opts?.url === '/api/ListExtensionsConfig' ? integrations : emptyList

const upgradeHeading = 'Let CyberDrain manage your baselines'

describe('Managed Baselines tab', () => {
  it('shows neither page while the extension state is still loading', () => {
    api.get = withExtension(loading)
    renderWithProviders(<Page />)

    expect(screen.queryByText(upgradeHeading)).not.toBeInTheDocument()
    expect(
      screen.queryByText('Managed Baseline Template')
    ).not.toBeInTheDocument()
  })

  it('shows the upgrade page while the extension is off', () => {
    api.get = withExtension(extensionOff)
    renderWithProviders(<Page />)

    expect(screen.getByText(upgradeHeading)).toBeInTheDocument()
    expect(
      screen.queryByText('Managed Baseline Template')
    ).not.toBeInTheDocument()
  })

  it('shows the two options once the extension is on', () => {
    api.get = withExtension(extensionOn)
    renderWithProviders(<Page />)

    expect(screen.queryByText(upgradeHeading)).not.toBeInTheDocument()
    expect(screen.getByText('Managed Baseline Template')).toBeInTheDocument()
    expect(screen.getByText('Custom Managed Baseline')).toBeInTheDocument()
  })

  it('shows the working page when the extension state cannot be read', () => {
    api.get = withExtension(unreadable)
    renderWithProviders(<Page />)

    expect(screen.queryByText(upgradeHeading)).not.toBeInTheDocument()
    expect(screen.getByText('Managed Baseline Template')).toBeInTheDocument()
  })
})
