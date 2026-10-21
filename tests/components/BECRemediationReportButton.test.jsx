import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import { BECRemediationReportButton } from '../../src/components/BECRemediationReportButton'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

const TENANT = 'contoso.onmicrosoft.com'
const branding = getResult({
  data: {
    reportDefaults: { bec: 'preset-full', becSummary: 'preset-summary' },
  },
})
let fetchMock

beforeEach(() => {
  api.get = () => branding
  fetchMock = vi.fn(() =>
    Promise.resolve({
      ok: true,
      blob: () =>
        Promise.resolve(new Blob(['%PDF-'], { type: 'application/pdf' })),
    })
  )
  vi.stubGlobal('fetch', fetchMock)
  URL.createObjectURL = vi.fn(() => 'blob:bec-report')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const renderButton = () =>
  renderWithProviders(
    <BECRemediationReportButton
      userData={{ id: 'u1', userPrincipalName: 'user@contoso.com' }}
      becData={{ CaseId: 'BEC-1' }}
      tenantName="Contoso"
    />,
    { settings: settingsWith({ currentTenant: TENANT }) }
  )

const lastParams = () =>
  new URL(fetchMock.mock.calls.at(-1)[0], 'https://example.com').searchParams

describe('BECRemediationReportButton branding defaults', () => {
  it('sends the full preset then the summary preset when the variant changes', async () => {
    const user = userEvent.setup()
    renderButton()
    await user.click(
      screen.getByRole('button', {
        name: 'Generate BEC Remediation Report PDF',
      })
    )
    await screen.findByRole('dialog')
    await waitFor(() => expect(fetchMock).toHaveBeenCalled())
    expect(lastParams().get('brandingPresetId')).toBe('preset-full')

    await user.click(screen.getByRole('button', { name: 'C-suite summary' }))
    await waitFor(() =>
      expect(lastParams().get('brandingPresetId')).toBe('preset-summary')
    )
    expect(lastParams().get('variant')).toBe('summary')
  })
})
