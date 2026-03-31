import { useMemo } from 'react'
import { Document, Page, Text, View, StyleSheet, PDFViewer, Image, Font } from '@react-pdf/renderer'

/* ── Emoji support ─────────────────────────────────────────
 * Helvetica has no emoji glyphs.  react-pdf can render emojis
 * as inline Twemoji images via Font.registerEmojiSource().
 * ───────────────────────────────────────────────────────── */
Font.registerEmojiSource({
  format: 'png',
  url: 'https://cdnjs.cloudflare.com/ajax/libs/twemoji/14.0.2/72x72/',
})

/**
 * Styles matching the CIPP Executive Report design system exactly.
 * Brand color drives accent throughout.
 */
const createStyles = (brandColor) =>
  StyleSheet.create({
    /* ── Cover page ────────────────────────────────────── */
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
      marginBottom: 80,
    },
    logoSection: { flexDirection: 'row', alignItems: 'center' },
    logo: { height: 100, marginRight: 12 },
    coverHero: {
      flex: 1,
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      paddingTop: 40,
    },
    coverLabel: {
      backgroundColor: brandColor,
      color: '#FFFFFF',
      fontSize: 10,
      fontWeight: 'bold',
      textTransform: 'uppercase',
      letterSpacing: 1,
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginBottom: 30,
      alignSelf: 'flex-start',
    },
    mainTitle: {
      fontSize: 48,
      fontWeight: 'bold',
      color: '#1A202C',
      lineHeight: 1.1,
      marginBottom: 20,
      letterSpacing: -1,
      textTransform: 'uppercase',
    },
    titleAccent: { color: brandColor },
    subtitle: {
      fontSize: 14,
      color: '#000000',
      fontWeight: 'normal',
      lineHeight: 1.5,
      marginBottom: 40,
      maxWidth: 400,
    },
    tenantCard: {
      backgroundColor: 'transparent',
      padding: 0,
      maxWidth: 400,
    },
    tenantName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: '#000000',
      marginBottom: 8,
    },
    coverFooter: { textAlign: 'center', marginTop: 60 },
    confidential: {
      fontSize: 9,
      color: '#A0AEC0',
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    dateStamp: {
      fontSize: 9,
      color: '#000000',
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

    /* ── Content page ──────────────────────────────────── */
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      fontFamily: 'Helvetica',
      fontSize: 10,
      lineHeight: 1.4,
      color: '#2D3748',
      padding: 40,
    },
    pageHeader: {
      paddingBottom: 12,
      marginBottom: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    pageHeaderDivider: {
      height: 1,
      backgroundColor: brandColor,
      marginBottom: 24,
    },
    pageHeaderContent: { flex: 1 },
    pageTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: '#1A202C',
      marginBottom: 8,
    },
    pageSubtitle: { fontSize: 11, color: '#4A5568', fontWeight: 'normal' },
    headerLogo: { height: 30 },

    /* ── Sections ──────────────────────────────────────── */
    section: {
      marginBottom: 24,
    },
    sectionTitle: {
      fontSize: 14,
      fontWeight: 'bold',
      color: brandColor,
      marginBottom: 12,
      pageBreakAfter: 'avoid',
      breakAfter: 'avoid',
      orphans: 3,
      widows: 3,
    },
    statusText: {
      fontSize: 9,
      fontStyle: 'italic',
    },
    statusPassed: { color: '#22543D' },
    statusFailed: { color: '#742A2A' },
    statusInvestigate: { color: '#744210' },
    statusSkipped: { color: '#718096' },
    bodyText: {
      fontSize: 9,
      color: '#2D3748',
      lineHeight: 1.5,
      marginBottom: 12,
      textAlign: 'justify',
    },

    /* ── Tables ────────────────────────────────────────── */
    controlsTable: {
      backgroundColor: '#FAFAFA',
      marginBottom: 8,
    },
    tableHeader: {
      flexDirection: 'row',
      backgroundColor: brandColor,
      paddingVertical: 10,
      paddingHorizontal: 12,
    },
    headerCell: {
      fontSize: 7,
      fontWeight: 'bold',
      color: '#FFFFFF',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      flex: 1,
    },
    tableRow: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    tableRowAlt: {
      flexDirection: 'row',
      paddingVertical: 8,
      paddingHorizontal: 12,
      alignItems: 'center',
      backgroundColor: '#F7FAFC',
    },
    tableCell: {
      flex: 1,
      fontSize: 8,
      color: '#2D3748',
      lineHeight: 1.3,
    },
    tableCellBold: {
      flex: 1,
      fontSize: 8,
      fontWeight: 'bold',
      color: '#2D3748',
    },

    /* ── Info boxes ─────────────────────────────────────── */
    infoBox: {
      backgroundColor: '#F7FAFC',
      paddingVertical: 12,
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    infoTitle: {
      fontSize: 9,
      fontWeight: 'bold',
      color: '#2D3748',
      marginBottom: 6,
    },
    infoText: { fontSize: 8, color: '#4A5568', lineHeight: 1.4 },

    /* ── Lists ─────────────────────────────────────────── */
    listItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 3,
    },
    listBullet: {
      fontSize: 8,
      color: brandColor,
      marginRight: 6,
      fontWeight: 'bold',
      marginTop: 1,
      width: 10,
    },
    listText: {
      fontSize: 9,
      color: '#2D3748',
      lineHeight: 1.5,
      flex: 1,
    },
    orderedBullet: {
      fontSize: 8,
      color: brandColor,
      marginRight: 6,
      fontWeight: 'bold',
      marginTop: 1,
      width: 14,
    },

    /* ── Markdown headings ─────────────────────────────── */
    heading1: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#1A202C',
      marginTop: 10,
      marginBottom: 6,
    },
    heading2: {
      fontSize: 14,
      fontWeight: 'bold',
      color: brandColor,
      marginTop: 8,
      marginBottom: 5,
    },
    heading3: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#2D3748',
      marginTop: 6,
      marginBottom: 4,
    },

    /* ── Code ──────────────────────────────────────────── */
    codeBlock: {
      backgroundColor: '#F7FAFC',
      padding: 8,
      marginVertical: 6,
      fontSize: 8,
      fontFamily: 'Courier',
      color: '#2D3748',
    },
    horizontalRule: {
      height: 1,
      backgroundColor: '#E2E8F0',
      marginVertical: 8,
    },

    footerText: { fontSize: 7, color: '#718096' },
    pageNumber: { fontSize: 7, color: '#718096', fontWeight: 'bold' },
  })

/* ── Text helpers ────────────────────────────────────────── */

const stripTags = (html) =>
  html
    .replace(/<[^>]*>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')

const processInline = (text) =>
  text
    .replace(/\*\*\*(.*?)\*\*\*/g, '$1')
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/`(.*?)`/g, '$1')
    .replace(/\[(.*?)\]\(.*?\)/g, '$1')

/**
 * Convert HTML (from TipTap rich-text editor) to @react-pdf/renderer elements.
 */
const htmlToElements = (html, s) => {
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

  for (const block of blocks) {
    const cleaned = block.trim()
    if (!cleaned) continue

    // Check for table placeholder
    const tablePlaceholder = cleaned.match(/__TABLE_(\d+)__/)
    if (tablePlaceholder) {
      const tableIndex = parseInt(tablePlaceholder[1], 10)
      const tableHtml = tables[tableIndex]
      if (tableHtml) {
        // Parse rows from HTML table
        const allRows = []
        const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi
        let rowMatch
        while ((rowMatch = rowRegex.exec(tableHtml)) !== null) {
          const cells = []
          const cellRegex = /<(?:td|th)[^>]*>([\s\S]*?)<\/(?:td|th)>/gi
          let cellMatch
          while ((cellMatch = cellRegex.exec(rowMatch[1])) !== null) {
            cells.push(stripTags(cellMatch[1]).trim())
          }
          if (cells.length > 0) allRows.push(cells)
        }

        if (allRows.length > 0) {
          const headerRow = allRows[0]
          const dataRows = allRows.slice(1)
          // Check if the first row was in <thead> (it's a header)
          const hasHeader = /<thead/i.test(tableHtml)
          elements.push(
            <View key={key++} style={s.controlsTable}>
              {hasHeader && (
                <View style={s.tableHeader}>
                  {headerRow.map((c, ci) => (
                    <Text key={ci} style={s.headerCell}>
                      {processInline(c)}
                    </Text>
                  ))}
                </View>
              )}
              {(hasHeader ? dataRows : allRows).map((row, ri) => (
                <View key={ri} style={ri % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                  {row.map((c, ci) => (
                    <Text key={ci} style={ci === 0 ? s.tableCellBold : s.tableCell}>
                      {processInline(c)}
                    </Text>
                  ))}
                </View>
              ))}
            </View>
          )
        }
        continue
      }
    }

    if (cleaned.match(/<h1[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.heading1}>
          {stripTags(cleaned.replace(/<h1[^>]*>/, ''))}
        </Text>
      )
    } else if (cleaned.match(/<h2[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.heading2}>
          {stripTags(cleaned.replace(/<h2[^>]*>/, ''))}
        </Text>
      )
    } else if (cleaned.match(/<h3[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.heading3}>
          {stripTags(cleaned.replace(/<h3[^>]*>/, ''))}
        </Text>
      )
    } else if (cleaned.match(/<li[^>]*>/)) {
      elements.push(
        <View key={key++} style={s.listItem}>
          <Text style={s.listBullet}>{'\u2022'}</Text>
          <Text style={s.listText}>{stripTags(cleaned.replace(/<li[^>]*>/, ''))}</Text>
        </View>
      )
    } else if (cleaned.match(/<pre[^>]*>/)) {
      elements.push(
        <Text key={key++} style={s.codeBlock}>
          {stripTags(cleaned.replace(/<pre[^>]*>/, '').replace(/<code[^>]*>/, ''))}
        </Text>
      )
    } else {
      const text = stripTags(cleaned.replace(/<p[^>]*>/, ''))
      if (text.trim()) {
        elements.push(
          <Text key={key++} style={s.bodyText}>
            {text}
          </Text>
        )
      }
    }
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
const markdownToElements = (markdown, s) => {
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
      const header = tableRows[0]
      const data = tableRows.slice(1)
      elements.push(
        <View key={key++} style={s.controlsTable}>
          <View style={s.tableHeader}>
            {header.map((c, ci) => (
              <Text key={ci} style={s.headerCell}>
                {processInline(c)}
              </Text>
            ))}
          </View>
          {data.map((row, ri) => (
            <View key={ri} style={ri % 2 === 0 ? s.tableRow : s.tableRowAlt}>
              {row.map((c, ci) => (
                <Text key={ci} style={ci === 0 ? s.tableCellBold : s.tableCell}>
                  {processInline(c)}
                </Text>
              ))}
            </View>
          ))}
        </View>
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
      if (line.trim().match(/^\|[\s-:|]+\|$/)) continue
      tableRows.push(
        line
          .split('|')
          .filter((c) => c.trim() !== '')
          .map((c) => c.trim())
      )
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
        <View key={key++} style={s.listItem}>
          <Text style={s.listBullet}>{'\u2022'}</Text>
          <Text style={s.listText}>{processInline(line.trim().replace(/^[-*+]\s/, ''))}</Text>
        </View>
      )
    } else if (line.trim().match(/^\d+\.\s/)) {
      const num = line.trim().match(/^(\d+)\./)[1]
      elements.push(
        <View key={key++} style={s.listItem}>
          <Text style={s.orderedBullet}>{num + '.'}</Text>
          <Text style={s.listText}>{processInline(line.trim().replace(/^\d+\.\s/, ''))}</Text>
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

/* ── Document ──────────────────────────────────────────────── */

export const ReportBuilderDocument = ({
  blocks = [],
  tenantName,
  templateName,
  brandingSettings,
  generatedDate,
}) => {
  const brandColor = brandingSettings?.colour || '#F77F00'
  const logo = brandingSettings?.logo || null
  const s = createStyles(brandColor)

  const dateObj = generatedDate ? new Date(generatedDate) : new Date()
  const currentDate = dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  const reportName = templateName || 'Report'
  const safeBlocks = blocks || []

  return (
    <Document>
      {/* ── Cover Page ── */}
      <Page size="A4" style={s.coverPage}>
        <Image style={s.coverBackground} src="/reportImages/soc.jpg" />

        <View style={s.coverHeader}>
          <View style={s.logoSection}>
            {logo && <Image style={s.logo} src={logo} cache={false} />}
          </View>
          <Text style={s.dateStamp}>{currentDate}</Text>
        </View>

        <View style={s.coverHero}>
          <Text style={s.coverLabel}>ASSESSMENT REPORT</Text>
          <Text style={s.mainTitle}>
            {reportName.toUpperCase().split(' ').slice(0, -1).join(' ') || reportName.toUpperCase()}
            {reportName.split(' ').length > 1 ? (
              <>
                {'\n'}
                <Text style={s.titleAccent}>
                  {reportName.toUpperCase().split(' ').slice(-1)[0]}
                </Text>
              </>
            ) : null}
          </Text>
          <View style={s.tenantCard}>
            <Text style={s.tenantName}>{tenantName || 'Organization'}</Text>
          </View>
        </View>

        <View style={s.coverFooter}>
          <Text style={s.confidential}>Confidential & Proprietary</Text>
        </View>
      </Page>

      {/* ── Content Pages — blocks batched 5 per page ── */}
      {(() => {
        const BLOCKS_PER_PAGE = 5
        const groups = []
        for (let i = 0; i < safeBlocks.length; i += BLOCKS_PER_PAGE) {
          groups.push(safeBlocks.slice(i, i + BLOCKS_PER_PAGE))
        }
        if (groups.length === 0) groups.push([])
        return groups.map((group, pageIndex) => (
          <Page key={pageIndex} size="A4" style={s.page}>
            <View style={s.pageHeader}>
              <View style={s.pageHeaderContent}>
                <Text style={s.pageTitle}>{reportName}</Text>
                <Text style={s.pageSubtitle}>{currentDate}</Text>
              </View>
              {logo && <Image style={s.headerLogo} src={logo} cache={false} />}
            </View>
            <View style={s.pageHeaderDivider} />

            {group.map((block, blockIndex) => {
              const statusStyle =
                block.status === 'Passed'
                  ? s.statusPassed
                  : block.status === 'Failed'
                    ? s.statusFailed
                    : block.status === 'Investigate'
                      ? s.statusInvestigate
                      : block.status === 'Skipped'
                        ? s.statusSkipped
                        : null

              return (
                <View key={blockIndex} style={s.section}>
                  {block.title ? <Text style={s.sectionTitle}>{block.title}</Text> : null}
                  {block.type === 'test' && block.status ? (
                    <Text style={{ ...s.statusText, ...statusStyle }}>Status: {block.status}</Text>
                  ) : null}
                  {block.type === 'database' && block.format && block.format !== 'text' ? (
                    <Text style={s.codeBlock}>{block.content || ''}</Text>
                  ) : block.type === 'database' && (!block.format || block.format === 'text') ? (
                    markdownToElements(block.content, s)
                  ) : block.type === 'blank' || (block.type === 'test' && block.static) ? (
                    htmlToElements(block.content, s)
                  ) : (
                    markdownToElements(block.content, s)
                  )}
                </View>
              )
            })}
          </Page>
        ))
      })()}
    </Document>
  )
}

/* ── Preview / Download wrapper ──────────────────────────── */

export const ReportBuilderPDF = ({
  blocks,
  tenantName,
  templateName,
  brandingSettings,
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
        generatedDate={generatedDate}
      />
    ),
    [blocks, tenantName, templateName, brandingSettings, generatedDate]
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
