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

export const columnOrderHasStaleIds = (columnOrder, displayColumnIds) => {
  const displayIdSet = new Set(displayColumnIds)
  return (columnOrder ?? []).some(
    (id) => id && !String(id).startsWith('mrt-') && !displayIdSet.has(id)
  )
}
