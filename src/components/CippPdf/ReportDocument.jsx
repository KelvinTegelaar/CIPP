import { Document } from '@react-pdf/renderer'
import { ReportProvider } from './reportContext'
import { createReportTheme } from './reportTheme'
import { createReportStyles, DEFAULT_PAGE_SETUP } from './reportPdfStyles'
import { CoverPage } from './reportPdfPrimitives'
import { resolveCoverImage } from './resolveCoverImage'

/**
 * The whole scaffold of a report: theme, styles, cover page, and the context every primitive reads.
 *
 * This exists so that writing a new report is writing its *content*. Before it, each report opened
 * with the same forty lines — build the theme, build the styles, resolve the cover image, assemble
 * the date string, hand-roll a cover page, and thread `styles`/`theme` into everything — which is
 * why six reports had six slightly different covers and six ways of deciding a footer.
 *
 * A report now looks like:
 *
 *   <ReportDocument
 *     brandingSettings={brandingSettings}
 *     tenantName={tenantName}
 *     reportName="Sharing Report"
 *     coverLabel="Data Sharing Review"
 *     coverTitle="Sharing"
 *     coverAccent="Report"
 *     coverSubtitle={`What has been shared out of ${tenantName}.`}
 *     coverFallbackImage="/reportImages/glasses.jpg"
 *     footerLabel={`${tenantName} — SharePoint & OneDrive Sharing`}
 *   >
 *     <ContentPage title="Executive Summary" subtitle="What has been shared">
 *       <Section title="Findings">…</Section>
 *     </ContentPage>
 *   </ReportDocument>
 *
 * Everything below it — pages, headers, footers, watermark, page numbers, colours — is decided
 * centrally and needs no argument.
 */
export const ReportDocument = ({
  brandingSettings,
  tenantName,
  reportName,
  generatedOn,

  // Cover. Pass `cover={false}` for a report that opens straight into content.
  cover = true,
  coverLabel,
  coverTitle,
  coverAccent,
  coverTitleFontSize,
  coverSubtitle,
  coverTenant,
  coverMeta,
  coverFallbackImage,
  coverFooterNote,

  // The report's own footer wording, used when branding configures none.
  footerLabel,

  size = DEFAULT_PAGE_SETUP.size,
  orientation = DEFAULT_PAGE_SETUP.orientation,

  children,
}) => {
  const theme = createReportTheme(brandingSettings)
  const styles = createReportStyles(theme)
  const logo = brandingSettings?.logo || null
  const coverImage = resolveCoverImage(brandingSettings, coverFallbackImage)

  const date =
    generatedOn ??
    new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  // What `%tenantname%`, `%reportname%` and `%reportdate%` resolve to anywhere in this report.
  const variables = {
    tenantname: tenantName || 'Organization',
    reportname: reportName || '',
    reportdate: date,
  }

  const context = { theme, styles, variables, logo, footerLabel, size, orientation, date }

  return (
    <ReportProvider value={context}>
      <Document>
        {cover ? (
          <CoverPage
            styles={styles}
            theme={theme}
            size={size}
            orientation={orientation}
            coverImage={coverImage}
            logo={logo}
            date={date}
            label={coverLabel}
            title={coverTitle}
            accentTitle={coverAccent}
            titleFontSize={coverTitleFontSize}
            subtitle={coverSubtitle}
            // Naming the client on the cover is what makes it a client report. Every report wanted
            // it and each one printed it slightly differently; `coverTenant={false}` opts out.
            tenantName={coverTenant === false ? null : coverTenant || tenantName}
            // Branding's cover note wins; a report's own wording is the fallback.
            footerNote={theme.coverFooterText || coverFooterNote}
          >
            {coverMeta}
          </CoverPage>
        ) : null}
        {children}
      </Document>
    </ReportProvider>
  )
}

export default ReportDocument
