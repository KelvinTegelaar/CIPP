// One entry point for what remains of the client-side report kit now that the PDFs render
// server-side (CIPPSharp): the theme and page metrics the report builder and the branding editor's
// cover mock still read, cover-image resolution, and the branding-settings hook.

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

export {
  useBrandingSettings,
  fetchBrandingSettings,
  BRANDING_QUERY_KEY,
  BRANDING_GALLERY_QUERY_KEY,
  DEFAULT_BRANDING,
} from './useBrandingSettings'
