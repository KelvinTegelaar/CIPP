import { IconButton, Tooltip } from '@mui/material'
import { CippIcons } from '../utils/icon-registry'
import { useQueryClient } from '@tanstack/react-query'
import { getCippFormatting } from '../utils/get-cipp-formatting'
import { SKIP_RECURSION_KEYS } from '../utils/skip-recursion-keys'
import { fetchBrandingSettings } from './CippPdf/useBrandingSettings'

// Match branding preview maxWidth and sit close to report headerLogo height (30pt).
const MAX_LOGO_WIDTH = 140
const MAX_LOGO_HEIGHT = 36
const LOGO_PADDING = 12

const JSPDF_FORMAT_BY_MIME = {
  'image/png': 'PNG',
  'image/jpeg': 'JPEG',
  'image/jpg': 'JPEG',
  'image/webp': 'WEBP',
}

/**
 * jsPDF format from a data URL. SVG and anything else return null so the export
 * continues without a logo rather than forcing a PNG decode.
 */
export const detectJsPdfImageFormat = (dataUrl) => {
  if (typeof dataUrl !== 'string') return null
  const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);/i)
  if (!match) return null
  return JSPDF_FORMAT_BY_MIME[match[1].toLowerCase()] ?? null
}

/** Scale intrinsic size into a contain box without upscaling. */
export const fitLogoDimensions = (natW, natH, { maxWidth = MAX_LOGO_WIDTH, maxHeight = MAX_LOGO_HEIGHT } = {}) => {
  if (!natW || !natH || natW <= 0 || natH <= 0) return null
  const scale = Math.min(maxWidth / natW, maxHeight / natH, 1)
  return { width: natW * scale, height: natH * scale }
}

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
      formattedRow[key] = getCippFormatting(key in row ? row[key] : null, key, 'text', false)
    })
    return formattedRow
  })

  let logoHeight = 0
  const logo = brandingSettings?.logo
  const logoFormat = detectJsPdfImageFormat(logo)
  if (logo && logoFormat) {
    try {
      const { width: natW, height: natH } = doc.getImageProperties(logo)
      const fitted = fitLogoDimensions(natW, natH)
      if (fitted) {
        const logoX = 40
        const logoY = 30
        doc.addImage(logo, logoFormat, logoX, logoY, fitted.width, fitted.height)
        logoHeight = fitted.height + LOGO_PADDING
      }
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error)
    }
  }

  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 40
  const availableWidth = pageWidth - 2 * margin
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

  const totalEstimatedWidth = columnWidths.reduce((sum, width) => sum + width, 0)
  const normalizedWidths = columnWidths.map(
    (width) => (width / totalEstimatedWidth) * availableWidth
  )

  // Honor tenant branding colors when present so exports stay on-brand.
  const getHeaderColor = () => {
    if (brandingSettings?.colour) {
      const hex = brandingSettings.colour.replace('#', '')
      const r = parseInt(hex.substr(0, 2), 16)
      const g = parseInt(hex.substr(2, 2), 16)
      const b = parseInt(hex.substr(4, 2), 16)
      return [r, g, b]
    }
    return [247, 127, 0]
  }

  const content = {
    startY: 100 + logoHeight,
    head: [exportColumns.map((col) => col.header)],
    body: formattedData.map((row) => exportColumns.map((col) => String(row[col.dataKey] || ''))),
    theme: 'striped',
    headStyles: {
      fillColor: getHeaderColor(),
      textColor: [255, 255, 255],
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
      top: margin,
      right: margin,
      bottom: margin,
      left: margin,
    },
    tableWidth: 'auto',
    styles: {
      overflow: 'linebreak',
      cellWidth: 'wrap',
      fontSize: 9,
      cellPadding: 6,
    },
  }
  autoTable(doc, content)

  doc.save(`${reportName}.pdf`)
}

export const PDFExportButton = (props) => {
  const { rows = [], columns = [], reportName, columnVisibility = {}, ...other } = props
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
