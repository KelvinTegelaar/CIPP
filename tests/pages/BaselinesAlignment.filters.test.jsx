import React from 'react'
import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'

const tablePage = vi.hoisted(() => ({ props: null }))
const dataTable = vi.hoisted(() => ({ props: null }))
vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
vi.mock('../../src/components/CippTable/CippDataTable', () => ({
  CippDataTable: (props) => {
    dataTable.props = props
    return null
  },
}))
vi.mock('../../src/components/CippComponents/CippTablePage.jsx', () => ({
  CippTablePage: (props) => {
    tablePage.props = props
    return <div>{props.tableFilter}</div>
  },
}))
import { api, getResult, postResult } from '../mocks/api-call'
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
const defaultGet = (opts) =>
  opts?.url === '/api/ListBaselines' ? baselinesResult : emptyResult
api.get = defaultGet

const lastAggregateCall = () =>
  ApiGetCall.mock.calls
    .map(([opts]) => opts)
    .filter((opts) => opts?.data?.byStandard)
    .at(-1)

describe('Baseline Alignment tab - by-standard filters', () => {
  afterEach(() => {
    router.query = {}
    delete router.isReady
    api.get = defaultGet
  })

  it('Edit Baseline targets the one baseline a standard resolves from, and hides when it is ambiguous', async () => {
    const standardsResult = getResult({
      data: {
        standards: [
          {
            standardName: 'Single',
            rows: [{ templateId: 'g1' }, { templateId: 'g1' }],
          },
          {
            standardName: 'Mixed',
            rows: [{ templateId: 'g1' }, { templateId: 'g2' }],
          },
        ],
      },
    })
    api.get = (opts) =>
      opts?.data?.byStandard ? standardsResult : defaultGet(opts)
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await user.click(screen.getByRole('button', { name: /standard view/i }))

    const [single, mixed] = tablePage.props.data
    const editBaseline = tablePage.props.actions.find(
      (action) => action.label === 'Edit Baseline'
    )
    expect(editBaseline.link).toBe('/tenant/baselines/template?id=[templateId]')
    expect(single.templateId).toBe('g1')
    expect(editBaseline.hideCondition(single)).toBe(false)
    expect(mixed.templateId).toBeNull()
    expect(editBaseline.hideCondition(mixed)).toBe(true)
  }, 30000)

  it('Edit Baseline uses the filtered baseline when one is picked', async () => {
    router.query = { view: 'standard', baselineId: 'g2' }
    router.isReady = true
    const standardsResult = getResult({
      data: {
        standards: [
          {
            standardName: 'Mixed',
            rows: [{ templateId: 'g1' }, { templateId: 'g2' }],
          },
        ],
      },
    })
    api.get = (opts) =>
      opts?.data?.byStandard ? standardsResult : defaultGet(opts)
    renderWithProviders(<Page />)
    await screen.findByRole('combobox', { name: 'Baseline' })

    expect(tablePage.props.data[0].templateId).toBe('g2')
  }, 30000)

  it('uses baselineId/stage from the URL and shows the filters only in standard view', async () => {
    router.query = { baselineId: 'g1', stage: '2' }
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    expect(
      screen.queryByRole('combobox', { name: 'Baseline' })
    ).not.toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /standard view/i }))

    expect(
      screen.getByRole('combobox', { name: 'Baseline' })
    ).toBeInTheDocument()
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

    expect(
      await screen.findByRole('combobox', { name: 'Baseline' })
    ).toBeInTheDocument()
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
  it('runs every assigned baseline for the selected tenant from Tenant View', async () => {
    const post = postResult()
    api.post = post
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await user.click(
      screen.getByRole('button', { name: 'Run All Assigned Baselines' })
    )
    expect(
      await screen.findByText(
        /Run every baseline assigned to testdomain.com now/
      )
    ).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /confirm/i }))

    const payload = post.mutate.mock.calls.at(-1)[0]
    expect(payload.url).toBe('/api/ExecBaselineRun')
    expect(payload.data).toEqual({
      mode: 'run',
      tenantFilter: 'testdomain.com',
    })
    api.post = postResult()
  }, 30000)

  it('hides Run All Assigned Baselines for All Tenants', async () => {
    renderWithProviders(<Page />, {
      settings: settingsWith({ currentTenant: 'AllTenants' }),
    })
    expect(
      screen.queryByRole('button', { name: 'Run All Assigned Baselines' })
    ).not.toBeInTheDocument()
  }, 30000)

  it('shows the standard description in the Standard Details drawer, and tolerates rows without a definition', async () => {
    const definitions = getResult({
      data: [{ name: 'standards.Known', helpText: 'Blocks legacy sign-in.' }],
    })
    const alignment = getResult({
      data: {
        rows: [
          { standardName: 'standards.Known#1', standardLabel: 'Known' },
          { standardName: 'standards.Unknown', standardLabel: 'Unknown' },
        ],
      },
    })
    api.get = (opts) =>
      opts?.url === '/api/ListBaselineStandards'
        ? definitions
        : opts?.url === '/api/ListBaselineAlignment'
          ? alignment
          : defaultGet(opts)
    renderWithProviders(<Page />)
    const drawer = dataTable.props.offCanvas
    const [known, unknown] = alignment.data.rows

    renderWithProviders(<>{drawer.children(known)}</>)
    expect(screen.getByText('Blocks legacy sign-in.')).toBeInTheDocument()

    const { container } = renderWithProviders(<>{drawer.children(unknown)}</>)
    expect(container.textContent).not.toContain('Blocks legacy sign-in.')
  }, 30000)
})
