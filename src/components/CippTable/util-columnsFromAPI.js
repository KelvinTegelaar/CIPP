import { getCippFilterVariant } from '../../utils/get-cipp-filter-variant'
import { getCippFormatting } from '../../utils/get-cipp-formatting'
import { getCippTranslation } from '../../utils/get-cipp-translation'
import { getCippColumnSize } from '../../utils/get-cipp-column-size'

const skipRecursion = ['location', 'ScheduledBackupValues', 'Tenant']

// Number of rows to sample when measuring column content width.
const MAX_SIZE_SAMPLE = 30
// Average character width in pixels at compact density (roughly 7–8px per char).
const CHAR_WIDTH = 8
// Extra padding per cell (sort icon, filter icon, cell padding, resize handle).
const CELL_PADDING = 5
const MIN_COL_SIZE = 80
const MAX_COL_SIZE = 500

// Extra pixels reserved in the header for MRT chrome (sort icon, column actions menu,
// resize handle, filter icon). These sit alongside the header text and consume space.
const HEADER_CHROME_PX = 75

// Extra pixels per chip for icon + internal padding + margin.
const CHIP_CHROME_PX = 45

// DateTime columns render as relative time (e.g. "about 2 months ago"). Use a fixed
// character length instead of measuring the raw ISO date string.
const RELATIVE_TIME_CHARS = 20

// Known datetime accessor names and pattern — must stay in sync with get-cipp-formatting.js
const TIME_AGO_NAMES = new Set([
  'ExecutedTime', 'ScheduledTime', 'Timestamp', 'timestamp', 'DateTime', 'LastRun',
  'LastRefresh', 'createdDateTime', 'activatedDateTime', 'lastModifiedDateTime',
  'endDateTime', 'ReceivedTime', 'Expires', 'updatedAt', 'createdAt', 'Received',
  'Date', 'WhenCreated', 'WhenChanged', 'CreationTime', 'renewalDate',
  'commitmentTerm.renewalConfiguration.renewalDate', 'purchaseDate', 'NextOccurrence',
  'LastOccurrence', 'NotBefore', 'NotAfter', 'latestDataCollection',
  'requestDate', 'reviewedDate', 'GeneratedAt',
])
const MATCH_DATE_TIME = /([dD]ate[tT]ime|[Ee]xpiration|[Tt]imestamp|[sS]tart[Dd]ate)/
const isDateTimeColumn = (key) => TIME_AGO_NAMES.has(key) || MATCH_DATE_TIME.test(key)

// Measure the pixel width a column needs based on its header and sampled cell values.
// rawValues are the original data values (before formatting) — if they contain arrays or
// complex objects the column renders as a button/chip list, so we cap to header width.
// Returns { size, minSize } where minSize is always header-width + chrome safe space.
const measureColumnSize = (header, valuesForColumn, rawValues, accessorKey) => {
  const headerLen = header ? header.length : 6
  const headerPx = Math.round(headerLen * CHAR_WIDTH + CELL_PADDING + HEADER_CHROME_PX)
  const minSize = Math.max(MIN_COL_SIZE, headerPx)

  // If any raw value is an array or complex object, the cell renders as either:
  // - A CippDataTableButton ("X items" button) for object arrays and plain objects
  // - A CollapsibleChipList for string/primitive arrays
  // Size accordingly: buttons are compact, chips need per-item measurement.
  if (rawValues && rawValues.length > 0) {
    const hasComplex = rawValues.some(
      (v) => Array.isArray(v) || (typeof v === 'object' && v !== null)
    )
    if (hasComplex) {
      // Check if these are object arrays or plain objects — they render as a small
      // "X items" button (CippDataTableButton), so size to the button width.
      const allObjectLike = rawValues.every((v) => {
        if (v === null || v === undefined) return true // nulls are fine, they show "No items"
        if (Array.isArray(v)) return v.length === 0 || v.some((el) => typeof el === 'object' && el !== null)
        return typeof v === 'object'
      })
      if (allObjectLike) {
        // The formatted text tells us how this column actually renders:
        // - JSON strings (starts with [ or {) → CippDataTableButton ("X items"), compact
        // - Comma-separated text → chips/inline content, needs real measurement
        const looksLikeButton = valuesForColumn.every((t) => {
          if (t === null || t === undefined || t === '' || t === 'No data') return true
          if (Array.isArray(t)) return true // handler returned a raw array (e.g. [])
          const s = typeof t === 'string' ? t.trim() : ''
          return s.startsWith('[') || s.startsWith('{') || s === 'Password hidden'
        })
        if (looksLikeButton) {
          return { size: minSize, minSize }
        }
        // Object arrays that render as chips — measure the longest item from the
        // comma-separated text representation.
        let longestObjItem = headerLen
        for (const t of valuesForColumn) {
          if (typeof t !== 'string') continue
          const parts = t.split(',')
          for (const p of parts) {
            const len = p.trim().length
            if (len > longestObjItem) longestObjItem = len
          }
        }
        const objChipPx = Math.round(longestObjItem * CHAR_WIDTH + CELL_PADDING + CHIP_CHROME_PX + HEADER_CHROME_PX)
        const objSize = Math.max(minSize, Math.min(MAX_COL_SIZE, objChipPx))
        return { size: objSize, minSize }
      }

      // String/primitive arrays → rendered as chip list. Measure the longest
      // single item across all rows, then size like a regular text column.
      let longestItem = headerLen
      for (let i = 0; i < rawValues.length; i++) {
        const v = rawValues[i]
        if (Array.isArray(v)) {
          for (const el of v) {
            const s = typeof el === 'string' ? el : el != null ? String(el) : ''
            if (s.length > longestItem) longestItem = s.length
          }
        }
      }
      const chipPx = Math.round(longestItem * CHAR_WIDTH + CELL_PADDING + CHIP_CHROME_PX + HEADER_CHROME_PX)
      const size = Math.max(minSize, Math.min(MAX_COL_SIZE, chipPx))
      return { size, minSize }
    }
  }

  // DateTime columns render as relative time — use a fixed width instead of the raw string.
  if (accessorKey && isDateTimeColumn(accessorKey)) {
    const dtLen = Math.max(headerLen, RELATIVE_TIME_CHARS)
    const dtPx = Math.round(dtLen * CHAR_WIDTH + CELL_PADDING)
    const size = Math.max(minSize, Math.min(MAX_COL_SIZE, dtPx))
    return { size, minSize }
  }

  const sample =
    valuesForColumn.length > MAX_SIZE_SAMPLE
      ? valuesForColumn.slice(0, MAX_SIZE_SAMPLE)
      : valuesForColumn
  const lengths = sample
    .map((v) => {
      const str = typeof v === 'string' ? v : v != null ? String(v) : ''
      // URLs render as icons/links in the cell — don't measure the full URL text.
      if (str.match(/^https?:\/\//i) || str.match(/^\/api\//i)) return 0
      return str.length
    })
    .sort((a, b) => a - b)

  // Trim the top and bottom 10% to remove outliers, then use the longest remaining value.
  let trimmedLengths = lengths
  if (lengths.length >= 5) {
    const trimCount = Math.max(1, Math.floor(lengths.length * 0.1))
    trimmedLengths = lengths.slice(trimCount, lengths.length - trimCount)
  }
  const maxLen = Math.max(headerLen, ...trimmedLengths)

  const px = Math.round(maxLen * CHAR_WIDTH + CELL_PADDING)
  const size = Math.max(minSize, Math.min(MAX_COL_SIZE, px))
  return { size, minSize }
}

// Variable replacement patterns - maps variable names to property patterns
const variableReplacements = {
  cippuserschema: (dataSample) => {
    // Find the first property that contains "_cippUser"
    const cippUserProp = Object.keys(dataSample).find((key) => key.includes('_cippUser'))
    return cippUserProp || 'cippuserschema' // fallback to original if not found
  },
}

// Function to resolve variable replacements in column names
const resolveVariables = (columnName, dataSample) => {
  return columnName.replace(/%(\w+)%/g, (match, variableName) => {
    const resolver = variableReplacements[variableName.toLowerCase()]
    if (resolver && typeof resolver === 'function') {
      const resolved = resolver(dataSample)
      console.log('resolving ' + match + ' to ' + resolved)
      return resolved
    }
    return match // return original if no resolver found
  })
}

const getAtPath = (obj, path) => {
  const parts = path.split('.')
  return parts.reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return acc[part]
    }
    return undefined
  }, obj)
}

// Function to merge keys from a sample of objects in the array.
// Sampling the first MAX_SAMPLE rows is sufficient for schema detection and avoids
// O(n * keys) traversal on large datasets.
const MAX_MERGE_SAMPLE = 50

const mergeKeys = (dataArray) => {
  const sample =
    dataArray.length > MAX_MERGE_SAMPLE ? dataArray.slice(0, MAX_MERGE_SAMPLE) : dataArray
  return sample.reduce((acc, item) => {
    const mergeRecursive = (obj, base = {}) => {
      // Add null/undefined check before calling Object.keys
      if (!obj || typeof obj !== 'object') {
        return base
      }
      Object.keys(obj).forEach((key) => {
        if (
          typeof obj[key] === 'object' &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          !skipRecursion.includes(key)
        ) {
          if (typeof base[key] === 'boolean') return // don't merge into a boolean
          if (typeof base[key] !== 'object' || Array.isArray(base[key])) base[key] = {}
          base[key] = mergeRecursive(obj[key], base[key])
        } else if (typeof obj[key] === 'boolean') {
          base[key] = obj[key]
        } else if (typeof obj[key] === 'string' && obj[key].toUpperCase() === 'FAILED') {
          // keep existing value if it's 'FAILED'
          base[key] = base[key]
        } else if (obj[key] !== undefined && obj[key] !== null) {
          base[key] = obj[key]
        }
      })
      return base
    }

    // Add null/undefined check before calling mergeRecursive
    if (!item || typeof item !== 'object') {
      return acc
    }
    return mergeRecursive(item, acc)
  }, {})
}

// Maximum rows to sample for filter heuristics (e.g. detecting value types).
// Scanning the full dataset is O(n * columns) and dominates render time on large tables.
const MAX_FILTER_SAMPLE = 50

export const utilColumnsFromAPI = (dataArray) => {
  // Add safety check for dataArray
  if (!dataArray || !Array.isArray(dataArray) || dataArray.length === 0) {
    return []
  }

  const dataSample = mergeKeys(dataArray)

  // Use a small sample for filter heuristics instead of scanning every row.
  const filterSample =
    dataArray.length > MAX_FILTER_SAMPLE ? dataArray.slice(0, MAX_FILTER_SAMPLE) : dataArray

  const generateColumns = (obj, parentKey = '') => {
    return Object.keys(obj)
      .map((key) => {
        const accessorKey = parentKey ? `${parentKey}.${key}` : key

        if (
          typeof obj[key] === 'object' &&
          obj[key] !== null &&
          !Array.isArray(obj[key]) &&
          !skipRecursion.includes(key)
        ) {
          return generateColumns(obj[key], accessorKey)
        }

        // Build a value resolver usable by both accessorFn/Cell and the filter util
        const resolveValue = (rowLike) =>
          accessorKey.includes('@odata') ? rowLike?.[accessorKey] : getAtPath(rowLike, accessorKey)

        // Sample a small subset for filter heuristics instead of the full dataset.
        const valuesForColumn = filterSample
          .map((r) => resolveValue(r))
          .filter((v) => v !== undefined && v !== null)

        const sampleValue = valuesForColumn.length ? valuesForColumn[0] : undefined

        // Measure content width from formatted text values for this column.
        const textValues = valuesForColumn.map((v) => getCippFormatting(v, accessorKey, 'text'))
        const header = getCippTranslation(accessorKey)
        const measuredSize = measureColumnSize(header, textValues, valuesForColumn, accessorKey)

        // Allow per-column size overrides for columns whose rendered output
        // doesn't match text width (icons, progress bars, etc.).
        const sizeOverride = getCippColumnSize(accessorKey, header)
        let finalSize = { ...measuredSize }
        if (sizeOverride) {
          const resolve = (v) => (v === 'header' ? measuredSize.minSize : v)
          finalSize = {
            size: Math.max(resolve(sizeOverride.size), measuredSize.minSize),
            minSize: resolve(sizeOverride.minSize ?? measuredSize.minSize),
          }
        }

        const column = {
          header,
          id: accessorKey,
          ...finalSize,
          accessorFn: (row) => {
            const value = resolveValue(row)
            return getCippFormatting(value, accessorKey, 'text')
          },
          ...getCippFilterVariant(accessorKey, {
            sampleValue,
            values: valuesForColumn,
            getValue: (row) => resolveValue(row),
            dataArray: filterSample,
          }),
          Cell: ({ row }) => {
            const value = resolveValue(row.original)
            return getCippFormatting(value, accessorKey)
          },
        }

        return column
      })
      .flat()
  }

  return generateColumns(dataSample)
}

// Helper function to resolve variables in simple column names
export const resolveSimpleColumnVariables = (simpleColumns, dataArray) => {
  if (!simpleColumns || !Array.isArray(dataArray) || dataArray.length === 0) {
    return simpleColumns
  }

  const dataSample = mergeKeys(dataArray)

  return simpleColumns.map((columnName) => {
    if (typeof columnName === 'string' && columnName.includes('%')) {
      const resolved = resolveVariables(columnName, dataSample)
      console.log(`Resolving simple column: ${columnName} -> ${resolved}`)
      return resolved
    }
    return columnName
  })
}
