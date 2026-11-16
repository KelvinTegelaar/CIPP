// Table rows know the on-screen column order (dragged, pinned) at the moment of the export;
// plain rows keep the columns as given.
export const sortColumnsByScreenOrder = (rows, columns) => {
  const order = rows?.[0]?.getVisibleCells?.().map((cell) => cell.column.id)
  if (!order?.length) return columns
  const position = (column) => {
    const index = order.indexOf(column.id)
    return index === -1 ? order.length : index
  }
  return [...columns].sort((a, b) => position(a) - position(b))
}
