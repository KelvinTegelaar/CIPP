import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'
import fixture from '../mocks/baseline-tenant-fixture.json'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/tenant/baselines/template.jsx'

const [defaultStage] = fixture.baseline.stages
// Pronouns sits in stage 2 only, so it can be found and moved from there.
const baseline = {
  ...fixture.baseline,
  stages: [
    {
      ...defaultStage,
      standards: defaultStage.standards.filter(
        (key) => key !== 'EnablePronouns'
      ),
      standardsConfig: defaultStage.standardsConfig.filter(
        (config) => config.standard !== 'EnablePronouns'
      ),
    },
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
const other = {
  GUID: 'other-baseline',
  templateName: 'Workstations',
  stages: [
    { name: 'Default', standards: [], standardsConfig: [] },
    {
      name: 'Later',
      conditions: [{ type: 'manual' }],
      standards: [],
      standardsConfig: [],
    },
  ],
}
// The source as the server returns it after Pronouns was moved out of stage 2.
const movedAway = {
  ...baseline,
  stages: [
    baseline.stages[0],
    { ...baseline.stages[1], standards: [], standardsConfig: [] },
  ],
}

const definitionsResult = getResult({ data: fixture.definitions })
const customVariablesResult = getResult({ data: { Results: [] } })
const emptyResult = getResult({ isSuccess: false })
let baselinesResult
let posted
const refetch = vi.fn(() => {
  baselinesResult = getResult({ data: [movedAway, other], refetch })
  return Promise.resolve()
})

beforeEach(() => {
  posted = []
  refetch.mockClear()
  baselinesResult = getResult({ data: [baseline, other], refetch })
  api.get = (opts) => {
    if (opts?.url === '/api/ListBaselines') return baselinesResult
    if (opts?.url === '/api/ListBaselineStandards') return definitionsResult
    if (opts?.url === '/api/ListCustomVariables') return customVariablesResult
    return emptyResult
  }
  api.post = (opts) =>
    postResult({
      mutate: (request) => {
        posted.push(request)
        opts?.onResult?.({ data: { Results: 'Done' } }, {})
      },
    })
  router.query = { id: fixture.baseline.GUID }
  router.pathname = '/tenant/baselines/template'
})

const TIMEOUT = 'Enable Activity based Timeout'
const PRONOUNS = 'Enable Pronouns'
const STAGE_BUTTON = 'Move or copy this stage to another baseline'
const itemMenu = async (user, text) => {
  await user.click(
    within(screen.getByText(text).closest('.MuiAccordion-root')).getByLabelText(
      'Move or copy'
    )
  )
  return screen.findByRole('menu')
}
const pick = async (user, dialog, label, option) => {
  await user.click(within(dialog).getByRole('combobox', { name: label }))
  const listbox = await screen.findByRole('listbox')
  await user.click(within(listbox).getByRole('option', { name: option }))
}

describe('Baseline template editor - move or copy to another baseline', () => {
  it('offers the actions on standards and stages, and blocks them while there are unsaved changes', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())

    let menu = await itemMenu(user, TIMEOUT)
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Move to another baseline...',
      })
    ).not.toHaveAttribute('aria-disabled')
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Copy to another baseline...',
      })
    ).not.toHaveAttribute('aria-disabled')
    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    )

    const stageButton = screen.getByRole('button', { name: STAGE_BUTTON })
    expect(stageButton).toBeEnabled()
    await user.click(stageButton)
    menu = await screen.findByRole('menu')
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Move stage to another baseline...',
      })
    ).toBeInTheDocument()
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Copy stage to another baseline...',
      })
    ).toBeInTheDocument()
    await user.keyboard('{Escape}')
    await waitFor(() =>
      expect(screen.queryByRole('menu')).not.toBeInTheDocument()
    )

    // Any edit blocks all four until the baseline is saved.
    await user.type(screen.getAllByLabelText('Stage Name')[0], ' edited')
    await waitFor(() =>
      expect(screen.getByRole('button', { name: STAGE_BUTTON })).toBeDisabled()
    )
    menu = await itemMenu(user, TIMEOUT)
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Move to another baseline...',
      })
    ).toHaveAttribute('aria-disabled', 'true')
    expect(
      within(menu).getByRole('menuitem', {
        name: 'Copy to another baseline...',
      })
    ).toHaveAttribute('aria-disabled', 'true')
  }, 30000)

  it('hides the actions when there is no other baseline', async () => {
    baselinesResult = getResult({ data: [baseline], refetch })
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())
    expect(
      screen.queryByRole('button', { name: STAGE_BUTTON })
    ).not.toBeInTheDocument()
    const menu = await itemMenu(user, TIMEOUT)
    expect(
      within(menu).queryByRole('menuitem', {
        name: 'Move to another baseline...',
      })
    ).not.toBeInTheDocument()
  }, 30000)

  it('moves a standard into an existing stage, then reloads the source and stays on the same stage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())
    await user.click(screen.getByRole('tab', { name: 'Stage 2: Pilot' }))

    const menu = await itemMenu(user, PRONOUNS)
    await user.click(
      within(menu).getByRole('menuitem', {
        name: 'Move to another baseline...',
      })
    )
    const dialog = await screen.findByRole('dialog')
    await pick(user, dialog, 'Baseline', 'Workstations')
    await user.click(within(dialog).getByRole('combobox', { name: 'Stage' }))
    const listbox = await screen.findByRole('listbox')
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual([
      'Stage 1: Default',
      'Stage 2: Later',
      'New stage at the end',
    ])
    await user.click(
      within(listbox).getByRole('option', { name: 'Stage 2: Later' })
    )
    expect(
      within(dialog).getByText(
        `Tenants assigned to Workstations will get these settings. Tenants assigned to ${baseline.templateName} stop getting them on the next run.`
      )
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(posted).toHaveLength(1))
    expect(posted[0].url).toBe('/api/ExecMoveBaselineStandards')
    expect(posted[0].data).toEqual({
      sourceId: baseline.GUID,
      targetId: 'other-baseline',
      mode: 'move',
      standard: 'EnablePronouns',
      sourceStage: 1,
      targetStage: 1,
    })
    await waitFor(() => expect(refetch).toHaveBeenCalled())
    await waitFor(() =>
      expect(screen.queryByText(PRONOUNS)).not.toBeInTheDocument()
    )
    expect(
      screen.getByRole('tab', { name: 'Stage 2: Pilot', hidden: true })
    ).toHaveAttribute('aria-selected', 'true')
  }, 30000)

  it('puts a single standard in a new stage at the end and warns it has no conditions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())

    const menu = await itemMenu(user, TIMEOUT)
    await user.click(
      within(menu).getByRole('menuitem', {
        name: 'Copy to another baseline...',
      })
    )
    const dialog = await screen.findByRole('dialog')
    await pick(user, dialog, 'Baseline', 'Workstations')
    await pick(user, dialog, 'Stage', 'New stage at the end')
    expect(
      within(dialog).getByText(
        'Tenants assigned to Workstations will get these settings. The new stage has no graduation conditions yet, so no tenant moves into it until you add one. Workstations cannot be saved again in the editor until the stage has a condition.'
      )
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(posted).toHaveLength(1))
    expect(posted[0].data).toEqual({
      sourceId: baseline.GUID,
      targetId: 'other-baseline',
      mode: 'copy',
      standard: 'ActivityBasedTimeout',
      sourceStage: 0,
      newStage: 'end',
    })
    expect(refetch).not.toHaveBeenCalled()
  }, 30000)

  it('copies a whole stage to a new stage at the end by default, offering no existing stage', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())

    await user.click(screen.getByRole('tab', { name: 'Stage 2: Pilot' }))
    await user.click(screen.getByRole('button', { name: STAGE_BUTTON }))
    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Copy stage to another baseline...',
      })
    )
    const dialog = await screen.findByRole('dialog')
    await pick(user, dialog, 'Baseline', 'Workstations')
    await waitFor(() =>
      expect(
        within(dialog).getByRole('combobox', { name: 'Place the new stage' })
      ).toHaveValue('New stage at the end')
    )
    await user.click(
      within(dialog).getByRole('combobox', { name: 'Place the new stage' })
    )
    const listbox = await screen.findByRole('listbox')
    // The selected 'New stage at the end' is left out of the list; no existing stage is offered.
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual([
      'New stage after Stage 1: Default',
      'New stage after Stage 2: Later',
    ])
    await user.keyboard('{Escape}')
    // The stage keeps its manual-approval condition, so there is no warning.
    expect(
      within(dialog).getByText(
        'Tenants assigned to Workstations will get these settings.'
      )
    ).toBeInTheDocument()
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))

    await waitFor(() => expect(posted).toHaveLength(1))
    expect(posted[0].data).toEqual({
      sourceId: baseline.GUID,
      targetId: 'other-baseline',
      mode: 'copy',
      stage: 1,
      newStage: 'end',
    })
  }, 30000)

  it('lets stage 1 move as a new stage, warning that it has no conditions', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)
    await waitFor(() => expect(screen.getByText(TIMEOUT)).toBeInTheDocument())

    await user.click(screen.getByRole('button', { name: STAGE_BUTTON }))
    await user.click(
      await screen.findByRole('menuitem', {
        name: 'Move stage to another baseline...',
      })
    )
    const dialog = await screen.findByRole('dialog')
    await pick(user, dialog, 'Baseline', 'Workstations')
    await waitFor(() =>
      expect(
        within(dialog).getByText(
          `Tenants assigned to Workstations will get these settings. Tenants assigned to ${baseline.templateName} stop getting them on the next run. The new stage has no graduation conditions yet, so no tenant moves into it until you add one. Workstations cannot be saved again in the editor until the stage has a condition.`
        )
      ).toBeInTheDocument()
    )
    await user.click(within(dialog).getByRole('button', { name: 'Confirm' }))
    await waitFor(() => expect(posted).toHaveLength(1))
    expect(posted[0].data).toEqual({
      sourceId: baseline.GUID,
      targetId: 'other-baseline',
      mode: 'move',
      stage: 0,
      newStage: 'end',
    })
  }, 30000)
})
