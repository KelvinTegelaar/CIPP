import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import fixture from '../mocks/baseline-tenant-fixture.json'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/tenant/baselines/template.jsx'

const baselinesResult = getResult({ data: [fixture.baseline] })
const definitionsResult = getResult({ data: fixture.definitions })
const customVariablesResult = getResult({ data: { Results: [] } })
const emptyResult = getResult({ isSuccess: false })
api.get = (opts) => {
  if (opts?.url === '/api/ListBaselines') return baselinesResult
  if (opts?.url === '/api/ListBaselineStandards') return definitionsResult
  if (opts?.url === '/api/ListCustomVariables') return customVariablesResult
  return emptyResult
}
api.post = () => postResult()

router.query = { id: fixture.baseline.GUID }
router.pathname = '/tenant/baselines/template'

const TIMEOUT = 'Enable Activity based Timeout'
const PRONOUNS = 'Enable Pronouns'
const SMTP = 'Disable SMTP Basic Authentication'

describe('Baseline template editor - stage search and posture filter', () => {
  it('filters by text and posture, and hidden standards keep unsaved settings', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())

    // Unsaved change on one standard, then collapse it.
    await user.click(screen.getByText(TIMEOUT))
    await user.click(await screen.findByLabelText('Automatically fix this when the setting drifts'))
    await user.click(screen.getByText(TIMEOUT))

    const search = screen.getByPlaceholderText('Search...')
    await user.type(search, 'pronouns')
    expect(screen.getByText(PRONOUNS)).toBeVisible()
    expect(screen.getByText(TIMEOUT)).not.toBeVisible()

    // Category text matches too.
    await user.clear(search)
    await user.type(search, 'exchange')
    expect(screen.getByText(SMTP)).toBeVisible()
    expect(screen.getByText(PRONOUNS)).not.toBeVisible()

    await user.type(search, ' nothing like this')
    expect(screen.getByText('No standards in this stage match the search or filter.')).toBeInTheDocument()

    // The hidden standard kept its unsaved posture, so the posture filter finds it.
    await user.click(screen.getByLabelText('Clear search'))
    await user.click(screen.getByRole('button', { name: 'Auto-remediate (1)' }))
    expect(screen.getByText(TIMEOUT)).toBeVisible()
    expect(screen.getByText(PRONOUNS)).not.toBeVisible()

    await user.click(screen.getByRole('button', { name: 'Report only (8)' }))
    expect(screen.getByText(TIMEOUT)).not.toBeVisible()
    expect(screen.getByText(PRONOUNS)).toBeVisible()

    await user.click(screen.getByRole('button', { name: 'All (9)' }))
    await user.click(screen.getByText(TIMEOUT))
    expect(await screen.findByLabelText('Automatically fix this when the setting drifts')).toBeChecked()
  }, 30000)
})
