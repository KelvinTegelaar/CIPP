import { pdf } from '@react-pdf/renderer'
import { MailFlowReportDocument } from '../../src/components/CippPdf/MailFlowReportButton'
import { buildPreviewDocument } from '../../src/components/CippPdf/CippBrandingReportPreview'
import { SAMPLE_MAIL_FLOW, SAMPLE_TENANT_NAME } from '../../src/components/CippPdf/previewSampleData'

// Real render, not a stub: the point is that the document survives react-pdf's layout pass. A JSX
// error in a report only surfaces there, so a shallow render would assert nothing useful.
const renderToBlob = (node) => pdf(node).toBlob()

const baseProps = {
  brandingSettings: {},
  tenantName: SAMPLE_TENANT_NAME,
  generatedOn: 'January 1, 2026',
  variables: {},
}

describe('MailFlowReportDocument', () => {
  it('renders the sample data to a PDF', async () => {
    const blob = await renderToBlob(
      <MailFlowReportDocument {...baseProps} mailFlowData={SAMPLE_MAIL_FLOW} />
    )

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders with no data at all, so an empty tenant still produces a report', async () => {
    const blob = await renderToBlob(<MailFlowReportDocument {...baseProps} mailFlowData={{}} />)

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)

  it('renders through the branding preview builder', async () => {
    const blob = await renderToBlob(buildPreviewDocument('mailFlow', {}, {}))

    expect(blob.size).toBeGreaterThan(1000)
  }, 30000)
})
