import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import fixture from '../mocks/baseline-tenant-fixture.json'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/tenant/baselines/template.jsx'

// SMTP basic auth's switch is bound to a variable on a standard nobody expands, so its field
// never mounts: only the save check can catch it.
const baselineWith = (value) => ({
  ...fixture.baseline,
  stages: fixture.baseline.stages.map((stage) => ({
    ...stage,
    standardsConfig: stage.standardsConfig.map((config) =>
      config.standard === 'DisableBasicAuthSMTP'
        ? { ...config, variables: { disabled: value } }
        : config
    ),
  })),
})

const variablesResult = getResult({
  data: {
    Results: [
      { Variable: '%TextVar%', VariableType: 'string', Type: 'custom' },
      { Variable: '%BoolVar%', VariableType: 'boolean', Type: 'custom' },
    ],
  },
})
const definitionsResult = getResult({ data: fixture.definitions })
const emptyResult = getResult({ isSuccess: false })
const renderWith = (value) => {
  const baselinesResult = getResult({ data: [baselineWith(value)] })
  api.get = (opts) => {
    if (opts?.url === '/api/ListBaselines') return baselinesResult
    if (opts?.url === '/api/ListBaselineStandards') return definitionsResult
    if (opts?.url?.startsWith('/api/ListCustomVariables'))
      return variablesResult
    return emptyResult
  }
  api.post = () => postResult()
  router.query = { id: fixture.baseline.GUID }
  router.pathname = '/tenant/baselines/template'
  renderWithProviders(<Page />)
}

describe('Baseline template editor - switches bound to a custom variable', () => {
  it('blocks saving when a switch uses a variable that is not boolean', async () => {
    const user = userEvent.setup()
    renderWith('%TextVar%')
    await waitFor(() =>
      expect(
        screen.getByText('Enable Activity based Timeout')
      ).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /Save Baseline/ }))

    expect(
      await screen.findByText(
        /%TextVar% is a string variable, but a switch needs a boolean one/
      )
    ).toBeInTheDocument()
    expect(screen.queryByText(/Save this baseline\?/)).toBeNull()
  }, 30000)

  it('blocks saving when a switch is in variable mode with nothing picked', async () => {
    const user = userEvent.setup()
    renderWith(null)
    await waitFor(() =>
      expect(
        screen.getByText('Enable Activity based Timeout')
      ).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /Save Baseline/ }))

    expect(
      await screen.findByText(/no custom variable is picked/)
    ).toBeInTheDocument()
    expect(screen.queryByText(/Save this baseline\?/)).toBeNull()
  }, 30000)

  it('saves when the switch uses a boolean variable', async () => {
    const user = userEvent.setup()
    renderWith('%BoolVar%')
    await waitFor(() =>
      expect(
        screen.getByText('Enable Activity based Timeout')
      ).toBeInTheDocument()
    )

    await user.click(screen.getByRole('button', { name: /Save Baseline/ }))

    expect(await screen.findByText(/Save this baseline\?/)).toBeInTheDocument()
    expect(screen.queryByText(/Fix these settings before saving/)).toBeNull()
  }, 30000)
})
