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

// Route ApiGetCall by url with STABLE result identities (fresh literals per call loop
// data-sync effects - see mocks/api-call.js).
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
api.post = postResult()

router.query = { id: fixture.baseline.GUID }
router.pathname = '/tenant/baselines/template'

describe('Baseline template editor - migrated variable seeding', () => {
  it('shows the saved MailContacts addresses after expanding the standard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    // Template loaded: its name is in the form and the standard is listed.
    await waitFor(() => {
      expect(screen.getByText('Set contact e-mails')).toBeInTheDocument()
    })

    // Expand the accordion the way an operator does (details mount lazily).
    await user.click(screen.getByText('Set contact e-mails'))

    const inputs = await screen.findAllByRole('textbox')
    const byLabel = {}
    for (const input of inputs) {
      const label = input.closest('.MuiFormControl-root')?.querySelector('label')?.textContent
      if (label) byLabel[label] = input.value
    }
    console.log('DBG editor fields:', JSON.stringify(byLabel))

    await waitFor(() => {
      const security = screen
        .getAllByRole('textbox')
        .find(
          (input) =>
            input
              .closest('.MuiFormControl-root')
              ?.querySelector('label')
              ?.textContent?.includes('Security contact email')
        )
      expect(security).toBeTruthy()
      expect(security.value).toBe('support@bezalu.com')
    })
  }, 30000)
})
