import { Children } from 'react'
import { Text, View, Image, Page } from '@react-pdf/renderer'
import { REPORT_COLOURS, applyReportVariables } from './reportTheme'
import { useReport, useReportStyles } from './reportContext'
import { DEFAULT_PAGE_SETUP, TABLE_ROW_PADDING, contentWidth } from './reportPdfStyles'
import { wrapLongTokens } from './measureText'

// Breathing room between one column's text and the next, matching the `paddingRight` tableColumns
// puts on every cell but the last.
const CELL_GUTTER = 6

// Shared building blocks for CIPP's client-facing PDF reports.
//
// Each one takes its stylesheet from the surrounding ReportDocument, so inside a report they are
// written bare: `<StatRow stats={…} />`. An explicit `styles`/`theme` prop still overrides that,
// which is what lets a caller restyle one component without a second provider.

export const PageHeader = ({ title, subtitle, ...props }) => {
  const { styles, logo } = useReportStyles(props)
  return (
    <View style={styles.pageHeader}>
      <View style={styles.pageHeaderContent}>
        <Text style={styles.pageTitle}>{title}</Text>
        {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
      </View>
      {logo ? <Image style={styles.headerLogo} src={logo} cache={false} /> : null}
    </View>
  )
}

/**
 * A titled block of content. The unit a report is actually written in.
 *
 * Every report was repeating `<View style={styles.section}><Text style={styles.sectionTitle}>…`
 * by hand, which is how one of them ended up without the page-break-avoidance the others had.
 */
export const Section = ({ title, children, ...props }) => {
  const { styles } = useReportStyles(props)
  return (
    <View style={styles.section}>
      {title ? <Text style={styles.sectionTitle}>{title}</Text> : null}
      {children}
    </View>
  )
}

// Body copy. The single most repeated line in every report — 41 hand-written copies of the same
// `<Text style={styles.bodyText}>` before this existed. `indent` steps it in under a heading or a
// list, which the BEC report was doing with an inline margin.
export const Paragraph = ({ indent = false, children, ...props }) => {
  const { styles } = useReportStyles(props)
  return <Text style={indent ? [styles.bodyText, styles.indented] : styles.bodyText}>{children}</Text>
}

/**
 * Bold run inside a Paragraph.
 *
 * Reports emphasise a tenant name or a figure mid-sentence constantly, and used to do it with an
 * inline `{ fontWeight: 'bold' }` object. Inside the kit a report has no `styles` in scope to reach
 * for, so without this the only way to bold a word would be to hand-write the style again.
 */
export const Bold = ({ children, ...props }) => {
  const { styles } = useReportStyles(props)
  return <Text style={styles.bold}>{children}</Text>
}

/**
 * Lay children out side by side, sharing the width equally.
 *
 * Two callouts in a row is a layout decision, not a content one, so it belongs here rather than as
 * an inline `flexDirection: 'row'` in each report. Children are wrapped in an equal-flex box, which
 * means they do not each need a `flex: 1` of their own.
 */
export const Columns = ({ children, gap = 12, ...props }) => {
  const { styles } = useReportStyles(props)
  const items = Children.toArray(children)
  return (
    <View style={[styles.columns, { gap }]} wrap={false}>
      {items.map((child, index) => (
        <View key={index} style={styles.column}>
          {child}
        </View>
      ))}
    </View>
  )
}

/**
 * A content page: header at the top, footer at the bottom, watermark over the lot, content between.
 *
 * The three pieces of page furniture are decided here rather than by each report, so a page cannot
 * be added without them — which is exactly how the Secure Score page ended up without a watermark
 * and every report ended up with its own idea of what the footer said.
 */
export const ContentPage = ({ title, subtitle, children, ...props }) => {
  const { styles, theme, variables, logo } = useReportStyles(props)
  const report = useReport()
  const size = props.size ?? report.size
  const orientation = props.orientation ?? report.orientation
  const footerLabel = props.footerLabel ?? report.footerLabel

  return (
    <ReportPage styles={styles} theme={theme} size={size} orientation={orientation}>
      {/* `fixed` repeats the header on every physical page this one flows onto. Without it, a page
          whose content spills produces an unheaded continuation — which is what the report builder
          had to work around by wrapping its own header. */}
      {title ? (
        <View fixed>
          <PageHeader styles={styles} logo={logo} title={title} subtitle={subtitle} />
        </View>
      ) : null}
      {children}
      <PageFooter styles={styles} theme={theme} variables={variables} label={footerLabel} />
    </ReportPage>
  )
}

/**
 * Footer with optional branded text and page numbers.
 *
 * `label` is the caller-supplied text the older reports pass. When a theme is given instead, the
 * footer text comes from the branding template with its `%variable%` tokens filled in, which is how
 * the configurable footer reaches every report without each one knowing about branding settings.
 */
export const PageFooter = ({ styles, label, theme, variables }) => {
  const templated = theme?.footer?.enabled
    ? applyReportVariables(theme.footer.template, variables)
    : ''
  // Configured branding wins over the report's own label. The reverse — which this did at first —
  // meant every report that passed a label silently ignored the footer text an MSP had set, which
  // reads as the setting doing nothing at all. The label stays as the fallback, so a report with no
  // branded footer still identifies itself exactly as it used to — unless the footer has been
  // switched off outright, which has to suppress the label as well.
  const showText = theme ? theme.footer?.show !== false : true
  const text = showText ? templated || label || '' : ''
  const showPageNumbers = theme ? theme.footer?.showPageNumbers !== false : true

  if (!text && !showPageNumbers) return null

  return (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>{text}</Text>
      {showPageNumbers ? (
        /* No `fixed` needed here — the wrapper above carries it, and the callback fires per page
           either way. What this node does need is the `lineHeight` reset in styles.pageNumber;
           without it the number lays out but is never painted. */
        <Text
          style={styles.pageNumber}
          render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`}
        />
      ) : null}
    </View>
  )
}

/**
 * Every page in every report goes through here.
 *
 * It exists so that "what does a page always carry" is answered once. Adding the watermark to each
 * page by hand meant the answer lived in six files and drifted immediately — a page that happened
 * to declare its style differently, or a whole report added later, simply missed out.
 *
 * `style` is the report's own page style. Anything a page must always have is added around it.
 */
export const ReportPage = ({
  styles,
  theme,
  style,
  size = 'A4',
  orientation = 'portrait',
  watermarkOnDark = false,
  children,
}) => (
  <Page size={size} orientation={orientation} style={style ?? styles.page}>
    {children}
    {/* Last, so it paints over the content rather than under it. Underneath, anything with a solid
        background — a chart card, a stat tile, a table header — hid it completely, which is how a
        page that did carry a watermark still looked like it did not. At 8% it reads as a wash over
        the page and leaves everything below it legible. */}
    <Watermark styles={styles} theme={theme} onDark={watermarkOnDark} />
  </Page>
)

export const Watermark = ({ styles, theme, text, onDark = false }) => {
  const value = text ?? (theme?.watermark?.enabled ? theme.watermark.text : '')
  if (!value) return null

  return (
    <View style={styles.watermark} fixed>
      {/* A brand-coloured mark at 8% disappears on the dark full-bleed pages, so those get a
          light mark instead. Same text, same placement — only the ink changes. */}
      <Text style={onDark ? styles.watermarkTextOnDark : styles.watermarkText}>{value}</Text>
    </View>
  )
}

/**
 * Split a report name so the last word can take the brand accent colour, as the cover pages do.
 * A single-word name keeps its whole self in the lead position rather than rendering as accent
 * alone, which loses the contrast the two-tone treatment exists for.
 */
export const splitAccentTitle = (title) => {
  const words = String(title ?? '').trim().split(/\s+/).filter(Boolean)
  if (words.length <= 1) return { lead: words.join(' '), accent: '' }
  return { lead: words.slice(0, -1).join(' '), accent: words[words.length - 1] }
}

/**
 * The branded cover page shared by every report.
 *
 * `titleFontSize` is calculated by the caller when the title is data-driven (a template name can be
 * any length); the fixed-title reports just take the default.
 */
export const CoverPage = ({
  styles,
  theme,
  size = 'A4',
  orientation = 'portrait',
  coverImage,
  logo,
  date,
  label,
  title,
  accentTitle,
  titleFontSize,
  subtitle,
  tenantName,
  footerNote = 'Confidential & Proprietary',
  children,
}) => (
  <ReportPage
    styles={styles}
    theme={theme}
    style={styles.coverPage}
    size={size}
    orientation={orientation}
  >
    {coverImage ? <Image style={styles.coverBackground} src={coverImage} /> : null}

    <View style={styles.coverHeader}>
      <View style={styles.logoSection}>
        {logo ? <Image style={styles.logo} src={logo} cache={false} /> : null}
      </View>
      {date ? <Text style={styles.dateStamp}>{date}</Text> : null}
    </View>

    <View style={styles.coverHero}>
      {label ? <Text style={styles.coverLabel}>{label}</Text> : null}
      <Text style={titleFontSize ? [styles.mainTitle, { fontSize: titleFontSize }] : styles.mainTitle}>
        {title}
        {accentTitle ? (
          <>
            {'\n'}
            <Text style={styles.titleAccent}>{accentTitle}</Text>
          </>
        ) : null}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      {tenantName ? (
        <View style={styles.coverMetaCard}>
          <Text style={styles.coverMetaLabel}>{tenantName}</Text>
        </View>
      ) : null}
      {children}
    </View>

    {footerNote ? (
      <View style={styles.coverFooter}>
        <Text style={styles.confidential}>{footerNote}</Text>
      </View>
    ) : null}
  </ReportPage>
)

/**
 * Extra detail under the tenant name on the cover — a scan count, a grade, a date range.
 *
 * Passed to `ReportDocument` as `coverMeta`. It is created in the report's scope but rendered
 * inside `CoverPage`, so it still reads the surrounding theme.
 */
export const CoverMeta = ({ lines = [], note, ...props }) => {
  const { styles } = useReportStyles(props)
  return (
    <View>
      {lines.filter(Boolean).map((line, index) => (
        <Text key={index} style={styles.coverMetavalue}>
          {line}
        </Text>
      ))}
      {note ? <Text style={styles.coverMetaNote}>{note}</Text> : null}
    </View>
  )
}

/**
 * Full-bleed chapter divider — the "statistic page" pattern from the executive report. A whole page
 * rather than a block, because its background has to reach the paper edge.
 */
export const HeroPage = ({
  backgroundImage,
  overtitle,
  highlight,
  headline,
  subText,
  footerText,
  ...props
}) => {
  const { styles, theme } = useReportStyles(props)
  const report = useReport()
  const size = props.size ?? report.size ?? 'A4'
  const orientation = props.orientation ?? report.orientation ?? 'portrait'

  return (
  <ReportPage
    styles={styles}
    theme={theme}
    style={styles.heroPage}
    size={size}
    orientation={orientation}
    watermarkOnDark
  >
    {backgroundImage ? <Image style={styles.heroBackground} src={backgroundImage} /> : null}
    <View style={styles.heroOverlay}>
      {/* `overtitle` and `headline` bracket the big figure, so a statistic can read as a sentence
          — "Every / 39 / seconds" — rather than a number with a caption under it. */}
      {overtitle ? <Text style={styles.heroHeadline}>{overtitle}</Text> : null}
      {highlight ? <Text style={styles.heroHighlight}>{highlight}</Text> : null}
      {headline ? <Text style={styles.heroHeadline}>{headline}</Text> : null}
      {subText ? <Text style={styles.heroSubText}>{subText}</Text> : null}
    </View>
    {footerText ? <Text style={styles.heroFooterText}>{footerText}</Text> : null}
  </ReportPage>
  )
}

// A row of stat cards. Pass at most four — beyond that they get too narrow to read.
export const StatRow = ({ stats, ...props }) => {
  const { styles } = useReportStyles(props)
  return (
  <View style={styles.statsGrid} wrap={false}>
    {stats.map((stat, index) => (
      <View key={stat.label ?? index} style={styles.statCard}>
        <Text style={[styles.statNumber, stat.colour ? { color: stat.colour } : {}]}>
          {stat.value}
        </Text>
        <Text style={styles.statLabel}>{stat.label}</Text>
        {stat.caption ? <Text style={styles.statCaption}>{stat.caption}</Text> : null}
      </View>
    ))}
  </View>
  )
}

/**
 * Labelled progress bars. `value` and `max` are taken as given — a value over the maximum is
 * clamped to a full bar rather than overflowing the track, since the number beside it still tells
 * the true story.
 */
export const ProgressList = ({ items, ...props }) => {
  const { styles, theme } = useReportStyles(props)
  return (
  <View style={styles.progressList}>
    {items.map((item, index) => {
      const max = Number(item.max) > 0 ? Number(item.max) : 100
      const value = Number(item.value) || 0
      const percent = Math.max(0, Math.min(100, (value / max) * 100))
      const colour = item.colour || theme?.series?.[index % (theme?.series?.length || 1)]

      return (
        <View key={item.label ?? index} style={styles.progressItem} wrap={false}>
          <Text style={styles.progressLabel}>{item.label}</Text>
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${percent}%` },
                colour ? { backgroundColor: colour } : {},
              ]}
            />
          </View>
          <Text style={styles.progressValue}>
            {item.display ?? `${Math.round(percent)}%`}
          </Text>
        </View>
      )
    })}
  </View>
  )
}

/**
 * A note in a panel, with the accent stripe down its left edge.
 *
 * `colour` recolours that stripe — the reports use it to grade a note by severity or risk band, and
 * each one used to restate the whole `borderLeft: 4px solid …` shorthand to do it. `tintTitle`
 * carries the colour up into the heading, which is what the risk-level cards want and the plain
 * informational ones do not.
 */
export const INFO_TONES = { ok: 'okBox', warn: 'warnBox' }
const INFO_TONE_TITLES = { ok: 'okTitle', warn: 'warnTitle' }

export const InfoBox = ({ title, colour, tone, tintTitle = false, children, ...props }) => {
  const { styles } = useReportStyles(props)
  const toneStyle = INFO_TONES[tone] ? styles[INFO_TONES[tone]] : null
  const toneTitle = INFO_TONE_TITLES[tone] ? styles[INFO_TONE_TITLES[tone]] : null
  return (
  <View style={[styles.infoBox, toneStyle ?? {}, colour ? { borderLeftColor: colour } : {}]}>
    {title ? (
      <Text
        style={[
          styles.infoTitle,
          toneTitle ?? {},
          colour && tintTitle ? { color: colour } : {},
        ]}
      >
        {title}
      </Text>
    ) : null}
    <Text style={styles.infoText}>{children}</Text>
  </View>
  )
}

/**
 * A small italic aside — "… and 14 more, see the export". Every report writes one after a truncated
 * list and each had its own inline margin and italic.
 */
export const Note = ({ children, ...props }) => {
  const { styles } = useReportStyles(props)
  return <Text style={styles.truncationNote}>{children}</Text>
}

export const AlertBox = ({ title, colour, children, ...props }) => {
  const { styles } = useReportStyles(props)
  return (
  <View style={[styles.alertBox, colour ? { borderColor: colour } : {}]}>
    <Text style={[styles.alertTitle, colour ? { color: colour } : {}]}>{title}</Text>
    <Text style={styles.alertText}>{children}</Text>
  </View>
  )
}

// The all-clear counterpart to AlertBox, for a check that found nothing.
export const ClearBox = ({ title, children, ...props }) => {
  const { styles } = useReportStyles(props)
  return (
  <View style={[styles.infoBox, styles.okBox]}>
    <Text style={[styles.infoTitle, styles.okTitle]}>{title}</Text>
    <Text style={styles.infoText}>{children}</Text>
  </View>
  )
}

/**
 * A single bullet. Written as a child of `BulletList` when the text carries its own markup — a
 * data value, a second bold run — which the `items` array form cannot express.
 */
export const Bullet = ({ label, marker = '•', children, ...props }) => {
  const { styles } = useReportStyles(props)
  return (
    <View style={styles.bulletItem} wrap={false}>
      <Text style={styles.bulletPoint}>{marker}</Text>
      <Text style={styles.bulletText}>
        {label ? <Text style={styles.bold}>{label} </Text> : null}
        {children}
      </Text>
    </View>
  )
}

/**
 * Bulleted list. Takes either an `items` array of `{ marker, label, text }` — the concise form for
 * plain copy — or `Bullet` children when an entry needs markup of its own.
 */
export const BulletList = ({ items, children, ...props }) => {
  const { styles } = useReportStyles(props)
  return (
  <View style={styles.bulletList}>
    {items
      ? items.map((item, index) => (
          <Bullet key={index} marker={item.marker} label={item.label} {...props}>
            {item.text}
          </Bullet>
        ))
      : children}
  </View>
  )
}

/**
 * Column widths for a table, as percentages of the table width.
 *
 * Every row in a react-pdf table is its own flex container, so `flex: 1` sizes a row's columns by
 * what that row happens to contain — two rows with different content end up on different grids, and
 * neither lines up with the header. Worse, a cell that carries both `flex` and a `width` grows past
 * the width it was given. Percentages of the table width put every row on one grid by construction.
 *
 * `weights` are relative, so [2, 1, 1, 3] gives the first column twice the second and the last three
 * times it. Pass the same array to the header and to every row.
 */
export const tableColumns = (weights) => {
  const total = weights.reduce((sum, weight) => sum + weight, 0) || 1
  return weights.map((weight, index) => ({
    width: `${((weight / total) * 100).toFixed(4)}%`,
    paddingRight: index === weights.length - 1 ? 0 : 6,
  }))
}

/**
 * Fixed-width data table. `columns` is [{ header, key, width }] where width is a flex ratio.
 * Rows beyond `limit` are dropped with a note rather than running to hundreds of pages — the
 * full set is always available from the table export on the page itself.
 */
/**
 * The one table in the design system.
 *
 * A column is `{ header, key }` plus whatever presentation it needs:
 *
 * - `width`   — flex weight, defaulting to 1
 * - `bold`    — the identifying first column, usually
 * - `align`   — `'center'` / `'right'`
 * - `colour`  — `(row) => '#RRGGBB'`, for a value graded by severity or risk
 * - `render`  — `(row) => node`, the escape hatch for a cell that is not text
 *
 * Every report used to hand-write its rows to get any of these, which is how five tables ended up
 * with five different ideas of a header cell — and how the executive report's policy table kept a
 * `flex: 1` that fought the explicit widths and skewed every column.
 */
export const DataTable = ({
  columns,
  rows,
  limit = 25,
  emptyText = 'Nothing to report.',
  ...props
}) => {
  const { styles } = useReportStyles(props)
  const report = useReport()
  const shown = rows.slice(0, limit)
  const hidden = rows.length - shown.length

  // Percentages, not flex — see tableColumns. This used `flex: column.width` and had the exact
  // misalignment that helper exists to prevent, so every table built on it was on a per-row grid.
  const weights = columns.map((column) => column.width ?? 1)
  const widths = tableColumns(weights)
  const cellWidth = (index) => widths[index]

  // How wide each column actually is, in points, so an over-long value can be wrapped rather than
  // left to overflow. react-pdf cannot break inside a word without drawing a hyphen, so the break
  // has to be a real one that we place — see measureText.js.
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0) || 1
  const tableWidth =
    contentWidth(report.size ?? DEFAULT_PAGE_SETUP.size, report.orientation) - TABLE_ROW_PADDING * 2
  const columnPoints = (index) =>
    (tableWidth * weights[index]) / totalWeight - CELL_GUTTER

  const cellText = (value, index, bold) =>
    wrapLongTokens(value ?? '', columnPoints(index), styles.tableCell.fontSize, bold)

  return (
    <>
      <View style={hidden > 0 ? [styles.table, styles.tableAboveNote] : styles.table}>
        {/* `fixed` repeats the header on every page a long table spills onto. */}
        <View style={styles.tableHeader} fixed>
          {columns.map((column, index) => (
            <Text
              key={column.key}
              style={[
                styles.tableHeaderCell,
                cellWidth(index),
                column.align ? { textAlign: column.align } : {},
              ]}
            >
              {column.header}
            </Text>
          ))}
        </View>
        {shown.length === 0 ? (
          <Text style={styles.tableEmpty}>{emptyText}</Text>
        ) : (
          shown.map((row, index) => (
            <View
              key={index}
              style={index % 2 === 0 ? styles.tableRow : [styles.tableRow, styles.tableRowAlt]}
              wrap={false}
            >
              {columns.map((column, columnIndex) =>
                column.render ? (
                  <View key={column.key} style={[styles.tableCellSlot, cellWidth(columnIndex)]}>
                    {column.render(row)}
                  </View>
                ) : (
                  <Text
                    key={column.key}
                    style={[
                      column.bold ? styles.tableCellBold : styles.tableCell,
                      cellWidth(columnIndex),
                      column.align ? { textAlign: column.align } : {},
                      column.colour ? { color: column.colour(row), fontWeight: 'bold' } : {},
                    ]}
                  >
                    {cellText(row[column.key], columnIndex, column.bold)}
                  </Text>
                )
              )}
            </View>
          ))
        )}
      </View>
      {hidden > 0 ? (
        <Text style={styles.truncationNote}>
          … and {hidden} more. Export the table from the report page for the full list.
        </Text>
      ) : null}
    </>
  )
}

/**
 * A status word in a table cell — "Compliant", "Report Only", "Denied".
 *
 * `tone` is the shared vocabulary: four reports each reached into the stylesheet for
 * `statusPassed` / `statusInvestigate` / `statusFailed` by hand, which is the only reason any of
 * them still needed a stylesheet in scope at all.
 */
export const STATUS_TONES = {
  pass: 'statusPassed',
  warn: 'statusInvestigate',
  fail: 'statusFailed',
  muted: 'statusSkipped',
}

export const StatusText = ({ tone, children, ...props }) => {
  const { styles } = useReportStyles(props)
  const toneStyle = STATUS_TONES[tone] ? styles[STATUS_TONES[tone]] : null
  return <Text style={toneStyle ? [styles.statusText, toneStyle] : styles.statusText}>{children}</Text>
}

// Shared severity vocabulary so every report grades findings the same way.
export const severityColour = (severity) => {
  switch (severity) {
    case 'high':
      return REPORT_COLOURS.danger
    case 'medium':
      return REPORT_COLOURS.warning
    default:
      return REPORT_COLOURS.success
  }
}
