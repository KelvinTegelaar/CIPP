// One entry point for the PDF report system. Reports import from here rather than reaching into
// individual modules, so the internal split between theme, styles, primitives and charts can move
// without touching every report.

// Imported for its side effects: the global hyphenation and emoji registrations. First, so they
// are in place before any report builds a document.
import './reportFonts'

export { noHyphenation } from './reportFonts'
export { measureText, wrapLongTokens } from './measureText'

export {
  DEFAULT_BRAND_COLOUR,
  REPORT_COLOURS,
  REPORT_SERIES_SEMANTIC,
  applyReportVariables,
  applyFooterText,
  applyWatermarkText,
  FOOTER_MAX_LENGTH,
  WATERMARK_MAX_LENGTH,
  REPORT_COLOUR_ROLES,
  asReportTheme,
  buildPalette,
  createReportTheme,
  darken,
  lighten,
  mixColour,
  normaliseHex,
  readableTextOn,
} from './reportTheme'

export {
  DEFAULT_PAGE_SETUP,
  PAGE_ORIENTATIONS,
  PAGE_PADDING,
  PAGE_SIZES,
  TABLE_ROW_PADDING,
  contentWidth,
  createReportStyles,
} from './reportPdfStyles'

export {
  AlertBox,
  Bold,
  Bullet,
  BulletList,
  ClearBox,
  Columns,
  ContentPage,
  CoverMeta,
  CoverPage,
  DataTable,
  HeroPage,
  INFO_TONES,
  InfoBox,
  Note,
  PageFooter,
  PageHeader,
  Paragraph,
  ProgressList,
  ReportPage,
  STATUS_TONES,
  Section,
  StatRow,
  StatusText,
  Watermark,
  severityColour,
  splitAccentTitle,
  tableColumns,
} from './reportPdfPrimitives'

export { ReportDocument } from './ReportDocument'
export { ReportProvider, useReport, useReportStyles } from './reportContext'

export { BarChart, CHART_KINDS, DonutChart, ReportChart, TrendChart, normaliseChartData } from './charts'

export {
  COVER_IMAGE_NOT_FOUND,
  COVER_STOCK_NONE,
  COVER_STOCK_OPTIONS,
  DEFAULT_COVER_STOCK,
  normalizeCoverImageIds,
  normalizeCoverUploads,
  normalizeLogoImageIds,
  normalizeLogoUploads,
  resolveCoverImage,
} from './resolveCoverImage'

export { useReportVariables } from './useReportVariables'
export {
  useBrandingSettings,
  fetchBrandingSettings,
  BRANDING_QUERY_KEY,
  BRANDING_GALLERY_QUERY_KEY,
  DEFAULT_BRANDING,
} from './useBrandingSettings'
