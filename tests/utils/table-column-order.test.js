import { sortColumnsByScreenOrder } from '../../src/utils/table-column-order'

const columns = [{ id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'hidden' }]
const tableRow = (ids) => ({
  getVisibleCells: () => ids.map((id) => ({ column: { id } })),
})

describe('sortColumnsByScreenOrder', () => {
  it('follows the table row order and keeps columns it does not show at the end', () => {
    const rows = [
      tableRow(['mrt-row-select', 'c', 'a', 'b', 'mrt-row-actions']),
    ]
    expect(sortColumnsByScreenOrder(rows, columns).map((c) => c.id)).toEqual([
      'c',
      'a',
      'b',
      'hidden',
    ])
  })

  it('leaves the columns as given for plain rows or no rows', () => {
    expect(sortColumnsByScreenOrder([{ a: 1 }], columns)).toBe(columns)
    expect(sortColumnsByScreenOrder([], columns)).toBe(columns)
  })
})
