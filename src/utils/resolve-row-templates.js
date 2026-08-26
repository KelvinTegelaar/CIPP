const TEMPLATE = /\[([^\]]+)\]/g

/**
 * Resolve a dotted path against an object. Missing segments yield undefined.
 */
export const getNestedValue = (source, path) => {
  if (source === undefined || source === null) {
    return undefined
  }
  if (!path) {
    return source
  }

  // Row keys can contain literal dots (e.g. '@odata.type'). Prefer an exact key match before
  // treating the dot as a path separator, otherwise '@odata.type' resolves to row['@odata']['type']
  // (undefined) and callers fall back to the literal string.
  if (
    typeof source === 'object' &&
    Object.prototype.hasOwnProperty.call(source, path)
  ) {
    return source[path]
  }

  return path.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) {
      return undefined
    }
    if (typeof acc !== 'object') {
      return undefined
    }
    return acc[key]
  }, source)
}

/**
 * Nested-table action context: `parent` is the opening row. If the child already
 * had `parent` (API data), chain it at `parent.parent` unless the opening row is
 * itself nested and already owns that slot.
 */
export const attachParentRow = (row, parentRow) => {
  if (!parentRow || row == null) {
    return row
  }
  if (Array.isArray(row)) {
    return row.map((item) => attachParentRow(item, parentRow))
  }
  if (row.parent === parentRow) {
    return row
  }

  let nextParent = parentRow
  if (row.parent !== undefined && parentRow.parent === undefined) {
    nextParent = { ...parentRow, parent: row.parent }
  }
  return { ...row, parent: nextParent }
}

/**
 * AllTenants convention used across CIPP: prefer the row (or nested parent) tenant.
 */
export const getRowTenant = (row, currentTenant) => {
  if (currentTenant !== 'AllTenants') {
    return currentTenant
  }
  const source = Array.isArray(row) ? row[0] : row
  return (
    source?.Tenant ||
    source?.tenantId ||
    source?.parent?.Tenant ||
    source?.parent?.tenantId ||
    source?.tenantFilter ||
    source?.parent?.tenantFilter ||
    currentTenant
  )
}

const replaceTemplatesInString = (value, row) =>
  value.replace(TEMPLATE, (_, key) => {
    const resolved = getNestedValue(row, key)
    if (resolved === undefined || resolved === null) {
      return `[${key}]`
    }
    return String(resolved)
  })

/**
 * Walk strings (and objects/arrays of them) and replace `[field]` / `[nested.path]`
 * from `row`. Booleans, numbers, and null stay as-is.
 */
export const resolveRowTemplates = (value, row) => {
  if (typeof value === 'string') {
    return replaceTemplatesInString(value, row)
  }
  if (Array.isArray(value)) {
    return value.map((item) => resolveRowTemplates(item, row))
  }
  if (value && typeof value === 'object') {
    const next = {}
    for (const key of Object.keys(value)) {
      next[key] = resolveRowTemplates(value[key], row)
    }
    return next
  }
  return value
}
