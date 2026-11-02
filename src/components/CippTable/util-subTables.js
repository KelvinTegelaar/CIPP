const hasOwn = (row, key) =>
  Boolean(key) && row != null && typeof row === 'object' && Object.prototype.hasOwnProperty.call(row, key)

const hasPopulatedColumnValue = (row, columnId) => {
  if (!hasOwn(row, columnId)) {
    return false
  }
  const value = row[columnId]
  if (value == null) {
    return false
  }
  if (typeof value === 'string') {
    return value.trim().length > 0
  }
  if (Array.isArray(value)) {
    return value.length > 0
  }
  return true
}

export const dataHasPopulatedColumn = (data, columnId) =>
  Boolean(columnId) &&
  Array.isArray(data) &&
  data.some((row) => hasPopulatedColumnValue(row, columnId))

export const subTableIsSelected = (sub, selectedIds) => {
  if (!sub?.id) {
    return false
  }
  if (!Array.isArray(selectedIds) || selectedIds.length === 0) {
    return true
  }
  return selectedIds.includes(sub.id)
}

export const subTableShowsCachedColumn = (sub, data) =>
  Boolean(sub?.cachedColumn) && dataHasPopulatedColumn(data, sub.cachedColumn)

export const resolveSubTableSimpleColumns = (simpleColumns, subTables, data) => {
  if (!Array.isArray(simpleColumns) || !Array.isArray(subTables) || subTables.length === 0) {
    return simpleColumns
  }

  return simpleColumns.map((id) => {
    const sub = subTables.find((item) => item.id === id)
    if (sub && subTableShowsCachedColumn(sub, data)) {
      return sub.cachedColumn
    }
    return id
  })
}

export const getSubTableDisplayColumnIds = (subTables, simpleColumns, data) => {
  if (!Array.isArray(subTables) || subTables.length === 0) {
    return []
  }
  const ids = []
  for (const sub of subTables) {
    if (!subTableIsSelected(sub, simpleColumns)) {
      continue
    }
    const columnId = subTableShowsCachedColumn(sub, data) ? sub.cachedColumn : sub.id
    if (columnId) {
      ids.push(columnId)
    }
  }
  return ids
}

/**
 * The inactive half of each subTable pair must leave the column set entirely.
 * Cached report rows often carry both `members` (array) and `membersCsv`; if both
 * stay as MRT columns, live↔cache toggles don't look "stale" to columnOrder
 * sanitization, but the column virtualizer still blows up on pinned-index drift.
 */
export const getInactiveSubTableColumnIds = (subTables, simpleColumns, data) => {
  if (!Array.isArray(subTables) || subTables.length === 0) {
    return []
  }
  const ids = []
  for (const sub of subTables) {
    if (!subTableIsSelected(sub, simpleColumns)) {
      continue
    }
    if (subTableShowsCachedColumn(sub, data)) {
      if (sub.id) {
        ids.push(sub.id)
      }
    } else if (sub.cachedColumn) {
      ids.push(sub.cachedColumn)
    }
  }
  return ids
}

export const columnOrderHasStaleIds = (columnOrder, displayColumnIds) => {
  const displayIdSet = new Set(displayColumnIds)
  return (columnOrder ?? []).some(
    (id) => id && !String(id).startsWith('mrt-') && !displayIdSet.has(id)
  )
}

/**
 * Rebuild columnOrder so every non-MRT id exists on the current display column set.
 * MRT (with column virtualization) throws during render if order references removed
 * ids — e.g. membersCsv after switching ReportDB cache → live — so this must run
 * in the same render as the column swap, not in a later useEffect.
 */
export const sanitizeColumnOrder = (columnOrder, displayColumnIds, preferredIds = []) => {
  const displayIds = (displayColumnIds ?? []).filter(Boolean)
  if (displayIds.length === 0) {
    return columnOrder ?? []
  }
  if (!columnOrderHasStaleIds(columnOrder, displayIds)) {
    return columnOrder ?? []
  }
  const mrtLeading = (columnOrder ?? []).filter(
    (id) => id && String(id).startsWith('mrt-') && String(id).includes('select')
  )
  const mrtTrailing = (columnOrder ?? []).filter(
    (id) =>
      id &&
      String(id).startsWith('mrt-') &&
      !String(id).includes('select')
  )
  const preferred = (preferredIds ?? []).filter((id) => displayIds.includes(id))
  const selected = preferred.length > 0 ? preferred : displayIds
  const rest = displayIds.filter((id) => !selected.includes(id))
  return [...mrtLeading, ...selected, ...rest, ...mrtTrailing]
}
