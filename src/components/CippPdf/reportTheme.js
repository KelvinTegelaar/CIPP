// The single place a report works out what it looks like.
//
// Every client-facing PDF used to read `brandingSettings.colour` directly and hardcode everything
// else — white text on the brand colour, its own chart palette, its own footer (or none). That made
// a second brand colour impossible to add in one place, and it meant a light brand colour rendered
// white-on-white in the cover label and table headers.
//
// `createReportTheme` takes the branding settings as saved and returns everything a report needs to
// draw itself: two brand colours, the text colour that is actually readable on each, a chart series
// derived from both, and the footer/watermark configuration. Reports consume the theme; nothing
// downstream needs to know how branding is stored.

export const DEFAULT_BRAND_COLOUR = '#F77F00'

// Status colours, matching the severity language used across the reports. These are deliberately
// NOT brand-derived: green-is-good/red-is-bad has to survive whatever colours an MSP picks.
export const REPORT_COLOURS = {
  danger: '#742A2A',
  dangerBg: '#FED7D7',
  warning: '#744210',
  warningBg: '#FEEBC8',
  success: '#22543D',
  successBg: '#C6F6D5',
  info: '#2C5282',
  infoBg: '#BEE3F8',
  ink: '#1A202C',
  body: '#2D3748',
  muted: '#4A5568',
  faint: '#718096',
  line: '#E2E8F0',
  panel: '#F7FAFC',
  white: '#FFFFFF',
}

// The semantic five used for compliance/drift breakdowns. Categorical and meaning-bearing, so a
// report that grades things keeps these rather than the brand series.
export const REPORT_SERIES_SEMANTIC = [
  '#10B981',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#EF4444',
]

const HEX_PATTERN = /^#?([0-9a-f]{3}|[0-9a-f]{6})$/i

/**
 * Accept the shapes branding data actually arrives in — `#RGB`, `#RRGGBB`, or the same without the
 * hash — and return a canonical `#RRGGBB`. Anything else returns null so callers fall back rather
 * than passing an invalid colour to react-pdf, which renders it as black without complaint.
 */
export const normaliseHex = (value) => {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!HEX_PATTERN.test(trimmed)) return null
  const digits = trimmed.replace('#', '')
  const full =
    digits.length === 3
      ? digits
          .split('')
          .map((c) => c + c)
          .join('')
      : digits
  return `#${full.toUpperCase()}`
}

const toRgb = (hex) => {
  const normalised = normaliseHex(hex) ?? DEFAULT_BRAND_COLOUR
  const digits = normalised.slice(1)
  return {
    r: parseInt(digits.slice(0, 2), 16),
    g: parseInt(digits.slice(2, 4), 16),
    b: parseInt(digits.slice(4, 6), 16),
  }
}

const toHex = ({ r, g, b }) => {
  const channel = (value) =>
    Math.max(0, Math.min(255, Math.round(value)))
      .toString(16)
      .padStart(2, '0')
      .toUpperCase()
  return `#${channel(r)}${channel(g)}${channel(b)}`
}

// WCAG relative luminance. Used to choose readable text rather than to claim a contrast rating.
const relativeLuminance = (hex) => {
  const { r, g, b } = toRgb(hex)
  const channel = (value) => {
    const scaled = value / 255
    return scaled <= 0.03928 ? scaled / 12.92 : Math.pow((scaled + 0.055) / 1.055, 2.4)
  }
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b)
}

const contrastRatio = (a, b) => {
  const lighter = Math.max(relativeLuminance(a), relativeLuminance(b))
  const darker = Math.min(relativeLuminance(a), relativeLuminance(b))
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Below this, white text on the brand colour has stopped being legible and dark text takes over.
 *
 * It is deliberately not the WCAG AA threshold. The reports have always drawn white on the brand
 * colour, and CIPP's own default orange (#F77F00) sits at about 2.6:1 against white — under AA, but
 * a look the product has shipped for years across every unbranded install. Grading strictly would
 * restyle all of those overnight, which is a bigger change than the one being made here. The job is
 * narrower: stop the pale colours an MSP pulls out of a logo from rendering white-on-near-white. So
 * the bar sits just under the shipped default, and only colours genuinely lighter than it flip.
 */
const WHITE_TEXT_MIN_CONTRAST = 2.5

/**
 * The text colour to place on `background`.
 *
 * White wins ties and anything above the threshold, so the existing look is preserved wherever it
 * was readable at all. Near-black rather than pure black keeps the fallback consistent with body
 * copy.
 */
export const readableTextOn = (background) => {
  const hex = normaliseHex(background) ?? DEFAULT_BRAND_COLOUR
  return contrastRatio(hex, REPORT_COLOURS.white) >= WHITE_TEXT_MIN_CONTRAST
    ? REPORT_COLOURS.white
    : REPORT_COLOURS.ink
}

/** Blend `hex` towards `target` by `amount` (0–1). Used to build tints from the two brand colours. */
export const mixColour = (hex, target, amount) => {
  const from = toRgb(hex)
  const to = toRgb(target)
  const ratio = Math.max(0, Math.min(1, amount))
  return toHex({
    r: from.r + (to.r - from.r) * ratio,
    g: from.g + (to.g - from.g) * ratio,
    b: from.b + (to.b - from.b) * ratio,
  })
}

export const lighten = (hex, amount) => mixColour(hex, '#FFFFFF', amount)
export const darken = (hex, amount) => mixColour(hex, '#000000', amount)

/**
 * `hex` as an `rgba()` string.
 *
 * react-pdf has no opacity on a background colour, so a scrim over a photograph has to be expressed
 * as a translucent fill. The hero pages need one that follows their background colour rather than
 * being fixed to black.
 */
export const withAlpha = (hex, alpha) => {
  const { r, g, b } = toRgb(hex)
  return `rgba(${r}, ${g}, ${b}, ${Math.max(0, Math.min(1, alpha))})`
}

/**
 * A five-colour categorical series from the two brand colours.
 *
 * When only one colour is branded the series has to come from tints of it alone, which are hard to
 * tell apart at legend size — so a distinct-but-neutral slate is dropped in third to break up the
 * run. With both colours set the series alternates between them and reads as intentional.
 */
const buildSeries = (primary, secondary) => {
  if (primary === secondary) {
    return [primary, lighten(primary, 0.35), REPORT_COLOURS.info, darken(primary, 0.3), lighten(primary, 0.65)]
  }
  return [primary, secondary, lighten(primary, 0.4), lighten(secondary, 0.4), darken(primary, 0.25)]
}

const DEFAULT_FOOTER_TEMPLATE = ''
const DEFAULT_WATERMARK_TEXT = ''

/**
 * The parts of a report that can be coloured independently.
 *
 * Every one of these used to be either `theme.primary`, `theme.secondary` or a fixed grey, which
 * meant one brand colour had to serve as the section headings, the chart series, the stat-card rule,
 * the progress bars, the watermark and the table header all at once. Naming the roles lets an MSP
 * set the ones they care about and leave the rest deriving from the brand — and, just as usefully,
 * makes the stylesheet say *why* something is a given colour rather than repeating `brandColor`.
 *
 * `from` is where the role falls back to when branding does not set it, expressed against the theme
 * being built. Changing a default here changes it everywhere that role is used, which is the point.
 */
export const REPORT_COLOUR_ROLES = [
  {
    key: 'chart',
    setting: 'chartColour',
    label: 'Charts',
    description: 'First series colour in every donut, bar and trend chart.',
    from: ({ primary }) => primary,
  },
  {
    key: 'chartAccent',
    setting: 'chartAccentColour',
    label: 'Chart accent',
    description: 'Second series colour. The rest of the series is built between the two.',
    from: ({ secondary }) => secondary,
  },
  {
    key: 'title',
    setting: 'titleColour',
    label: 'Page titles',
    description: 'The large heading at the top of every content page.',
    from: () => REPORT_COLOURS.ink,
  },
  {
    key: 'coverText',
    setting: 'coverTextColour',
    label: 'Cover text',
    description: 'The title, subtitle, date and client name on the cover page.',
    from: () => REPORT_COLOURS.ink,
  },
  {
    key: 'subtitle',
    setting: 'subtitleColour',
    label: 'Subtitles',
    description: 'The line under a page title, and captions beneath charts and stats.',
    from: () => REPORT_COLOURS.muted,
  },
  {
    key: 'heading',
    setting: 'headingColour',
    label: 'Section headings',
    description: 'The heading above each block of content, and the rule under the page header.',
    from: ({ primary }) => primary,
  },
  {
    key: 'body',
    setting: 'bodyColour',
    label: 'Body text',
    description: 'Paragraphs, bullet lists and table cells.',
    from: () => REPORT_COLOURS.body,
  },
  {
    key: 'footer',
    setting: 'footerColour',
    label: 'Footer',
    description: 'Footer text and page numbers.',
    from: () => REPORT_COLOURS.faint,
  },
  {
    key: 'card',
    setting: 'cardColour',
    label: 'Info cards',
    description: 'The accent stripe on callout boxes and the rule above each stat card.',
    from: ({ secondary }) => secondary,
  },
  {
    key: 'table',
    setting: 'tableColour',
    label: 'Data tables',
    description: 'The header band across the top of every table. Header text follows it.',
    from: ({ primary }) => primary,
  },
  {
    key: 'infographic',
    setting: 'infographicColour',
    label: 'Infographic figure',
    description: 'The large statistic on full-bleed chapter dividers.',
    from: ({ primary }) => primary,
  },
  {
    key: 'infographicBackground',
    setting: 'infographicBackgroundColour',
    label: 'Infographic background',
    description: 'The full-bleed divider page behind the artwork. Its text follows it.',
    from: () => '#000000',
  },
  {
    key: 'watermark',
    setting: 'watermarkColour',
    label: 'Watermark',
    description: 'The diagonal mark across each page. Drawn at low opacity.',
    from: ({ primary }) => primary,
  },
]

/**
 * Resolve every role against the branding, falling back to its derivation from the brand colours.
 *
 * An unset or unparseable value falls back rather than reaching react-pdf, which renders an invalid
 * colour as black without complaint.
 */
export const buildPalette = (branding, { primary, secondary }) => {
  const palette = {}
  for (const role of REPORT_COLOUR_ROLES) {
    // `roleColours` is where the branding UI saves them — one map rather than ten columns, so a
    // role added here needs no backend change. A flat property is also accepted, which is what lets
    // a report template or a preset set one directly.
    const configured = branding?.roleColours?.[role.setting] ?? branding?.[role.setting]
    palette[role.key] = normaliseHex(configured) ?? role.from({ primary, secondary })
  }
  return palette
}

/**
 * The variables a report adds on top of CIPP's own.
 *
 * Only two: nothing else in CIPP has a concept of "the report being rendered". Everything else a
 * footer might want — `%tenantname%` foremost — is already a CIPP variable, so it is not restated
 * here. The `report` prefix keeps these clear of the reserved names in Get-CIPPTextReplacement.
 *
 * A PDF renders in the browser, so Get-CIPPTextReplacement never sees this text. `useReportVariables`
 * supplies the resolved values instead. Being a CIPP variable is about where it is documented and
 * offered, not about who substitutes it.
 */
export const REPORT_VARIABLES = [
  { value: '%reportname%', label: 'Report name' },
  { value: '%reportdate%', label: 'Report date' },
]

/**
 * Substitute `%variable%` tokens in footer and watermark text.
 *
 * Same syntax and the same rules as CIPP's server-side replacement: matching is case-insensitive,
 * and an unknown token is left as written rather than blanked — that is what tells whoever
 * configured it that they mistyped, instead of silently swallowing it.
 *
 * Given the values rather than looking them up: the report's own tokens plus whatever
 * `useReportVariables` resolved for the tenant.
 */
export const applyReportVariables = (template, variables = {}) => {
  if (!template) return ''

  const lookup = {}
  for (const [key, value] of Object.entries(variables)) {
    lookup[key.toLowerCase().replace(/^%|%$/g, '')] = value
  }

  return String(template).replace(/%([\w()]+)%/g, (match, key) => {
    const value = lookup[key.toLowerCase()]
    return value == null ? match : String(value)
  })
}

/**
 * Build the theme a report renders against.
 *
 * `secondary` falls back to `primary` rather than to some second default: an MSP that has not set
 * one gets exactly the report they had before this existed, instead of a surprise accent colour
 * appearing across every page.
 */
export const createReportTheme = (branding) => {
  const primary = normaliseHex(branding?.colour) ?? DEFAULT_BRAND_COLOUR
  const secondary = normaliseHex(branding?.secondaryColour) ?? primary
  const palette = buildPalette(branding, { primary, secondary })

  return {
    primary,
    secondary,
    onPrimary: readableTextOn(primary),
    onSecondary: readableTextOn(secondary),
    // What each part of a report is coloured with. Prefer these over `primary`/`secondary` in the
    // stylesheet: they say what is being coloured, and they are what an MSP can override.
    palette,
    // Readable text for the roles that are used as a *background* rather than as ink. Without this
    // a pale table colour renders its header white-on-near-white, which is the same defect
    // `onPrimary` exists to prevent for the brand colour.
    onHeading: readableTextOn(palette.heading),
    onChart: readableTextOn(palette.chart),
    onTable: readableTextOn(palette.table),
    // The divider pages are a surface too: their copy and the watermark drawn over them both have
    // to follow the background, or setting a pale one renders white-on-white.
    onInfographic: readableTextOn(palette.infographicBackground),
    // Tints used for fills and rules that sit behind text, where the full-strength brand colour
    // would overpower it.
    primarySoft: lighten(primary, 0.85),
    secondarySoft: lighten(secondary, 0.85),
    // Built from the chart roles rather than the brand colours, so setting a chart colour actually
    // changes the series instead of only its first entry.
    series: buildSeries(palette.chart, palette.chartAccent),
    semanticSeries: REPORT_SERIES_SEMANTIC,
    colours: REPORT_COLOURS,
    footer: {
      // `show` is the toggle; `enabled` also requires text to show. They are separate because a
      // report may supply its own fallback label — switching the toggle off has to suppress that
      // too, or "Show footer text: off" leaves a footer on the page.
      show: branding?.showFooter !== false,
      enabled: branding?.showFooter !== false && Boolean(branding?.footerText),
      template: branding?.footerText || DEFAULT_FOOTER_TEMPLATE,
      showPageNumbers: branding?.showPageNumbers !== false,
    },
    watermark: {
      // Text is the switch: type something and it appears. The toggle only exists to suppress it
      // without losing the wording, and so defaults to on — the reverse (a toggle that must be
      // found and flipped before typed text does anything) reads as the field being broken.
      // Same shape as the footer above, deliberately.
      show: branding?.watermarkEnabled !== false,
      enabled: branding?.watermarkEnabled !== false && Boolean(branding?.watermarkText),
      text: branding?.watermarkText || DEFAULT_WATERMARK_TEXT,
    },
    // The confidentiality note on the cover. Empty means "leave the report's own wording alone" —
    // several of them say something more specific than "Confidential & Proprietary".
    coverFooterText: branding?.coverFooterText || '',
  }
}

/**
 * Reports written before the theme existed pass a bare colour string. Accept either so the whole
 * tree does not have to convert at once.
 */
export const asReportTheme = (themeOrColour) => {
  if (themeOrColour && typeof themeOrColour === 'object' && 'primary' in themeOrColour) {
    return themeOrColour
  }
  if (typeof themeOrColour === 'string') {
    return createReportTheme({ colour: themeOrColour })
  }
  return createReportTheme(themeOrColour)
}
