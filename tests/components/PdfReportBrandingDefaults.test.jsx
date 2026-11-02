import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders, settingsWith } from '../test-utils'
import { api, getResult } from '../mocks/api-call'
import { SharingReportButton } from '../../src/components/CippPdf/SharingReportButton'
import { PermissionsReportButton } from '../../src/components/CippPdf/PermissionsReportButton'
import { MailFlowReportButton } from '../../src/components/CippPdf/MailFlowReportButton'
import { ShadowAIReportButton } from '../../src/components/ShadowAIReportButton'

vi.mock('../../src/api/ApiCall', async () =>
  (await import('../mocks/api-call')).apiCallMock()
)

const TENANT = 'contoso.onmicrosoft.com'
const defaults = {
  sharing: 'preset-sharing',
  permissions: 'preset-permissions',
  mailFlow: 'preset-mail',
  shadowAI: 'preset-ai',
}
let fetchMock

beforeEach(() => {
  api.get = (opts) =>
    opts.url === '/api/ListBrandingSettings'
      ? getResult({ data: { reportDefaults: defaults } })
      : getResult()
  fetchMock = vi.fn(() =>
    Promise.resolve({
      ok: true,
      blob: () =>
        Promise.resolve(new Blob(['%PDF-'], { type: 'application/pdf' })),
    })
  )
  vi.stubGlobal('fetch', fetchMock)
  URL.createObjectURL = vi.fn(() => 'blob:report')
  URL.revokeObjectURL = vi.fn()
})

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

const reports = [
  {
    name: 'Sharing',
    component: (
      <SharingReportButton sharingData={{ summary: {} }} tenantName="Contoso" />
    ),
    endpoint: 'ExecGetSharingReportPdf',
    preset: defaults.sharing,
    button: /export report/i,
  },
  {
    name: 'Permissions',
    component: (
      <PermissionsReportButton
        permissionsData={{ summary: {} }}
        tenantName="Contoso"
      />
    ),
    endpoint: 'ExecGetPermissionsReportPdf',
    preset: defaults.permissions,
    button: /export report/i,
  },
  {
    name: 'Mail Flow',
    component: (
      <MailFlowReportButton
        mailFlowData={{ days: 14, totals: { EmailDelivered: 3 } }}
        tenantName="Contoso"
      />
    ),
    endpoint: 'ExecGetMailFlowReportPdf',
    preset: defaults.mailFlow,
    button: /export report/i,
  },
  {
    name: 'Shadow AI',
    component: (
      <ShadowAIReportButton data={{}} tenantName="Contoso" disabled={false} />
    ),
    endpoint: 'ExecGetShadowAIReportPdf',
    preset: defaults.shadowAI,
    button: /executive shadow ai report/i,
  },
]

describe('Per-report PDF branding defaults', () => {
  it.each(reports)(
    '$name forwards its configured preset to the PDF endpoint',
    async ({ component, endpoint, preset, button }) => {
      renderWithProviders(component, {
        settings: settingsWith({ currentTenant: TENANT }),
      })
      await userEvent.click(screen.getByRole('button', { name: button }))
      await waitFor(() => expect(fetchMock).toHaveBeenCalled())

      const [url, init] = fetchMock.mock.calls.at(-1)
      expect(url).toContain(endpoint)
      if (endpoint === 'ExecGetShadowAIReportPdf') {
        expect(JSON.parse(init.body)).toMatchObject({
          tenantFilter: TENANT,
          brandingPresetId: preset,
        })
      } else {
        const params = new URL(url, 'https://example.com').searchParams
        expect(params.get('tenantFilter')).toBe(TENANT)
        expect(params.get('brandingPresetId')).toBe(preset)
      }
    }
  )
})
