import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: () => null,
}))
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: ({ tableFilter }) => <div>{tableFilter}</div>,
}))
import { api, getResult } from '../mocks/api-call'
import { ApiGetCall } from '../../src/api/ApiCall'
import router from 'next/router'

import Page from '../../src/pages/tenant/baselines/alignment/index.jsx'

const baselinesResult = getResult({
  data: [
    {
      GUID: 'g1',
      templateName: 'Baseline One',
      stages: [{ name: 'Pilot' }, { name: 'Broad' }],
    },
  ],
})
const emptyResult = getResult({ data: { standards: [] } })
api.get = (opts) => (opts?.url === '/api/ListBaselines' ? baselinesResult : emptyResult)

const lastAggregateCall = () =>
  ApiGetCall.mock.calls
    .map(([opts]) => opts)
    .filter((opts) => opts?.data?.byStandard)
    .at(-1)

describe('Baseline Alignment tab - by-standard filters', () => {
  afterEach(() => {
    router.query = {}
    delete router.isReady
  })

  it('uses baselineId/stage from the URL and shows the filters only in standard view', async () => {
    router.query = { baselineId: 'g1', stage: '2' }
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    expect(screen.queryByRole('combobox', { name: 'Baseline' })).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /standard view/i }))

    expect(screen.getByRole('combobox', { name: 'Baseline' })).toBeInTheDocument()
    expect(screen.getByText(/scored once per tenant/)).toBeInTheDocument()
    expect(lastAggregateCall()).toEqual(
      expect.objectContaining({
        data: { byStandard: true, baselineId: 'g1', stage: 2 },
        queryKey: 'ListBaselineAlignment-byStandard-g1-2',
      })
    )
  }, 30000)

  it('opens the by-standard view directly from ?view=standard', async () => {
    router.query = { view: 'standard', baselineId: 'g1' }
    router.isReady = true
    renderWithProviders(<Page />)

    expect(await screen.findByRole('combobox', { name: 'Baseline' })).toBeInTheDocument()
    expect(lastAggregateCall()).toEqual(
      expect.objectContaining({ data: { byStandard: true, baselineId: 'g1' } })
    )
  }, 30000)

  it('sends the unfiltered request when the URL has no filter', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await user.click(screen.getByRole('button', { name: /standard view/i }))

    expect(lastAggregateCall()).toEqual(
      expect.objectContaining({
        data: { byStandard: true },
        queryKey: 'ListBaselineAlignment-byStandard',
      })
    )
    expect(screen.queryByText(/scored once per tenant/)).not.toBeInTheDocument()
  }, 30000)
})
