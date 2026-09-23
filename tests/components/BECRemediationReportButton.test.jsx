import { pdf } from '@react-pdf/renderer'
import { BECRemediationReportDocument } from '../../src/components/BECRemediationReportButton'
import {
  SAMPLE_BEC,
  SAMPLE_TENANT_NAME,
} from '../../src/components/CippPdf/previewSampleData'

// Real render, not a stub: a JSX or data error in the report only surfaces in react-pdf's layout
// pass, so a shallow render asserts nothing useful. This exercises the executive summary — the
// findings-at-a-glance table, the by-objective bar chart, the tailored priority actions and the
// order-of-events timeline — for real, on both a populated case and an empty one.
const renderToBlob = (node) => pdf(node).toBlob()

const baseProps = {
  brandingSettings: {},
  tenantName: SAMPLE_TENANT_NAME,
  variables: {},
}

describe('BECRemediationReportDocument', () => {
  it('renders the sample BEC case to a PDF', async () => {
    const blob = await renderToBlob(
      <BECRemediationReportDocument
        {...baseProps}
        userData={SAMPLE_BEC.userData}
        becData={SAMPLE_BEC.becData}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders with no findings at all, so a clean tenant still produces a report', async () => {
    const blob = await renderToBlob(
      <BECRemediationReportDocument
        {...baseProps}
        userData={{ userPrincipalName: 'clean@example.com' }}
        becData={{}}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders the C-suite summary variant (executive pages only)', async () => {
    const blob = await renderToBlob(
      <BECRemediationReportDocument
        {...baseProps}
        variant="summary"
        userData={SAMPLE_BEC.userData}
        becData={SAMPLE_BEC.becData}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders the Remediation Taken section from a run with containment history', async () => {
    const becData = {
      ...SAMPLE_BEC.becData,
      Run: {
        Containment: [
          {
            At: '2026-08-05T10:00:00Z',
            By: 'analyst@example.com',
            Actions: ['ResetPassword', 'RevokeSessions'],
            Results: [
              {
                Action: 'ResetPassword',
                Target: 'sample.user@example.com',
                state: 'success',
                resultText: 'Password reset',
              },
              {
                Action: 'RevokeSessions',
                Target: 'sample.user@example.com',
                state: 'success',
                resultText: 'Sessions revoked',
              },
            ],
          },
        ],
      },
    }
    const blob = await renderToBlob(
      <BECRemediationReportDocument
        {...baseProps}
        userData={SAMPLE_BEC.userData}
        becData={becData}
      />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)
})
