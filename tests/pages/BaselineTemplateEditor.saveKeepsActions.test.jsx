import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { act, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import fixture from '../mocks/baseline-tenant-fixture.json'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/tenant/baselines/template.jsx'

const SAVED_ID = 'aaaaaaaa-0000-0000-0000-000000000001'
// The list already holds the entry the create will return, standing in for the refetch
// that follows a save; it is only looked up once the route points at it.
const savedClone = { ...fixture.baseline, GUID: SAVED_ID, templateName: 'Clone' }
const baselinesResult = getResult({ data: [fixture.baseline, savedClone] })
const definitionsResult = getResult({ data: fixture.definitions })
const customVariablesResult = getResult({ data: { Results: [] } })
const emptyResult = getResult({ isSuccess: false })
api.get = (opts) => {
  if (opts?.url === '/api/ListBaselines') return baselinesResult
  if (opts?.url === '/api/ListBaselineStandards') return definitionsResult
  if (opts?.url === '/api/ListCustomVariables') return customVariablesResult
  return emptyResult
}
// Capture every post hook's onResult so the test can deliver a save response the way
// CippApiDialog would, without driving the confirm dialog.
const postResults = []
const sharedPost = postResult()
api.post = (opts) => {
  if (opts?.onResult) postResults.push(opts.onResult)
  return sharedPost
}

// A clone saves as a CREATE (no id yet), the same path a brand-new baseline takes.
router.query = { id: fixture.baseline.GUID, clone: '1' }
router.pathname = '/tenant/baselines/template'
// A shallow replace moves the route to the saved id, as the real router would.
router.replace = vi.fn((url) => {
  router.query = url.query
  return Promise.resolve()
})

describe('Baseline template editor - first save keeps per-standard actions', () => {
  it('keeps a standard on auto-remediate after the create response assigns the id', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    await waitFor(() => {
      expect(screen.getByText('Enable Activity based Timeout')).toBeInTheDocument()
    })
    await user.click(screen.getByText('Enable Activity based Timeout'))

    // Fixture stores this standard as report-only; switch it to auto-remediate.
    const remediate = await screen.findByLabelText('Automatically fix this when the setting drifts')
    expect(remediate).not.toBeChecked()
    await user.click(remediate)
    await waitFor(() => expect(screen.getByText('Auto-remediate')).toBeInTheDocument())

    // The create response hands back a new GUID, which the editor adopts.
    expect(postResults.length).toBeGreaterThan(0)
    await act(async () => {
      postResults.forEach((onResult) => onResult({ Results: 'saved', Metadata: { id: SAVED_ID } }))
    })

    expect(router.replace).toHaveBeenCalled()
    // Still auto-remediate: the stage panel and its form survived the save.
    await waitFor(() => expect(screen.getByText('Auto-remediate')).toBeInTheDocument())
    expect(screen.getByLabelText('Automatically fix this when the setting drifts')).toBeChecked()
  }, 30000)
})
