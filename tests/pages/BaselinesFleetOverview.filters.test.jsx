import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
vi.mock('../../src/components/CippCards/CippChartCard', () => ({
  CippChartCard: ({ title }) => <div>{title}</div>,
}))
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => null,
}))
import { api, getResult } from '../mocks/api-call'
import { ApiGetCall } from '../../src/api/ApiCall'
import router from 'next/router'

import Page from '../../src/pages/tenant/baselines/index.jsx'

const baselinesResult = getResult({
  data: [
    {
      GUID: 'g1',
      templateName: 'Baseline One',
      stages: [{ name: 'Pilot' }, { name: 'Broad' }],
    },
    { GUID: 'g2', templateName: 'Baseline Two', stages: [{ name: 'Only' }] },
  ],
})
const aggregateResult = getResult({
  data: { fleet: { total: 1 }, standards: [], tenants: [], trend: [], activeDeviations: [] },
})
api.get = (opts) => (opts?.url === '/api/ListBaselines' ? baselinesResult : aggregateResult)

const lastAggregateCall = () =>
  ApiGetCall.mock.calls
    .map(([opts]) => opts)
    .filter((opts) => opts?.url === '/api/ListBaselineAlignment')
    .at(-1)

describe('Baselines Fleet Overview - baseline/stage filters', () => {
  it('sends the unfiltered request by default and filters by baseline and stage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    expect(lastAggregateCall()).toMatchObject({
      data: { byStandard: true },
      queryKey: 'ListBaselineAlignment-byStandard',
    })
    expect(lastAggregateCall().data).toEqual({ byStandard: true })
    expect(screen.getByRole('combobox', { name: 'Stage' })).toBeDisabled()
    expect(screen.queryByText(/scored once per tenant/)).not.toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Baseline' }))
    await user.click(await screen.findByRole('option', { name: 'Baseline One' }))
    await waitFor(() =>
      expect(lastAggregateCall()).toEqual(
        expect.objectContaining({
          data: { byStandard: true, baselineId: 'g1' },
          queryKey: 'ListBaselineAlignment-byStandard-g1',
        })
      )
    )
    expect(screen.getByText(/scored once per tenant/)).toBeInTheDocument()

    await user.click(screen.getByRole('combobox', { name: 'Stage' }))
    await user.click(await screen.findByRole('option', { name: 'Broad' }))
    await waitFor(() =>
      expect(lastAggregateCall()).toEqual(
        expect.objectContaining({
          data: { byStandard: true, baselineId: 'g1', stage: 2 },
          queryKey: 'ListBaselineAlignment-byStandard-g1-2',
        })
      )
    )

    await user.click(screen.getByRole('combobox', { name: 'Baseline' }))
    await user.click(await screen.findByRole('option', { name: 'All baselines' }))
    await waitFor(() =>
      expect(lastAggregateCall()).toEqual(
        expect.objectContaining({
          data: { byStandard: true },
          queryKey: 'ListBaselineAlignment-byStandard',
        })
      )
    )
  }, 30000)

  it('carries the active filter into the Alignment tab tile links only when set', async () => {
    const user = userEvent.setup()
    const push = vi.spyOn(router, 'push').mockResolvedValue(true)
    renderWithProviders(<Page />)

    await user.click(screen.getByText('Open Deviations'))
    expect(push).toHaveBeenLastCalledWith('/tenant/baselines/alignment?status=Drift')

    await user.click(screen.getByRole('combobox', { name: 'Baseline' }))
    await user.click(await screen.findByRole('option', { name: 'Baseline One' }))
    await user.click(screen.getByRole('combobox', { name: 'Stage' }))
    await user.click(await screen.findByRole('option', { name: 'Broad' }))
    await user.click(screen.getByText('Open Deviations'))
    expect(push).toHaveBeenLastCalledWith(
      '/tenant/baselines/alignment?view=standard&baselineId=g1&stage=2'
    )
    await user.click(screen.getByText('License Missing'))
    expect(push).toHaveBeenLastCalledWith(
      '/tenant/baselines/alignment?view=standard&baselineId=g1&stage=2'
    )
  }, 30000)
})
