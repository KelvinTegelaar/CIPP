import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import router from '../mocks/next-router'

// The tiptap editor tree cannot load in jsdom (mui-tiptap's ResizableImage requires an
// uninstalled peer); the blank-block editor is not exercised by these tests, so stub it out.
vi.mock('mui-tiptap', () => {
  const stubComponent = () => null
  return {
    MenuButtonAddTable: stubComponent,
    MenuButtonBold: stubComponent,
    MenuButtonBulletedList: stubComponent,
    MenuButtonCode: stubComponent,
    MenuButtonCodeBlock: stubComponent,
    MenuButtonItalic: stubComponent,
    MenuButtonOrderedList: stubComponent,
    MenuButtonRedo: stubComponent,
    MenuButtonStrikethrough: stubComponent,
    MenuButtonUnderline: stubComponent,
    MenuButtonUndo: stubComponent,
    MenuButton: stubComponent,
    MenuControlsContainer: stubComponent,
    MenuDivider: stubComponent,
    MenuSelectHeading: stubComponent,
    RichTextEditor: stubComponent,
  }
})
vi.mock('mui-tiptap/icons', () => {
  const stubComponent = () => null
  return {
    DeleteColumn: stubComponent,
    DeleteRow: stubComponent,
    InsertColumnLeft: stubComponent,
    InsertColumnRight: stubComponent,
    InsertRowBottom: stubComponent,
    InsertRowTop: stubComponent,
  }
})
vi.mock('../../src/components/CippComponents/CippRichTextField', () => ({
  default: () => null,
}))

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)
import { api, getResult, postResult } from '../mocks/api-call'

import Page from '../../src/pages/tools/report-builder/builder/index.jsx'

const TEMPLATE_GUID = '6d1d5c1e-7b8a-4c3e-9f2a-1a2b3c4d5e6f'
const template = {
  GUID: TEMPLATE_GUID,
  RowKey: TEMPLATE_GUID,
  Name: 'Weekly Health',
  Blocks: [{ type: 'blank', title: 'Intro', content: 'Hello' }],
  Settings: { size: 'A4', orientation: 'portrait' },
}

const templatesResult = getResult({ data: [template] })
const emptyResult = getResult({ isSuccess: false })
api.get = (opts) => {
  if (opts?.url?.startsWith('/api/ListReportBuilderTemplates'))
    return templatesResult
  return emptyResult
}
const mutate = vi.fn()
api.post = postResult({ mutate })

const scheduledPayloads = () =>
  mutate.mock.calls
    .map(([call]) => call)
    .filter((call) => call?.url === '/api/AddScheduledItem')
    .map((call) => call.data)

const openScheduleDialog = async (user) => {
  const toolbarButton = await screen.findByRole('button', { name: 'Schedule' })
  await waitFor(() => expect(toolbarButton).toBeEnabled())
  await user.click(toolbarButton)
  return screen.findByRole('dialog', { name: 'Schedule Report Generation' })
}

describe('Report builder - scheduling a saved template', () => {
  beforeEach(() => {
    mutate.mockClear()
    router.query = { id: TEMPLATE_GUID }
    router.pathname = '/tools/report-builder/builder'
  })

  it('references the template by GUID so each run follows later template edits', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    const dialog = await openScheduleDialog(user)
    const followSwitch = within(dialog).getByRole('switch', {
      name: 'Always use the latest saved version of this template',
    })
    expect(followSwitch).toBeChecked()
    expect(
      within(dialog).getByText(/from the saved template/)
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Schedule' }))

    await waitFor(() => expect(scheduledPayloads()).toHaveLength(1))
    const payload = scheduledPayloads()[0]
    expect(payload.command.value).toBe('Push-ExecGenerateReportBuilderReport')
    expect(payload.parameters.TemplateGUID).toBe(TEMPLATE_GUID)
    expect(payload.parameters.TemplateName).toBe('Weekly Health')
    expect(payload.parameters.TenantFilter).toBe('testdomain.com')
    expect(payload.parameters).not.toHaveProperty('Blocks')
    expect(payload.parameters).not.toHaveProperty('Settings')
  }, 30000)

  it('snapshots the blocks when the operator turns the template link off', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Page />)

    const dialog = await openScheduleDialog(user)
    await user.click(
      within(dialog).getByRole('switch', {
        name: 'Always use the latest saved version of this template',
      })
    )
    expect(
      within(dialog).getByText(
        /using a copy of the current block configuration/
      )
    ).toBeInTheDocument()

    await user.click(within(dialog).getByRole('button', { name: 'Schedule' }))

    await waitFor(() => expect(scheduledPayloads()).toHaveLength(1))
    const payload = scheduledPayloads()[0]
    expect(payload.parameters).not.toHaveProperty('TemplateGUID')
    expect(JSON.parse(payload.parameters.Blocks)).toHaveLength(1)
    expect(JSON.parse(payload.parameters.Blocks)[0].title).toBe('Intro')
    expect(JSON.parse(payload.parameters.Settings)).toMatchObject({
      size: 'A4',
    })
  }, 30000)
})
