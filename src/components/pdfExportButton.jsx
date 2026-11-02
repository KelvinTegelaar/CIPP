import { IconButton, Tooltip } from '@mui/material'
import { CippIcons } from '../utils/icon-registry'
import { useQueryClient } from '@tanstack/react-query'
import { getCippFormatting } from '../utils/get-cipp-formatting'
import { SKIP_RECURSION_KEYS } from '../utils/skip-recursion-keys'
import { fetchBrandingSettings } from './CippPdf/useBrandingSettings'
import { applyFooterText, createReportTheme } from './CippPdf/reportTheme'

// Match branding preview maxWidth and sit close to report headerLogo height (30pt).
const MAX_LOGO_WIDTH = 140
const MAX_LOGO_HEIGHT = 36
const LOGO_PADDING = 12
const MARGIN = 40

// The two formats jsPDF embeds as they are. It also ships JavaScript decoders for WebP and BMP,
// but the browser's own are the ones every other image on the page already trusts, so anything
// that is not PNG or JPEG is redrawn through a canvas instead.
const JSPDF_NATIVE_FORMATS = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPEG',
}

// A redrawn logo is rendered into four times the printed box: crisp at print size, without a
// full-size raster (an SVG drawn at 1024px put 4 MB into a one-page export) landing in every PDF.
const RASTER_BOX = { width: MAX_LOGO_WIDTH * 4, height: MAX_LOGO_HEIGHT * 4 }

/** jsPDF format for a data URL it embeds natively; null for anything that must be redrawn. */
export const detectJsPdfImageFormat = (dataUrl) => {
  if (typeof dataUrl !== 'string') return null
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);/i)
  if (!match) return null
  return JSPDF_NATIVE_FORMATS[match[1].toLowerCase()] ?? null
}

/** Scale intrinsic size into a contain box without upscaling. */
export const fitLogoDimensions = (
  natW,
  natH,
  { maxWidth = MAX_LOGO_WIDTH, maxHeight = MAX_LOGO_HEIGHT } = {}
) => {
  if (!natW || !natH || natW <= 0 || natH <= 0) return null
  const scale = Math.min(maxWidth / natW, maxHeight / natH, 1)
  return { width: natW * scale, height: natH * scale }
}

/**
 * Redraw a logo as a PNG through the browser's own decoder. The branding gallery accepts every
 * format the report engine draws (SVG, GIF, BMP and WebP as well as PNG and JPEG) and the
 * server-rendered reports embed them as stored; this export is jsPDF in the browser, so it
 * re-renders the ones jsPDF cannot take. A raster is scaled down into RASTER_BOX when it is
 * larger; an SVG, having no size of its own, is drawn at the box.
 */
export const rasterizeLogo = (dataUrl) =>
  new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      const width = img.naturalWidth || 1
      const height = img.naturalHeight || 1
      const isVector = /^data:image\/svg\+xml/i.test(dataUrl)
      const scale = Math.min(
        RASTER_BOX.width / width,
        RASTER_BOX.height / height,
        isVector ? Infinity : 1
      )
      const canvas = document.createElement('canvas')
      canvas.width = Math.max(1, Math.round(width * scale))
      canvas.height = Math.max(1, Math.round(height * scale))
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
      resolve(canvas.toDataURL('image/png'))
    }
    img.onerror = () => reject(new Error('The logo could not be decoded'))
    img.src = dataUrl
  })

/**
 * The logo in a form jsPDF's addImage accepts: PNG and JPEG pass straight through, anything else
 * the browser can draw is re-rendered as a PNG, and anything it cannot (TIFF, a corrupt file) is
 * dropped so the export still runs, just without a logo.
 */
export const toJsPdfLogo = async (dataUrl, rasterize = rasterizeLogo) => {
  if (typeof dataUrl !== 'string' || !/^data:image\//i.test(dataUrl))
    return null
  const format = detectJsPdfImageFormat(dataUrl)
  if (format) return { data: dataUrl, format }
  try {
    return { data: await rasterize(dataUrl), format: 'PNG' }
  } catch {
    return null
  }
}

/**
 * The branding footer for an export. The report's own tokens resolve here; anything else (a tenant
 * variable, a custom one) only the server can resolve and a table export never passes through it,
 * so those are dropped rather than printed as `%tenantname%` on every page.
 */
export const exportFooterText = (theme, variables) => {
  if (!theme.footer.enabled) return ''
  return applyFooterText(theme.footer.template, variables)
    .replace(/%[\w()]+%/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

// jsPDF takes colours as RGB triplets; the theme hands out normalised #RRGGBB.
const rgb = (hex) =>
  [1, 3, 5].map((i) => parseInt(String(hex).slice(i, i + 2), 16))

// Flatten nested objects so deeply nested properties export properly.
// This function only restructures data without formatting - formatting happens later in one pass.
const flattenObject = (obj, parentKey = '') => {
  const flattened = {}
  Object.keys(obj).forEach((key) => {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    if (
      typeof obj[key] === 'object' &&
      obj[key] !== null &&
      !Array.isArray(obj[key]) &&
      !SKIP_RECURSION_KEYS.includes(key)
    ) {
      Object.assign(flattened, flattenObject(obj[key], fullKey))
    } else {
      // Store the raw value - formatting will happen in a single pass later
      flattened[fullKey] = obj[key]
    }
  })
  return flattened
}

// Shared helper so the toolbar buttons and bulk export path share the same PDF logic.
export const exportRowsToPdf = async ({
  rows = [],
  columns = [],
  reportName = 'Export',
  columnVisibility = {},
  brandingSettings = {},
}) => {
  if (!rows.length || !columns.length) {
    return
  }

  // Lazy-load jsPDF (+autotable) so ~1MB of PDF code stays out of the common bundle until an export.
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const unit = 'pt'
  const size = 'A3'
  const orientation = 'landscape'
  const doc = new jsPDF(orientation, unit, size)
  const tableData = rows.map((row) => flattenObject(row.original ?? row))

  const exportColumns = columns
    .filter((c) => columnVisibility[c.id])
    .map((c) => ({ header: c.header, dataKey: c.id }))

  // Use the existing formatting helper so PDF output mirrors table formatting.
  const formattedData = tableData.map((row) => {
    const formattedRow = {}
    exportColumns.forEach((col) => {
      const key = col.dataKey
      formattedRow[key] = getCippFormatting(
        key in row ? row[key] : null,
        key,
        'text',
        false
      )
    })
    return formattedRow
  })

  // The same theme the reports render against, so a role colour set for tables, titles or the
  // footer applies to an export exactly as it does to a report.
  const theme = createReportTheme(brandingSettings)
  const reportDate = new Date().toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
  const footerText = exportFooterText(theme, {
    reportname: reportName,
    reportdate: reportDate,
  })

  // Page header: the logo, then the table's title and the date beneath it.
  let headerBottom = 30
  const logo = await toJsPdfLogo(brandingSettings?.logo)
  if (logo) {
    try {
      const { width: natW, height: natH } = doc.getImageProperties(logo.data)
      const fitted = fitLogoDimensions(natW, natH)
      if (fitted) {
        doc.addImage(
          logo.data,
          logo.format,
          MARGIN,
          headerBottom,
          fitted.width,
          fitted.height
        )
        headerBottom += fitted.height + LOGO_PADDING
      }
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error)
    }
  }
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(16)
  doc.setTextColor(...rgb(theme.palette.title))
  doc.text(String(reportName), MARGIN, headerBottom + 16)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(...rgb(theme.palette.subtitle))
  doc.text(reportDate, MARGIN, headerBottom + 32)

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const availableWidth = pageWidth - 2 * MARGIN
  const columnCount = exportColumns.length

  // Estimate column widths from content to keep tables readable regardless of dataset.
  const columnWidths = exportColumns.map((col) => {
    const headerLength = col.header.length
    const maxContentLength = Math.max(
      ...formattedData.map((row) => String(row[col.dataKey] || '').length)
    )
    const estimatedWidth = Math.max(headerLength, maxContentLength) * 6
    return Math.min(estimatedWidth, (availableWidth / columnCount) * 1.5)
  })

  const totalEstimatedWidth = columnWidths.reduce(
    (sum, width) => sum + width,
    0
  )
  const normalizedWidths = columnWidths.map(
    (width) => (width / totalEstimatedWidth) * availableWidth
  )

  // Replaced with the real count once every page exists; jsPDF looks the token up by text.
  const totalPagesToken = '{total_pages_count_string}'

  const content = {
    startY: headerBottom + 48,
    head: [exportColumns.map((col) => col.header)],
    body: formattedData.map((row) =>
      exportColumns.map((col) => String(row[col.dataKey] || ''))
    ),
    theme: 'striped',
    headStyles: {
      fillColor: rgb(theme.palette.table),
      textColor: rgb(theme.onTable),
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle',
      fontSize: 10,
      cellPadding: 8,
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 6,
      valign: 'top',
      overflow: 'linebreak',
      cellWidth: 'wrap',
    },
    columnStyles: exportColumns.reduce((styles, col, index) => {
      styles[index] = {
        cellWidth: normalizedWidths[index],
        halign: 'left',
        valign: 'top',
      }
      return styles
    }, {}),
    margin: {
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
      left: MARGIN,
    },
    tableWidth: 'auto',
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
      fontSize: 9,
      cellPadding: 6,
    },
    // The branding footer on every page: its text (when enabled) and the page count, as the
    // reports print them.
    didDrawPage: () => {
      const parts = [
        footerText,
        theme.footer.showPageNumbers
          ? `Page ${doc.internal.getNumberOfPages()} of ${totalPagesToken}`
          : '',
      ].filter(Boolean)
      if (!parts.length) return
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(8)
      doc.setTextColor(...rgb(theme.palette.footer))
      doc.text(parts.join('   -   '), pageWidth / 2, pageHeight - 20, {
        align: 'center',
      })
    },
  }
  autoTable(doc, content)
  if (theme.footer.showPageNumbers && typeof doc.putTotalPages === 'function') {
    doc.putTotalPages(totalPagesToken)
  }

  doc.save(`${reportName}.pdf`)
}

export const PDFExportButton = (props) => {
  const {
    rows = [],
    columns = [],
    reportName,
    columnVisibility = {},
    ...other
  } = props
  const queryClient = useQueryClient()

  return (
    <Tooltip title="Export to PDF">
      <span>
        <IconButton
          disabled={rows.length === 0}
          onClick={async () =>
            exportRowsToPdf({
              rows,
              columns,
              reportName,
              columnVisibility,
              brandingSettings: await fetchBrandingSettings(queryClient),
            })
          }
          {...other}
        >
          <CippIcons.PictureAsPdf />
        </IconButton>
      </span>
    </Tooltip>
  )
}
