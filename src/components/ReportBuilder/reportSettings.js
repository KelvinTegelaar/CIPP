import { PAGE_ORIENTATIONS, PAGE_SIZES } from '../CippPdf'

// Page setup and branding for a report template: what gets saved with the template, handed to the
// renderer, and passed to a scheduled run.
//
// Three things only — how big the paper is, which way round it goes, and which branding to render
// against. Everything else about how a report looks is a branding decision and lives in a branding
// preset, so there is exactly one place to set it.
//
// A template used to be able to override the cover, footer and watermark on top of its preset. That
// is gone: a template that overrode its preset's footer looked, to anyone reading the branding
// page, like the branding was being ignored. Older templates may still have those keys stored; they
// are not read, so such a template now renders exactly as its preset says.
//
// Keeping the two conversions next to each other is deliberate: when they drift, a setting saves
// but does not reload.

/**
 * "Use the branding that is not a preset" — the option every report offers alongside the presets.
 *
 * Called "Default" because that is what the branding page calls it. It was "Global branding
 * settings" here and on the executive report while the page it refers to said "Default", so the
 * same thing had two names depending on where you met it.
 *
 * Exported so both spellings cannot come back: the executive report imports this rather than
 * writing out its own copy, which is how the two drifted apart in the first place.
 */
export const DEFAULT_BRANDING_OPTION = { label: 'Default', value: '' }

// The autoComplete field works in {label, value} objects, so the form holds options rather than
// bare strings and the converters translate at the edges.
export const optionFor = (options, value, fallbackIndex = 0) =>
  options.find((option) => option.value === value) ?? options[fallbackIndex]

export const DEFAULT_PAGE_SETTINGS = {
  size: optionFor(PAGE_SIZES, 'A4'),
  orientation: optionFor(PAGE_ORIENTATIONS, 'portrait'),
  brandingPresetId: DEFAULT_BRANDING_OPTION,
}

const unwrap = (value) => (value && typeof value === 'object' ? value.value : value)

/** Turn the page-setup form into the settings object the PDF renderer consumes. */
export const toReportSettings = (values = {}) => ({
  size: unwrap(values.size) || 'A4',
  orientation: unwrap(values.orientation) || 'portrait',
  brandingPresetId: unwrap(values.brandingPresetId) ?? '',
})

/**
 * The inverse, for loading a saved template back into the form.
 *
 * `presets` is passed so a saved preset id can be shown by name; a preset that has since been
 * deleted keeps its id in the form (the page warns about it) rather than silently reverting to
 * the default branding on the next save.
 *
 * Anything else a stored template carries — the cover, footer and watermark overrides that used to
 * live here — is ignored rather than migrated. Those are branding decisions and the preset already
 * states them.
 */
export const fromReportSettings = (settings, presets = []) => {
  if (!settings) return { ...DEFAULT_PAGE_SETTINGS }
  const presetId = settings.brandingPresetId || ''
  const preset = presets.find((item) => item.id === presetId)
  return {
    size: optionFor(PAGE_SIZES, settings.size),
    orientation: optionFor(PAGE_ORIENTATIONS, settings.orientation),
    brandingPresetId: presetId
      ? { label: preset?.name || 'Missing preset', value: presetId }
      : DEFAULT_BRANDING_OPTION,
  }
}

/**
 * Resolve which branding a report renders against.
 *
 * A preset stands in for the default branding wholesale. One that has since been deleted falls back
 * to the default rather than rendering an unbranded report — the caller surfaces that separately.
 */
export const resolveBranding = (defaultBranding, presets, presetId) => {
  if (!presetId) return defaultBranding
  const list = Array.isArray(presets) ? presets : []
  return list.find((preset) => preset.id === presetId) || defaultBranding
}

/**
 * Which preset a report should use, in precedence order: what the template explicitly chose, then
 * the branding setting for that report type, then the default branding.
 *
 * The template wins because it is the more specific statement — someone picked a preset for this
 * report and meant it. The per-report default exists so that everything nobody has been specific
 * about still lands somewhere sensible.
 */
export const resolvePresetId = (templatePresetId, defaultBranding, reportType) => {
  if (templatePresetId) return templatePresetId
  return defaultBranding?.reportDefaults?.[reportType] ?? ''
}

/** Only the fields a block type actually uses are persisted, so saved templates stay readable. */
export const serialiseBlock = (b) => ({
  type: b.type,
  testId: b.testId || null,
  testCategory: b.testCategory || null,
  title: b.title,
  content:
    b.type === 'blank'
      ? b.content
      : b.type === 'database'
        ? b.content
        : b.static
          ? b.content
          : null,
  status: b.status || null,
  static: b.type === 'blank' || b.type === 'database' ? true : b.static,
  dbType: b.dbType || null,
  format: b.format || null,
  selectedHeaders: b.selectedHeaders || null,
  chartKind: b.chartKind || null,
  chartData: b.chartData || null,
  chartCaption: b.chartCaption || null,
  chartCentreLabel: b.chartCentreLabel || null,
  chartMax: b.chartMax || null,
  stats: b.stats || null,
  items: b.items || null,
  heroHighlight: b.heroHighlight || null,
  heroSubText: b.heroSubText || null,
  heroFooterText: b.heroFooterText || null,
  heroImage: b.heroImage || null,
})
