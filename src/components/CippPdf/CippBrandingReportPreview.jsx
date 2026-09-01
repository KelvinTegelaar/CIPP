import { useMemo } from 'react'
import { CippPdfPreview } from './CippPdfPreview'
import { ExecutiveReportDocument } from '../ExecutiveReportButton'
import { ShadowAIReportDocument } from '../ShadowAIReportButton'
import { BECRemediationReportDocument } from '../BECRemediationReportButton'
import { SharingReportDocument } from './SharingReportButton'
import { PermissionsReportDocument } from './PermissionsReportButton'
import { MailFlowReportDocument } from './MailFlowReportButton'
import { ReportBuilderDocument } from '../ReportBuilder/ReportBuilderPDF'
import { SAMPLE_DATA_BY_REPORT, SAMPLE_TENANT_NAME } from './previewSampleData'
import { useReportVariables } from './useReportVariables'

// Renders a real report — the same document a client would receive — against sample data, so the
// branding being edited can be checked on every page rather than on a mock of the cover.
//
// The sample data comes from previewSampleData, which nothing else may import. A report that has no
// real data still renders its empty states; this is the one place invented numbers are allowed.

/**
 * Every section on, so the preview shows the fullest version of each report. Whichever sections an
 * operator later turns off, the branding they are choosing here still has to work.
 *
 * `securityStandards` is the one exception, and it is not a choice made here: the executive report
 * renders the standards page only when drift compliance is *off*, and the drift pages only when
 * standards is off (see the guards in ExecutiveReportButton). The two are alternative views of the
 * same data, so no single document can contain both. Drift is the one shown because it is three
 * pages to the standards page's one, and exercises more of the design — the donut, the stat row,
 * the deviations table and the grouped bullet lists.
 */
const EXECUTIVE_SECTIONS = {
  executiveSummary: true,
  securityStandards: false,
  driftCompliance: true,
  secureScore: true,
  licenseManagement: true,
  deviceManagement: true,
  conditionalAccess: true,
  infographics: true,
  shadowAI: true,
}

/**
 * Build the report document for a given type. Pure, and exported so it can be rendered to a real
 * PDF in tests without mounting the viewer.
 */
export const buildPreviewDocument = (reportType, brandingSettings, variables) => {
  const sample = SAMPLE_DATA_BY_REPORT[reportType] ?? SAMPLE_DATA_BY_REPORT.executive
  const shared = { brandingSettings, tenantName: SAMPLE_TENANT_NAME, variables }

  switch (reportType) {
    case 'reportBuilder':
      return (
        <ReportBuilderDocument
          {...shared}
          blocks={sample.blocks}
          templateName="Quarterly Security Review"
        />
      )
    case 'shadowAI':
      return <ShadowAIReportDocument {...shared} data={sample.data} />
    case 'bec':
      return (
        <BECRemediationReportDocument
          {...shared}
          userData={sample.userData}
          becData={sample.becData}
        />
      )
    case 'sharing':
      return <SharingReportDocument {...shared} sharingData={sample.sharingData} />
    case 'permissions':
      return <PermissionsReportDocument {...shared} permissionsData={sample.permissionsData} />
    case 'mailFlow':
      return <MailFlowReportDocument {...shared} mailFlowData={sample.mailFlowData} />
    default:
      return (
        <ExecutiveReportDocument {...shared} {...sample} sectionConfig={EXECUTIVE_SECTIONS} />
      )
  }
}

const CippBrandingReportPreview = ({ reportType = 'executive', brandingSettings }) => {
  // Resolved against the selected tenant, so a footer being written with %cippurl% or a custom
  // variable previews the value it will actually print rather than the token.
  const variables = useReportVariables()

  // Rebuilding the document on every keystroke of a colour picker would re-run the whole PDF
  // layout; keying on the branding values that actually reach the page keeps that to real changes.
  const document = useMemo(
    () => buildPreviewDocument(reportType, brandingSettings, variables),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- rebuild only on values the PDF reads
    [
      reportType,
      variables,
      brandingSettings?.colour,
      brandingSettings?.secondaryColour,
      brandingSettings?.logo,
      brandingSettings?.coverImage,
      brandingSettings?.coverImageId,
      brandingSettings?.coverStock,
      brandingSettings?.footerText,
      brandingSettings?.coverFooterText,
      brandingSettings?.showFooter,
      brandingSettings?.showPageNumbers,
      brandingSettings?.watermarkText,
      brandingSettings?.watermarkEnabled,
    ]
  )

  return (
    <CippPdfPreview
      title="Branding preview"
      fileName="Branding_Preview.pdf"
      style={{ width: '100%', height: '100%', border: 'none' }}
      showToolbar={true}
      showDownload
    >
      {document}
    </CippPdfPreview>
  )
}

export default CippBrandingReportPreview
