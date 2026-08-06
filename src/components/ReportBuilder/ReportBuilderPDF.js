import { useMemo } from 'react'
import { Text, View, StyleSheet, PDFViewer } from '@react-pdf/renderer'
import {
  ContentPage,
  DEFAULT_PAGE_SETUP,
  HeroPage,
  ProgressList,
  ReportChart,
  ReportDocument,
  Section,
  StatRow,
  StatusText,
  TABLE_ROW_PADDING,
  contentWidth,
  createReportTheme,
  splitAccentTitle,
  tableColumns,
  useReport,
  useReportStyles,
  wrapLongTokens,
} from '../CippPdf'

// Matches the gutter tableColumns leaves between cells.
const CELL_GUTTER = 6
import {
  isTableSeparatorRow,
  normaliseTableRow,
  parseTableRow,
} from '../../utils/markdown-table'
import { parseInlineMarkdown } from '../../utils/markdown-inline'
import { htmlToPlainText, parseInlineHtml } from '../../utils/html-inline'

/* ── Report settings ─────────────────────────────────────── */

/**
 * What a template stores beyond its blocks: the paper, and which branding to render against.
 *
 * The cover label and note are fixed here rather than per template. They used to be editable in
 * page setup alongside footer and watermark overrides, which meant a template could contradict the
 * branding preset it pointed at — so the branding page showed one thing and the report produced
 * another.
 */
export const DEFAULT_REPORT_SETTINGS = {
  ...DEFAULT_PAGE_SETUP,
  coverLabel: 'ASSESSMENT REPORT',
  coverFooterNote: 'Confidential & Proprietary',
}

/**
 * The branding a template renders against.
 *
 * Now simply the branding it was given — a preset, or the default. It used to fold per-template
 * overrides on top; those are gone, and a stored template that still carries them is rendered by
 * its preset alone.
 */
export const resolveReportBranding = (brandingSettings) => ({ ...brandingSettings })

/** The same, as a theme. `ReportDocument` takes the branding and builds the theme itself. */
export const resolveReportTheme = (brandingSettings) => createReportTheme(brandingSettings)

/* ── Text helpers ────────────────────────────────────────── */

/* Emphasis is rendered, not just stripped, so the PDF matches the on-screen preview.
   Helvetica's standard bold/oblique faces cover all four combinations. */
const inlineStyles = StyleSheet.create({
  strong: { fontWeight: 'bold' },
  em: { fontStyle: 'italic' },
  strongEm: { fontWeight: 'bold', fontStyle: 'italic' },
  code: { fontFamily: 'Courier' },
  strike: { textDecoration: 'line-through' },
  underline: { textDecoration: 'underline' },
})

/**
 * `transform` rewrites the leaf text — used by table cells to put a real line break inside a value
 * too wide for its column, since react-pdf cannot break inside a word without drawing a hyphen.
 */
const renderInlineNodes = (nodes, keyPrefix, transform) =>
  nodes.map((node, index) => {
    if (node.type === 'text') return transform ? transform(node.value) : node.value
    const key = `${keyPrefix}-${index}`
    return (
      <Text key={key} style={inlineStyles[node.type]}>
        {renderInlineNodes(node.children, key, transform)}
      </Text>
    )
  })

/**
 * Turn a line of inline Markdown into react-pdf nodes.
 */
const processInline = (text, keyPrefix = 'inline', transform) =>
  renderInlineNodes(parseInlineMarkdown(text ?? ''), keyPrefix, transform)

/**
 * Turn a fragment of inline HTML — as written in the TipTap editor — into react-pdf nodes.
 */
const processInlineHtml = (html, keyPrefix = 'html', transform) =>
  renderInlineNodes(parseInlineHtml(html ?? ''), keyPrefix, transform)

/* ── Table helpers ───────────────────────────────────────── */

/**
 * Equal-width columns, via the shared helper so this table and the hand-built ones in the other
 * reports sit on the same grid rule. See `tableColumns` for why `flex: 1` cannot be used here.
 */
const columnStyle = (index, count) => tableColumns(Array(count).fill(1))[index]

/**
 * Render a table from raw cell arrays. When `hasHeader`, the first row declares the column
 * count and every other row is squared off to match, so no row can slip under the wrong
 * heading no matter what the source data contained.
 *
 * `renderCell` decides how a cell's text is read — Markdown for markdown tables, HTML for
 * ones authored in the editor.
 */
const renderTable = (
  rows,
  s,
  key,
  { hasHeader = true, renderCell = processInline, pageSize, orientation } = {}
) => {
  const headerRow = hasHeader ? rows[0] : null
  const bodyRows = hasHeader ? rows.slice(1) : rows
  const columnCount =
    headerRow && headerRow.length > 0
      ? headerRow.length
      : Math.max(...rows.map((row) => row.length), 1)

  // Columns are equal width here, so each gets its share of the table's usable width. A value wider
  // than that is given a real line break rather than left to hyphenate — see measureText.js.
  const columnPoints =
    (contentWidth(pageSize, orientation) - TABLE_ROW_PADDING * 2) / columnCount - CELL_GUTTER
  const wrapCell = (bold) => (text) =>
    wrapLongTokens(text, columnPoints, s.tableCell.fontSize, bold)

  const cells = (row, rowStyle, bold) =>
    normaliseTableRow(row, columnCount).map((cell, ci) => (
      <Text key={ci} style={[rowStyle(ci), columnStyle(ci, columnCount)]}>
        {renderCell(cell, `c${ci}`, wrapCell(bold?.(ci) ?? false))}
      </Text>
    ))

  return (
    <View key={key} style={s.table}>
      {headerRow && (
        /* `fixed` repeats the header at the top of every page the table spills onto —
           without it, continued rows sat under no heading at all. */
        <View style={s.tableHeader} fixed>
          {cells(headerRow, () => s.tableHeaderCell, () => true)}
        </View>
      )}
      {bodyRows.map((row, ri) => (
        <View
          key={ri}
          style={ri % 2 === 0 ? s.tableRow : [s.tableRow, s.tableRowAlt]}
          wrap={false}
        >
          {cells(
            row,
            (ci) => (ci === 0 ? s.tableCellBold : s.tableCell),
            (ci) => ci === 0
          )}
        </View>
      ))}
    </View>
  )
}

/**
 * Convert HTML (from TipTap rich-text editor) to @react-pdf/renderer elements.
 */
const htmlToElements = (html, s, page) => {
  if (!html)
    return [
      <Text key="empty" style={s.bodyText}>
        {' '}
      </Text>,
    ]
  const elements = []
  let key = 0

  // Extract and render tables first, replacing them with placeholders
  let remaining = html
  const tables = []
  const tableRegex = /<table[^>]*>([\s\S]*?)<\/table>/gi
  remaining = remaining.replace(tableRegex, (match) => {
    const placeholder = `__TABLE_${tables.length}__`
    tables.push(match)
    return `<p>${placeholder}</p>`
  })

  const blocks = remaining
    .split(/<\/p>|<\/h[1-6]>|<\/li>|<\/pre>|<\/blockquote>|<br\s*\/?>/)
    .filter((b) => b.trim())

  // Splitting on </li> means only the first item of a list still carries its <ol>/<ul>
  // opening tag, so the list kind has to be tracked across blocks — otherwise a numbered
  // list reaches the page as bullets.
  let inOrderedList = false
  let orderedIndex = 0

  for (const block of blocks) {
    const cleaned = block.trim()
    if (!cleaned) continue

    if (/<ol[\s>]/i.test(cleaned)) {
      inOrderedList = true
      orderedIndex = 0
    } else if (/<ul[\s>]/i.test(cleaned)) {
      inOrderedList = false
    }

    // Check for table placeholder
    const tablePlaceholder = cleaned.match(/__TABLE_(\d+)__/)
    if (tablePlaceholder) {
      const tableIndex = parseInt(tablePlaceholder[1], 10)
      const tableHtml = tables[tableIndex]
      if (tableHtml) {
        // Parse rows from HTML table
        const allRows = []
        const rowIsAllHeaderCells = []
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
        let rowMatch
        while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
          const cells = []
          const cellRegex = /<(td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi
          let cellMatch
          let allHeaderCells = true
          while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
            if (cellMatch[1].toLowerCase() !== 'th') allHeaderCells = false
            // Keep the cell's markup — renderTable reads it as HTML, so marks survive.
            cells.push(cellMatch[2].trim())
          }
          if (cells.length > 0) {
            allRows.push(cells)
            rowIsAllHeaderCells.push(allHeaderCells)
          }
        }

        if (allRows.length > 0) {
          // TipTap emits header cells as <th> inside <tbody> — it never writes a <thead> —
          // so a first row of <th> counts as a header just as a <thead> does. Without this
          // an editor-authored table loses its header styling and its repeat across pages.
          const hasHeader = /<thead/i.test(tableHtml) || rowIsAllHeaderCells[0] === true
          elements.push(
            renderTable(allRows, s, key++, {
          hasHeader,
          renderCell: processInlineHtml,
          pageSize: page?.size,
          orientation: page?.orientation,
        })
          )
        }
        continue
      }
    }

    if (cleaned.match(/<h1[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.heading1}>
          {processInlineHtml(cleaned.replace(/<h1[^>]*>/, ''), `h1-${key}`)}
        </Text>
      )
    } else if (cleaned.match(/<h2[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.heading2}>
          {processInlineHtml(cleaned.replace(/<h2[^>]*>/, ''), `h2-${key}`)}
        </Text>
      )
    } else if (cleaned.match(/<h3[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.heading3}>
          {processInlineHtml(cleaned.replace(/<h3[^>]*>/, ''), `h3-${key}`)}
        </Text>
      )
    } else if (cleaned.match(/<li[^>]*>/)) {
      if (inOrderedList) orderedIndex += 1
      elements.push(
        <View key={key++} style={s.bulletItem}>
          <Text style={inOrderedList ? s.orderedBullet : s.bulletPoint}>
            {inOrderedList ? `${orderedIndex}.` : '•'}
          </Text>
          <Text style={s.bulletText}>
            {processInlineHtml(cleaned.replace(/<li[^>]*>/, ''), `li-${key}`)}
          </Text>
        </View>
      )
    } else if (cleaned.match(/<pre[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.codeBlock}>
          {/* A code block is literal text — read it flat, marks and all. */}
          {htmlToPlainText(cleaned.replace(/<pre[^>]*>/, '').replace(/<code[^>]*>/, ''))}
        </Text>
      )
    } else {
      const inner = cleaned.replace(/<p[^>]*>/, '')
      if (htmlToPlainText(inner).trim()) {
        elements.push(
          <Text key={key++} style={s.bodyText}>
            {processInlineHtml(inner, `p-${key}`)}
          </Text>
        )
      }
    }

    if (/<\/(ol|ul)>/i.test(cleaned)) inOrderedList = false
  }
  return elements.length > 0
    ? elements
    : [
        <Text key="empty" style={s.bodyText}>
          {' '}
        </Text>,
      ]
}

/**
 * Convert Markdown to @react-pdf/renderer elements.
 * Supports headings, lists, tables, code blocks, horizontal rules, and paragraphs.
 */
const markdownToElements = (markdown, s, page) => {
  if (!markdown)
    return [
      <Text key="empty" style={s.bodyText}>
        {' '}
      </Text>,
    ]
  const lines = markdown.split('\n')
  const elements = []
  let key = 0
  let inCodeBlock = false
  let codeContent = ''
  let inTable = false
  let tableRows = []

  const flushTable = () => {
    if (tableRows.length > 0) {
      elements.push(
        renderTable(tableRows, s, key++, {
          pageSize: page?.size,
          orientation: page?.orientation,
        })
      )
    }
    inTable = false
    tableRows = []
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]

    if (line.trim().startsWith('```')) {
      if (inCodeBlock) {
        elements.push(
          <Text key={key++} style={s.codeBlock}>
            {codeContent.trim()}
          </Text>
        )
        codeContent = ''
        inCodeBlock = false
      } else {
        inCodeBlock = true
      }
      continue
    }
    if (inCodeBlock) {
      codeContent += line + '\n'
      continue
    }

    if (line.trim().startsWith('|')) {
      if (!inTable) {
        inTable = true
        tableRows = []
      }
      if (isTableSeparatorRow(line)) continue
      tableRows.push(parseTableRow(line))
      continue
    } else if (inTable) {
      flushTable()
    }

    if (line.trim() === '') continue

    if (line.startsWith('### ')) {
      elements.push(
        <Text key={key++} style={s.heading3}>
          {processInline(line.slice(4))}
        </Text>
      )
    } else if (line.startsWith('## ')) {
      elements.push(
        <Text key={key++} style={s.heading2}>
          {processInline(line.slice(3))}
        </Text>
      )
    } else if (line.startsWith('# ')) {
      elements.push(
        <Text key={key++} style={s.heading1}>
          {processInline(line.slice(2))}
        </Text>
      )
    } else if (line.trim().match(/^[-*_]{3,}$/)) {
      elements.push(<View key={key++} style={s.horizontalRule} />)
    } else if (line.trim().match(/^[-*+]\s/)) {
      elements.push(
        <View key={key++} style={s.bulletItem}>
          <Text style={s.bulletPoint}>{'•'}</Text>
          <Text style={s.bulletText}>{processInline(line.trim().replace(/^[-*+]\s/, ''))}</Text>
        </View>
      )
    } else if (line.trim().match(/^\d+\.\s/)) {
      const num = line.trim().match(/^(\d+)\./)[1]
      elements.push(
        <View key={key++} style={s.bulletItem}>
          <Text style={s.orderedBullet}>{num + '.'}</Text>
          <Text style={s.bulletText}>{processInline(line.trim().replace(/^\d+\.\s/, ''))}</Text>
        </View>
      )
    } else {
      elements.push(
        <Text key={key++} style={s.bodyText}>
          {processInline(line)}
        </Text>
      )
    }
  }

  if (inTable) flushTable()
  return elements.length > 0
    ? elements
    : [
        <Text key="empty" style={s.bodyText}>
          {' '}
        </Text>,
      ]
}

/* ── Blocks ──────────────────────────────────────────────── */

/** A compliance test outcome, in the shared status vocabulary. */
const statusToneFor = (status) =>
  ({ Passed: 'pass', Failed: 'fail', Investigate: 'warn', Skipped: 'muted' })[status] ?? null

/**
 * The body of one block.
 *
 * Text blocks are read as Markdown or as HTML depending on where their content was authored;
 * the data blocks (chart, scorecard, progress) carry structured arrays instead and hand them
 * straight to the shared primitives.
 */
const BlockBody = ({ block, styles: s, page }) => {
  switch (block.type) {
    case 'chart':
      return (
        <ReportChart
          kind={block.chartKind || 'bar'}
          data={block.chartData}
          caption={block.chartCaption}
          centreLabel={block.chartCentreLabel}
          max={block.chartMax}
        />
      )
    case 'scorecard':
      return <StatRow stats={block.stats || []} />
    case 'progress':
      return <ProgressList items={block.items || []} />
    case 'database':
      return block.format && block.format !== 'text' ? (
        <Text style={s.codeBlock}>{block.content || ''}</Text>
      ) : (
        <>{markdownToElements(block.content, s, page)}</>
      )
    case 'blank':
      return <>{htmlToElements(block.content, s, page)}</>
    case 'test':
      return block.static ? (
        <>{htmlToElements(block.content, s, page)}</>
      ) : (
        <>{markdownToElements(block.content, s, page)}</>
      )
    default:
      return <>{markdownToElements(block.content, s, page)}</>
  }
}

/**
 * One saved block, rendered into the shared Section.
 *
 * The block body still needs the stylesheet directly — it renders arbitrary Markdown and HTML into
 * headings, lists, tables and code, which is far more of the sheet than any component covers — so
 * this pulls it from the surrounding report rather than having it threaded down from the document.
 */
const ReportSection = ({ block, ...props }) => {
  const { styles: s } = useReportStyles(props)
  // The page setup decides how wide a table column is, which decides where an over-long value has
  // to be broken. It comes from the document rather than being passed down block by block.
  const report = useReport()
  const page = { size: report.size, orientation: report.orientation }
  return (
    <Section title={block.title || undefined}>
      {block.type === 'test' && block.status ? (
        <StatusText tone={statusToneFor(block.status)}>Status: {block.status}</StatusText>
      ) : null}
      <BlockBody block={block} styles={s} page={page} />
    </Section>
  )
}

/**
 * Split the flat block list into pages.
 *
 * Blocks used to be batched five to a page, which meant a page's length depended on how many
 * blocks happened to precede it rather than on how much they contained — a five-row table and
 * five long test results both got one page. Blocks now flow and react-pdf breaks them where they
 * actually run out of room; an author who wants a specific break inserts a page-break block, and a
 * hero block takes a full page of its own because its background has to bleed to the paper edge.
 */
export const buildPageGroups = (blocks) => {
  const groups = []
  let current = []

  const flush = () => {
    if (current.length > 0) {
      groups.push({ kind: 'content', blocks: current })
      current = []
    }
  }

  for (const block of blocks) {
    if (block?.type === 'pagebreak') {
      flush()
      continue
    }
    if (block?.type === 'hero') {
      flush()
      groups.push({ kind: 'hero', block })
      continue
    }
    current.push(block)
  }

  flush()
  // An empty report still needs a page, or react-pdf renders a document with no pages at all.
  if (groups.length === 0) groups.push({ kind: 'content', blocks: [] })
  return groups
}

/* ── Document ──────────────────────────────────────────────── */

export const ReportBuilderDocument = ({
  blocks = [],
  tenantName,
  templateName,
  brandingSettings,
  reportSettings,
  generatedDate,
}) => {
  // Only the paper comes from the template now. Everything else — theme, styles, cover, footer,
  // watermark — is decided by the branding it points at, via ReportDocument.
  const settings = { ...DEFAULT_REPORT_SETTINGS, ...(reportSettings || {}) }

  const dateObj = generatedDate ? new Date(generatedDate) : new Date()
  const currentDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const reportName = templateName || 'Report'
  const safeBlocks = Array.isArray(blocks) ? blocks : []
  const pageGroups = buildPageGroups(safeBlocks)

  // Dynamic cover title: shrink font for long names, truncate beyond 50 chars
  const coverTitle = reportName.length > 50 ? `${reportName.slice(0, 47)}...` : reportName
  const coverTitleFontSize = coverTitle.length <= 20 ? 48 : coverTitle.length <= 35 ? 36 : 28
  const { lead, accent } = splitAccentTitle(coverTitle)

  return (
    <ReportDocument
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      reportName={reportName}
      generatedOn={currentDate}
      size={settings.size || DEFAULT_PAGE_SETUP.size}
      orientation={settings.orientation || DEFAULT_PAGE_SETUP.orientation}
      coverLabel={DEFAULT_REPORT_SETTINGS.coverLabel}
      coverTitle={lead}
      coverAccent={accent}
      coverTitleFontSize={coverTitleFontSize}
      coverFallbackImage="/reportImages/working.jpg"
      // Branding's cover note wins; this is only the fallback when none is set.
      coverFooterNote={DEFAULT_REPORT_SETTINGS.coverFooterNote}
    >
      {pageGroups.map((group, groupIndex) =>
        group.kind === 'hero' ? (
          <HeroPage
            key={`hero-${groupIndex}`}
            backgroundImage={group.block.heroImage || undefined}
            highlight={group.block.heroHighlight}
            headline={group.block.title}
            subText={group.block.heroSubText}
            footerText={group.block.heroFooterText}
          />
        ) : (
          <ContentPage key={`content-${groupIndex}`} title={reportName} subtitle={currentDate}>
            {group.blocks.map((block, blockIndex) => (
              <ReportSection key={block?.id || `${groupIndex}-${blockIndex}`} block={block} />
            ))}
          </ContentPage>
        )
      )}
    </ReportDocument>
  )
}

/* ── Preview / Download wrapper ──────────────────────────── */

export const ReportBuilderPDF = ({
  blocks,
  tenantName,
  templateName,
  brandingSettings,
  reportSettings,
  generatedDate,
  mode = 'preview',
}) => {
  const document = useMemo(
    () => (
      <ReportBuilderDocument
        blocks={blocks}
        tenantName={tenantName}
        templateName={templateName}
        brandingSettings={brandingSettings}
        reportSettings={reportSettings}
        generatedDate={generatedDate}
      />
    ),
    [blocks, tenantName, templateName, brandingSettings, reportSettings, generatedDate]
  )

  if (mode === 'preview') {
    return (
      <PDFViewer style={{ width: '100%', height: '100%', border: 'none' }} showToolbar={true}>
        {document}
      </PDFViewer>
    )
  }
  return null
}
