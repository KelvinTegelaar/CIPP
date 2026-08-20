/**
 * Pull values from CSV rows for a named column (case-insensitive, trimmed header match).
 */
export const extractCsvColumnValues = (csvRows, csvColumn) => {
  if (!csvColumn || !Array.isArray(csvRows) || csvRows.length === 0) {
    return []
  }
  const colLower = String(csvColumn).trim().toLowerCase()
  return csvRows
    .map((row) => {
      if (!row || typeof row !== 'object') return null
      const key = Object.keys(row).find((k) => k.trim().toLowerCase() === colLower)
      return key ? String(row[key]).trim() : null
    })
    .filter((v) => v != null && v !== '')
}

/**
 * Flatten autocomplete form values to plain string ids/UPNs.
 */
export const normalizeAutoCompleteValues = (value) => {
  const items = Array.isArray(value) ? value : value != null && value !== '' ? [value] : []
  return items
    .filter(Boolean)
    .map((item) =>
      typeof item === 'object' && item?.value != null
        ? String(item.value)
        : item != null
          ? String(item)
          : null
    )
    .filter(Boolean)
}

/**
 * Merge autocomplete + optional CSV companion field (`${name}__csv`) into a flat string array.
 */
export const mergeCsvFormFields = (formData, fields) => {
  if (!fields?.length) return formData
  const merged = { ...formData }
  fields.forEach((field) => {
    if (!field.csvColumn || !field.name) return
    const csvFieldName = `${field.name}__csv`
    const acValues = normalizeAutoCompleteValues(merged[field.name])
    const csvValues = extractCsvColumnValues(merged[csvFieldName], field.csvColumn)
    merged[field.name] = [...acValues, ...csvValues]
    delete merged[csvFieldName]
  })
  return merged
}
