import { screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import {
  CippBaselineWhatIfReport,
  describeStageConditions,
} from '../../src/components/CippBaselines/CippBaselineWhatIfReport'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

// The report document itself is composed and rendered on the server now
// (Build-CippBaselineWhatIfReportTree, covered by its Pester tests). What is left here is the
// dialog's contract with ExecGetBaselineWhatIfReportPdf: what it sends and what it does with
// the PDF that comes back.

const ENDPOINT = '/api/ExecGetBaselineWhatIfReportPdf'

// The props the alignment page passes: the tenant it builds from the selected tenant, the
// stageStates of ListBaselineAlignment and the ListBaselines rows.
const tenant = {
  displayName: 'contoso.onmicrosoft.com',
  tenantFilter: 'contoso.onmicrosoft.com',
}
const stageStates = [
  {
    templateId: 'tpl-core',
    templateName: 'Core Security Baseline',
    currentStage: 1,
    totalStages: 3,
  },
]
const baselines = [
  { GUID: 'tpl-core', templateName: 'Core Security Baseline' },
  { GUID: 'tpl-zero-trust', templateName: 'Zero Trust' },
  { GUID: 'tpl-devices', templateName: 'Device Baseline' },
]

// Stable results: CippAutoComplete maps options in an effect keyed on identity.
const brandingResult = getResult({
  data: { reportDefaults: { baseline: 'preset-security' } },
})
const presetsResult = getResult({
  data: [
    { id: 'preset-security', name: 'Security Team' },
    { id: 'preset-board', name: 'Board Pack' },
  ],
})

const pdfResponse = () =>
  Promise.resolve({
    ok: true,
    blob: () =>
      Promise.resolve(new Blob(['%PDF-'], { type: 'application/pdf' })),
  })

let fetchMock
beforeEach(() => {
  api.get = (opts) =>
    opts.url === '/api/ListBrandingSettings' ? brandingResult : presetsResult
  fetchMock = vi.fn(pdfResponse)
  vi.stubGlobal('fetch', fetchMock)
  URL.createObjectURL = vi.fn(() => 'blob:baseline-report')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const lastRequest = () => {
  const [url, init] = fetchMock.mock.calls.at(-1)
  return { url, body: JSON.parse(init.body) }
}

const openReport = async (user) => {
  renderWithProviders(
    <CippBaselineWhatIfReport
      tenant={tenant}
      stageStates={stageStates}
      baselines={baselines}
    />
  )
  // The tooltip text is the button's accessible name (MUI labels a plain child with it).
  await user.click(
    screen.getByRole('button', {
      name: /Preview what applying the configured standards/,
    })
  )
  await screen.findByRole('dialog')
  await waitFor(() => expect(fetchMock).toHaveBeenCalled())
  // jsdom applies no media queries, so the rail and the drawer both exist: scope to the rail.
  return within(screen.getByRole('dialog'))
}

describe('describeStageConditions', () => {
  it('joins conditions with the stage logic', () => {
    expect(
      describeStageConditions({
        conditions: [
          { type: 'time', days: 7, unit: 'days' },
          { type: 'manual' },
        ],
        logic: 'or',
      })
    ).toBe('7 days in the previous stage OR manual approval by an operator')
  })

  it('names the tenant group a group condition waits for, falling back to its id', () => {
    expect(
      describeStageConditions({
        conditions: [
          { type: 'group', group: 'grp-1', groupName: 'Premium customers' },
          { type: 'group', group: 'grp-2' },
        ],
        logic: 'and',
      })
    ).toBe(
      "the tenant is in the 'Premium customers' group AND the tenant is in the 'grp-2' group"
    )
  })
})

describe('CippBaselineWhatIfReport', () => {
  it('renders nothing on the server until the dialog is opened', () => {
    renderWithProviders(
      <CippBaselineWhatIfReport
        tenant={tenant}
        stageStates={stageStates}
        baselines={baselines}
      />
    )

    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('asks the server for the tenant report with both sections and the baseline branding default', async () => {
    await openReport(userEvent.setup())

    expect(lastRequest()).toEqual({
      url: ENDPOINT,
      body: {
        tenantFilter: 'contoso.onmicrosoft.com',
        simulatedTemplateIds: [],
        sectionConfig: { alreadyAligned: true, rolloutStages: true },
        brandingPresetId: 'preset-security',
      },
    })
    expect(
      await screen.findByTitle('Baseline Report - contoso.onmicrosoft.com')
    ).toHaveAttribute('src', 'blob:baseline-report')
  })

  it('offers only unassigned baselines to simulate and sends the picks in the order chosen', async () => {
    const user = userEvent.setup()
    const dialog = await openReport(user)

    await user.click(
      dialog.getAllByRole('combobox', {
        name: 'Simulate additional baselines',
      })[0]
    )
    const listbox = await screen.findByRole('listbox')
    expect(
      within(listbox)
        .getAllByRole('option')
        .map((option) => option.textContent)
    ).toEqual(['Zero Trust', 'Device Baseline'])

    await user.click(
      within(listbox).getByRole('option', { name: 'Device Baseline' })
    )
    await user.click(await screen.findByRole('option', { name: 'Zero Trust' }))

    await waitFor(() =>
      expect(lastRequest().body.simulatedTemplateIds).toEqual([
        'tpl-devices',
        'tpl-zero-trust',
      ])
    )
  })

  it('sends a section switched off, leaving the other on', async () => {
    const user = userEvent.setup()
    const dialog = await openReport(user)

    const card = dialog
      .getAllByText('What Is Already In Place')[0]
      .closest('.MuiPaper-root')
    await user.click(within(card).getByRole('switch'))

    await waitFor(() =>
      expect(lastRequest().body.sectionConfig).toEqual({
        alreadyAligned: false,
        rolloutStages: true,
      })
    )
  })

  it('renders with the branding the operator picks, including back to Default', async () => {
    const user = userEvent.setup()
    const dialog = await openReport(user)

    await user.click(dialog.getAllByRole('combobox', { name: 'Branding' })[0])
    await user.click(await screen.findByRole('option', { name: 'Default' }))

    await waitFor(() => expect(lastRequest().body.brandingPresetId).toBe(''))
  })

  it('downloads the rendered PDF under a tenant-and-date file name', async () => {
    const user = userEvent.setup()
    const dialog = await openReport(user)
    const click = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})

    const download = dialog.getByRole('button', { name: 'Download PDF' })
    await waitFor(() => expect(download).toBeEnabled())
    await user.click(download)

    const anchor = click.mock.contexts.at(-1)
    expect(anchor.href).toBe('blob:baseline-report')
    expect(anchor.download).toBe(
      `Baseline_Report_contoso_onmicrosoft_com_${new Date().toISOString().split('T')[0]}.pdf`
    )
  })

  it('explains a failed render instead of showing an empty preview', async () => {
    fetchMock.mockImplementation(() =>
      Promise.resolve({ ok: false, status: 500 })
    )
    const dialog = await openReport(userEvent.setup())

    expect(
      await dialog.findByText(
        'The report could not be generated. Run the baseline for this tenant and try again.'
      )
    ).toBeInTheDocument()
    expect(dialog.getByRole('button', { name: 'Download PDF' })).toBeDisabled()
  })
})
