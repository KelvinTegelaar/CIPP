import { StyleSheet } from '@react-pdf/renderer'
import { asReportTheme, DEFAULT_BRAND_COLOUR, REPORT_COLOURS, withAlpha } from './reportTheme'

// The @react-pdf/renderer style system shared by CIPP's client-facing PDF reports: a cover page,
// branded content pages, hero/chapter dividers, stat cards, progress bars, callout boxes, data
// tables, charts and a footer with page numbers.
//
// `createReportStyles` takes a theme from `createReportTheme`, but still accepts a bare colour
// string — the reports that predate the theme pass one, and there is no value in converting them
// all in the same change.

export { DEFAULT_BRAND_COLOUR, REPORT_COLOURS }

// react-pdf takes page size by name; orientation is a separate prop. Kept here so the builder's
// page-setup control and the renderer agree on the vocabulary.
export const PAGE_SIZES = [
  { label: 'A4', value: 'A4' },
  { label: 'Letter', value: 'LETTER' },
  { label: 'Legal', value: 'LEGAL' },
  { label: 'A3', value: 'A3' },
  { label: 'A5', value: 'A5' },
]

export const PAGE_ORIENTATIONS = [
  { label: 'Portrait', value: 'portrait' },
  { label: 'Landscape', value: 'landscape' },
]

export const DEFAULT_PAGE_SETUP = { size: 'A4', orientation: 'portrait' }

// Paper widths in points, matching the names above. Needed because a table has to know how wide its
// columns actually are to wrap a long value without a hyphen — see measureText.js.
const PAGE_WIDTHS = { A4: 595.28, LETTER: 612, LEGAL: 612, A3: 841.89, A5: 419.53 }
const PAGE_HEIGHTS = { A4: 841.89, LETTER: 792, LEGAL: 1008, A3: 1190.55, A5: 595.28 }

/**
 * The margin down each side of a content page.
 *
 * Also what the footer is inset by and what `contentWidth` subtracts, so all three move together —
 * a footer rule that does not line up with the text above it is immediately obvious on the page.
 */
export const PAGE_PADDING = 32

/** Space above the page header. Tighter than the sides: nothing sits above it to crowd. */
export const PAGE_PADDING_TOP = 28

/** How far the footer's baseline box sits above the paper edge. */
export const FOOTER_INSET = 14

/** Height of the footer box — one 7pt line, its rule, and the padding between them. */
export const FOOTER_HEIGHT = 20

/** Horizontal padding inside a table row, from `styles.tableRow`. */
export const TABLE_ROW_PADDING = 12

/**
 * Width in points available to a table on the page — paper, less the page padding on both sides,
 * less the row padding on both sides.
 */
export const contentWidth = (size = DEFAULT_PAGE_SETUP.size, orientation = 'portrait') => {
  const key = String(size).toUpperCase()
  const width = PAGE_WIDTHS[key] ?? PAGE_WIDTHS.A4
  const height = PAGE_HEIGHTS[key] ?? PAGE_HEIGHTS.A4
  const paper = orientation === 'landscape' ? height : width
  return paper - PAGE_PADDING * 2
}

export const createReportStyles = (themeOrColour = DEFAULT_BRAND_COLOUR) => {
  const theme = asReportTheme(themeOrColour)
  // Named roles rather than "the brand colour" — see REPORT_COLOUR_ROLES. Each falls back to the
  // brand colours, so an MSP who sets only `colour` gets exactly what they got before.
  const {
    chart: chartColor,
    title: titleColor,
    subtitle: subtitleColor,
    heading: headingColor,
    body: bodyColor,
    footer: footerColor,
    card: cardColor,
    table: tableColor,
    coverText: coverTextColor,
    infographic: infographicColor,
    infographicBackground: infographicBackgroundColor,
    watermark: watermarkColor,
  } = theme.palette
  // Still needed where the *brand* itself is the subject — the cover label chip and the table
  // header band, which are brand surfaces rather than any one content role.
  const brandColor = theme.primary

  return StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.4,
      color: REPORT_COLOURS.body,
      padding: PAGE_PADDING,
      paddingTop: PAGE_PADDING_TOP,
      // Reserved for the footer, which is positioned from the bottom of the page rather than
      // flowing with the content — so anything the reserve does not cover is drawn straight over
      // the top of it. Only what the footer occupies plus a hair of clearance: the surplus is
      // visible as a band of dead space above the rule on every page.
      paddingBottom: FOOTER_INSET + FOOTER_HEIGHT + 6,
    },

    // COVER
    coverPage: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      padding: 60,
      justifyContent: 'space-between',
      minHeight: '100%',
    },
    coverHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 40,
    },
    logoSection: { flexDirection: 'row', alignItems: 'center' },
    logo: { height: 100, marginRight: 12 },
    headerLogo: { height: 30 },
    dateStamp: {
      fontSize: 9,
      color: coverTextColor,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    coverBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.5,
    },
    coverHero: { flex: 1, justifyContent: 'flex-start', alignItems: 'flex-start', paddingTop: 24 },
    coverLabel: {
      backgroundColor: brandColor,
      color: theme.onPrimary,
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      marginBottom: 30,
      alignSelf: 'flex-start',
    },
    mainTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: coverTextColor,
      lineHeight: 1.1,
      marginBottom: 20,
      letterSpacing: -1,
      // Baked in rather than opt-in. Three covers set their title in caps and three did not, which
      // is not a per-report decision — it is one house style that had drifted into three copies.
      textTransform: 'uppercase',
    },
    titleAccent: { color: brandColor },
    subtitle: {
      fontSize: 14,
      color: coverTextColor,
      lineHeight: 1.5,
      marginBottom: 40,
      maxWidth: 400,
    },
    // The block beneath the cover title identifying who the report is about — the tenant on most
    // reports, the compromised user on the BEC one.
    coverMetaCard: { backgroundColor: 'transparent', padding: 0, maxWidth: 500 },
    coverMetaLabel: { fontSize: 18, fontWeight: 'bold', color: coverTextColor, marginBottom: 8 },
    coverMetavalue: { fontSize: 12, color: subtitleColor, marginBottom: 4 },
    // A grade or qualifier under the cover detail lines.
    coverMetaNote: { fontSize: 11, color: subtitleColor, marginTop: 8 },
    coverFooter: { textAlign: 'center', marginTop: 32 },
    // The cover's own footer note, so it follows the footer role rather than a literal grey.
    confidential: {
      fontSize: 9,
      color: footerColor,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },

    // HERO / CHAPTER DIVIDER
    // A full-bleed page that breaks the report into chapters. Its own page style rather than a
    // block, because the dark background has to reach the paper edge and content padding cannot.
    heroPage: {
      flexDirection: 'column',
      backgroundColor: infographicBackgroundColor,
      fontFamily: 'Helvetica',
      padding: 0,
      justifyContent: 'center',
      alignItems: 'flex-start',
      minHeight: '100%',
      position: 'relative',
    },
    heroBackground: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      opacity: 0.5,
    },
    heroOverlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      padding: 60,
      justifyContent: 'center',
      alignItems: 'flex-start',
      backgroundColor: withAlpha(infographicBackgroundColor, 0.7),
    },
    heroHighlight: {
      fontSize: 72,
      color: infographicColor,
      fontWeight: 'bold',
      lineHeight: 1,
      marginBottom: 8,
    },
    heroHeadline: {
      fontSize: 18,
      color: theme.onInfographic,
      fontWeight: 'bold',
      lineHeight: 1.4,
      marginBottom: 8,
    },
    heroSubText: {
      fontSize: 14,
      color: theme.onInfographic,
      fontWeight: 'bold',
      lineHeight: 1.3,
      marginBottom: 40,
    },
    heroFooterText: {
      position: 'absolute',
      bottom: 60,
      right: 60,
      fontSize: 12,
      color: theme.onInfographic,
      fontWeight: 'bold',
      textAlign: 'right',
      lineHeight: 1.3,
    },

    // WATERMARK
    // Sits behind content: react-pdf paints in document order, so this is rendered first on the
    // page rather than given a z-index, which it does not support.
    watermark: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      justifyContent: 'center',
      alignItems: 'center',
    },
    watermarkText: {
      fontSize: 72,
      fontWeight: 'bold',
      color: watermarkColor,
      opacity: 0.08,
      textTransform: 'uppercase',
      letterSpacing: 4,
      transform: 'rotate(-45deg)',
      textAlign: 'center',
    },
    // For the full-bleed divider pages, where a brand-coloured mark at 8% is invisible. It follows
    // whatever those pages are set to rather than assuming they are dark.
    watermarkTextOnDark: {
      fontSize: 72,
      fontWeight: 'bold',
      color: theme.onInfographic,
      opacity: 0.12,
      textTransform: 'uppercase',
      letterSpacing: 4,
      transform: 'rotate(-45deg)',
      textAlign: 'center',
    },

    // CONTENT PAGES
    pageHeader: {
      borderBottom: `1px solid ${headingColor}`,
      // The header cost 44pt before a word of content: 12 under the text, 24 under the rule, and
      // 8 under the title. Halving the two gaps around the rule keeps it clearly a header without
      // spending a tenth of the page on it.
      paddingBottom: 8,
      marginBottom: 14,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    pageHeaderContent: { flex: 1 },
    // The gap between the 20pt title and its 11pt subtitle. Not a lever for fitting more on the
    // page — they are one unit, and closing it up makes them read as a single run-on line.
    pageTitle: { fontSize: 20, fontWeight: 'bold', color: titleColor, marginBottom: 8 },
    pageSubtitle: { fontSize: 11, color: subtitleColor },

    // The gap between one block of content and the next. Every page carries several, so this is
    // the single biggest lever on how much fits — 24 spent more of the page on gaps than on text.
    section: { marginBottom: 12 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: headingColor, marginBottom: 8 },
    bodyText: {
      fontSize: 9,
      color: REPORT_COLOURS.body,
      lineHeight: 1.5,
      marginBottom: 8,
      textAlign: 'justify',
    },
    bold: { fontWeight: 'bold' },
    // Steps body copy in under a heading or a list it belongs to.
    indented: { marginLeft: 12, marginTop: 8 },

    // Equal-width side-by-side layout. `gap` is set by the Columns primitive so a caller can widen
    // it without restating the row.
    columns: { flexDirection: 'row', alignItems: 'flex-start' },
    column: { flex: 1 },

    // Markdown/HTML headings. h2 takes the secondary colour — when only one colour is branded the
    // theme makes secondary equal primary, so this is the existing look until a second is set.
    heading1: {
      fontSize: 16,
      fontWeight: 'bold',
      color: REPORT_COLOURS.ink,
      marginTop: 10,
      marginBottom: 6,
    },
    heading2: {
      fontSize: 14,
      fontWeight: 'bold',
      color: headingColor,
      marginTop: 8,
      marginBottom: 5,
    },
    heading3: {
      fontSize: 12,
      fontWeight: 'bold',
      color: REPORT_COLOURS.body,
      marginTop: 6,
      marginBottom: 4,
    },

    bulletList: { marginLeft: 12, marginBottom: 12 },
    bulletItem: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6 },
    bulletPoint: {
      fontSize: 8,
      color: headingColor,
      marginRight: 6,
      fontWeight: 'bold',
      marginTop: 1,
    },
    bulletText: { fontSize: 9, color: bodyColor, lineHeight: 1.4, flex: 1 },
    orderedBullet: {
      fontSize: 8,
      color: headingColor,
      marginRight: 6,
      fontWeight: 'bold',
      marginTop: 1,
      width: 14,
    },

    codeBlock: {
      backgroundColor: REPORT_COLOURS.panel,
      padding: 8,
      marginVertical: 6,
      fontSize: 8,
      fontFamily: 'Courier',
      color: REPORT_COLOURS.body,
    },
    horizontalRule: {
      height: 1,
      backgroundColor: REPORT_COLOURS.line,
      marginVertical: 8,
    },

    // CALLOUTS
    alertBox: {
      backgroundColor: '#FFF5F5',
      border: `2px solid ${cardColor}`,
      borderRadius: 6,
      padding: 12,
      marginBottom: 16,
    },
    alertTitle: { fontSize: 11, fontWeight: 'bold', color: cardColor, marginBottom: 6 },
    alertText: { fontSize: 9, color: bodyColor, lineHeight: 1.4 },

    infoBox: {
      backgroundColor: REPORT_COLOURS.panel,
      border: `1px solid ${REPORT_COLOURS.line}`,
      // Longhand rather than the `borderLeft` shorthand: InfoBox recolours the stripe by severity,
      // and a `borderLeftColor` override does not reliably win against a shorthand in react-pdf.
      borderLeftWidth: 4,
      borderLeftStyle: 'solid',
      borderLeftColor: cardColor,
      borderRadius: 4,
      padding: 12,
      marginBottom: 12,
    },
    infoTitle: { fontSize: 10, fontWeight: 'bold', color: bodyColor, marginBottom: 6 },
    infoText: { fontSize: 8, color: subtitleColor, lineHeight: 1.4 },
    okBox: { backgroundColor: '#F0FDF4' },
    okTitle: { color: REPORT_COLOURS.success },
    warnBox: { backgroundColor: '#FEF5E7' },
    warnTitle: { color: REPORT_COLOURS.warning },

    // STATS
    statsGrid: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 14,
    },
    statCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      border: `1px solid ${REPORT_COLOURS.line}`,
      borderRadius: 6,
      // A stat card holds two short lines. 16 on every side made the box far taller than its
      // contents and pushed the rest of the page down.
      paddingVertical: 10,
      paddingHorizontal: 8,
      alignItems: 'center',
      borderTop: `3px solid ${cardColor}`,
    },
    statNumber: {
      fontSize: 20,
      fontWeight: 'bold',
      color: cardColor,
      // The page sets 1.4, which wraps a 20pt figure in a 28pt line box — most of the apparent gap
      // under the number was that box, not the margin, so the margin had no visible room to work
      // in. Tightening it to the glyph makes the space below deliberate.
      lineHeight: 1.15,
      marginBottom: 7,
    },
    statLabel: {
      fontSize: 7,
      color: REPORT_COLOURS.muted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
      fontWeight: 'bold',
    },
    statCaption: { fontSize: 7, color: subtitleColor, marginTop: 4, textAlign: 'center' },

    // PROGRESS BARS
    progressList: { marginBottom: 16 },
    progressItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
      padding: 10,
      borderRadius: 4,
      border: `1px solid ${REPORT_COLOURS.line}`,
      marginBottom: 8,
    },
    progressLabel: { fontSize: 8, color: bodyColor, width: 110, fontWeight: 'bold' },
    progressTrack: {
      flex: 1,
      height: 6,
      backgroundColor: REPORT_COLOURS.line,
      marginHorizontal: 10,
      borderRadius: 3,
    },
    progressFill: { height: 6, backgroundColor: chartColor, borderRadius: 3 },
    progressValue: {
      fontSize: 8,
      color: REPORT_COLOURS.body,
      width: 34,
      textAlign: 'right',
      fontWeight: 'bold',
    },

    // CHARTS
    chartContainer: {
      backgroundColor: '#FFFFFF',
      border: `1px solid ${REPORT_COLOURS.line}`,
      borderRadius: 6,
      padding: 16,
      marginBottom: 20,
      alignItems: 'center',
    },
    chartTitle: { fontSize: 10, fontWeight: 'bold', color: bodyColor, marginBottom: 12 },
    chartCanvas: { width: 400, height: 200, marginBottom: 8 },
    chartCaption: {
      fontSize: 8,
      fontWeight: 'bold',
      color: chartColor,
      textAlign: 'center',
      marginTop: 8,
    },
    chartEmpty: {
      fontSize: 9,
      color: REPORT_COLOURS.faint,
      fontStyle: 'italic',
      textAlign: 'center',
      paddingVertical: 24,
    },
    // Legend rows for charts drawn outside the shared chart components.
    legendRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
    legendSwatch: { width: 8, height: 8, borderRadius: 1, marginRight: 6 },
    legendText: { fontSize: 7, color: bodyColor },

    // TABLES
    table: {
      border: `1px solid ${REPORT_COLOURS.line}`,
      borderRadius: 6,
      overflow: 'hidden',
      marginBottom: 16,
    },
    // A truncation note belongs to the table above it, so the two close up and the note carries the
    // separation to whatever follows instead.
    tableAboveNote: { marginBottom: 4 },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: tableColor,
      paddingVertical: 7,
      paddingHorizontal: TABLE_ROW_PADDING,
    },
    tableHeaderCell: {
      fontSize: 7,
      fontWeight: 'bold',
      // Follows the band it sits on, so a pale table colour does not render white-on-near-white.
      color: theme.onTable,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    tableRow: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: REPORT_COLOURS.panel,
      // Equal above and below, and tight: a row holds one or two 8pt lines.
      paddingVertical: 6,
      paddingHorizontal: TABLE_ROW_PADDING,
      alignItems: 'flex-start',
      backgroundColor: '#FFFFFF',
    },
    // Layered over `tableRow` rather than repeating it. The two were full copies of each other
    // differing only in this colour, so any change to row padding had to be made twice — and a row
    // whose padding did not match its neighbour's is exactly the defect that is hard to spot.
    tableRowAlt: { backgroundColor: REPORT_COLOURS.panel },
    tableCell: { fontSize: 8, color: bodyColor, lineHeight: 1.3 },
    // The same line height as its neighbours. Without it this inherited the page's 1.4, so the bold
    // first column stood in an 11.2pt line box while every other cell had 10.4 — the row was set by
    // the taller one and the space under the shorter cells was visibly deeper than the space above.
    tableCellBold: { fontSize: 8, fontWeight: 'bold', color: bodyColor, lineHeight: 1.3 },
    // A cell holding a node — a badge, a bar — rather than text, so it aligns independently.
    tableCellSlot: { alignItems: 'flex-start', justifyContent: 'center' },
    tableEmpty: { fontSize: 8, color: REPORT_COLOURS.faint, fontStyle: 'italic', padding: 12 },
    truncationNote: {
      fontSize: 8,
      color: REPORT_COLOURS.faint,
      fontStyle: 'italic',
      // Indented to the table's inner padding so it reads as part of it.
      marginLeft: 12,
      // Small: the note is the last thing in its section, so the section's own bottom margin is
      // already providing the gap to the next heading. Anything more was added on top of it.
      marginBottom: 4,
    },

    // STATUS
    statusText: { fontSize: 9, fontStyle: 'italic' },
    statusPassed: { color: REPORT_COLOURS.success },
    statusFailed: { color: REPORT_COLOURS.danger },
    statusInvestigate: { color: REPORT_COLOURS.warning },
    statusSkipped: { color: REPORT_COLOURS.faint },

    // FOOTER
    footer: {
      position: 'absolute',
      bottom: FOOTER_INSET,
      // Inset to match the page's own margin, so the rule starts and ends level with the text
      // above it rather than running wider or narrower than the column.
      left: PAGE_PADDING,
      right: PAGE_PADDING,
      // Stated rather than left to the content. An absolutely positioned box with only `bottom`
      // set has to derive its height from its children, and that derivation does not survive the
      // browser build of the renderer the way it does in Node — the footer laid out to nothing and
      // simply never appeared on the page, while the watermark (which pins top *and* bottom, so its
      // height is definite) drew fine. Fixing the height removes the ambiguity for both.
      //
      // Just enough for one 7pt line plus its rule: at 24 the box carried 7pt of dead space that
      // read as a gap between the content and the footer.
      height: FOOTER_HEIGHT,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: REPORT_COLOURS.line,
      borderTopStyle: 'solid',
      paddingTop: 5,
    },
    // No `flex` here: in a row this sets flex-basis to 0, which leaves the text nothing to lay out
    // against when the row's own width is being resolved.
    footerText: { fontSize: 7, color: footerColor },
    pageNumber: {
      fontSize: 7,
      color: REPORT_COLOURS.faint,
      fontWeight: 'bold',
      // The empty string is the one line-height the style resolver passes through untouched, and
      // textkit reads a falsy value as "use the font's natural line height".
      //
      // It has to be stated because `lineHeight` is inheritable and the page sets 1.4. The resolver
      // turns a unitless 1.4 into an absolute `1.4 * fontSize`, and that transform is not
      // idempotent — run it again and you get `14 * fontSize`. A page containing a `render` node is
      // re-laid-out once per pagination pass, so the value compounds: 14 → 98 → 686 → 4802, and by
      // page three it is over eleven million. This node is the only one that notices, because
      // resolveDynamicNodes discards and recomputes its lines while every static Text keeps its
      // cached ones — which is exactly why the footer text beside it drew and this never did.
      // Once the line is taller than its box, textkit drops it and nothing is painted.
      //
      // No explicit height: at 7pt the natural line is 7.7pt, and pinning a height below the line
      // height would silently reintroduce the same drop if the font size were ever raised. The
      // footer row centres it either way.
      lineHeight: '',
      minWidth: 80,
      textAlign: 'right',
    },
  })
}
