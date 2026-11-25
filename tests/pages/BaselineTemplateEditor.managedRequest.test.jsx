import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import fixture from '../mocks/baseline-tenant-fixture.json'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
// The save dialog is captured instead of driven: its api prop carries the payload builder
// and the callback that adopts the saved baseline.
let saveDialog
vi.mock('../../src/components/CippComponents/CippApiDialog', () => ({
  CippApiDialog: (props) => {
    if (props.title === 'Save Baseline') saveDialog = props
    return null
  },
}))
import { api, getResult } from '../mocks/api-call'
import { ApiGetCall } from '../../src/api/ApiCall'

import Page from '../../src/pages/tenant/baselines/template.jsx'

const SAVED_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
// What the request endpoint hands the editor: a baseline row that has never been saved.
const delivered = {
  ...fixture.baseline,
  GUID: 'managed-request-request-9',
  templateName: 'Custom baseline',
  assignments: [
    { value: 'contoso.com', label: 'Contoso (contoso.com)', type: 'Tenant' },
  ],
  managedRequestId: 'request-9',
  managedVersion: '2',
}
const saved = { ...delivered, GUID: SAVED_ID, isManaged: true }
const baselinesResult = getResult({ data: [saved] })
const deliveredResult = getResult({ data: { Results: delivered } })
const definitionsResult = getResult({ data: fixture.definitions })
const customVariablesResult = getResult({ data: { Results: [] } })
const emptyResult = getResult({ isSuccess: false })
api.get = (opts) => {
  if (opts?.url === '/api/ListBaselines') return baselinesResult
  if (opts?.url === '/api/ListManagedBaselineRequests') return deliveredResult
  if (opts?.url === '/api/ListBaselineStandards') return definitionsResult
  if (opts?.url === '/api/ListCustomVariables') return customVariablesResult
  return emptyResult
}

router.query = { managedRequest: 'request-9' }
router.pathname = '/tenant/baselines/template'
router.replace = vi.fn((url) => {
  router.query = url.query
  return Promise.resolve()
})

describe('Baseline template editor - a delivered custom managed baseline', () => {
  it('loads the delivery and ties only the first save to its request', async () => {
    renderWithProviders(<Page />)

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: 'Review Managed Baseline' })
      ).toBeInTheDocument()
    })
    expect(
      ApiGetCall.mock.calls.some(
        ([opts]) =>
          opts?.url === '/api/ListManagedBaselineRequests' &&
          opts.data?.requestId === 'request-9' &&
          opts.data?.includeBaseline === true &&
          opts.waiting === true
      )
    ).toBe(true)
    expect(screen.getByDisplayValue('Custom baseline')).toBeInTheDocument()

    // Nothing is saved yet: the first save creates the baseline and names the request.
    const first = saveDialog.api.customDataformatter({}, {}, {})
    expect(first.GUID).toBeUndefined()
    expect(first.managedRequestId).toBe('request-9')
    expect(first.managedVersion).toBe('2')
    expect(first.assignedTenants).toEqual([
      { value: 'contoso.com', label: 'Contoso (contoso.com)', type: 'Tenant' },
    ])

    await act(async () => {
      saveDialog.api.onSuccess({ Results: 'saved', Metadata: { id: SAVED_ID } })
    })

    // The address now points at the saved baseline, and a second save just updates it.
    expect(router.replace).toHaveBeenCalledWith(
      { pathname: '/tenant/baselines/template', query: { id: SAVED_ID } },
      undefined,
      { shallow: true }
    )
    const second = saveDialog.api.customDataformatter({}, {}, {})
    expect(second.GUID).toBe(SAVED_ID)
    expect(second.managedRequestId).toBeUndefined()
    expect(second.managedVersion).toBeUndefined()
  }, 30000)
})
