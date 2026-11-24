import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import fixture from '../mocks/baseline-tenant-fixture.json'

vi.mock('../../src/api/ApiCall', async () => (await import('../mocks/api-call')).apiCallMock())
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/tenant/baselines/template.jsx'

// Second stage already holds Pronouns, so a move of Pronouns there must be refused.
const [defaultStage] = fixture.baseline.stages
const baseline = {
  ...fixture.baseline,
  stages: [
    defaultStage,
    {
      name: 'Pilot',
      logic: 'and',
      conditions: [{ type: 'manual' }],
      standards: ['EnablePronouns'],
      standardsConfig: defaultStage.standardsConfig.filter(
        (config) => config.standard === 'EnablePronouns'
      ),
    },
  ],
}
const baselinesResult = getResult({ data: [baseline] })
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
const REMEDIATE = 'Automatically fix this when the setting drifts'

describe('Baseline template editor - move a standard to another stage', () => {
  it('carries unsaved settings to the target stage and refuses a duplicate single-instance standard', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())

    // A stage already holding the same single-instance standard is offered but disabled.
    await user.click(within(screen.getAllByText(PRONOUNS)[0].closest('.MuiAccordion-root')).getByLabelText('Move or copy'))
    expect(await screen.findByRole('menuitem', { name: 'Stage 2: Pilot (already in this stage)' })).toHaveAttribute('aria-disabled', 'true')
    await user.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())

    // Unsaved change: switch the timeout standard to auto-remediate, then move it.
    await user.click(screen.getByText(TIMEOUT))
    await user.click(await screen.findByLabelText(REMEDIATE))
    await waitFor(() => expect(screen.getByText('Auto-remediate')).toBeInTheDocument())
    await user.click(within(screen.getByText(TIMEOUT).closest('.MuiAccordion-root')).getByLabelText('Move or copy'))
    await user.click(await screen.findByRole('menuitem', { name: 'Stage 2: Pilot' }))

    // Gone from stage 1, listed in stage 2.
    await waitFor(() => expect(screen.getAllByText(TIMEOUT)).toHaveLength(1))
    await user.click(screen.getByRole('tab', { name: 'Stage 2: Pilot' }))
    expect(screen.getByText(TIMEOUT)).toBeVisible()
    expect(screen.getByText('Standards in this stage (2)')).toBeInTheDocument()
    expect(screen.getByText('Standards in this stage (8)')).toBeInTheDocument()

    // Same settings: the unsaved posture and the saved variable both arrived.
    expect(within(screen.getByText(TIMEOUT).closest('.MuiAccordion-root')).getByText('Auto-remediate')).toBeInTheDocument()
    await user.click(screen.getByText(TIMEOUT))
    expect(await screen.findByLabelText(REMEDIATE)).toBeChecked()
    expect(screen.getByDisplayValue('6 Hours')).toBeInTheDocument()

    // Moving back is allowed now that stage 1 no longer holds it.
    await user.click(within(screen.getByText(TIMEOUT).closest('.MuiAccordion-root')).getByLabelText('Move or copy'))
    expect(await screen.findByRole('menuitem', { name: 'Stage 1: Default' })).not.toHaveAttribute('aria-disabled')
  }, 30000)
})
