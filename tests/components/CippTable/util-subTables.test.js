import {
  dataHasPopulatedColumn,
  resolveSubTableSimpleColumns,
  subTableIsSelected,
  subTableShowsCachedColumn,
  getSubTableDisplayColumnIds,
  getInactiveSubTableColumnIds,
  columnOrderHasStaleIds,
  sanitizeColumnOrder,
} from '../../../src/components/CippTable/util-subTables'

const membersSub = {
  id: 'members',
  header: 'Members',
  cachedColumn: 'membersCsv',
}

describe('util-subTables', () => {
  it('selects a subTable only when its id is in simpleColumns', () => {
    expect(subTableIsSelected(membersSub, ['displayName', 'members'])).toBe(true)
    expect(subTableIsSelected(membersSub, ['displayName'])).toBe(false)
    expect(subTableIsSelected(membersSub, [])).toBe(true)
  })

  it('uses the cached column when that field is present on the data', () => {
    const cached = [{ id: '1', membersCsv: 'Jane, Bob' }]
    const live = [{ id: '1', displayName: 'Finance' }]
    const liveWithEmptyCsv = [{ id: '1', displayName: 'Finance', membersCsv: '' }]

    expect(dataHasPopulatedColumn(cached, 'membersCsv')).toBe(true)
    expect(dataHasPopulatedColumn(liveWithEmptyCsv, 'membersCsv')).toBe(false)
    expect(subTableShowsCachedColumn(membersSub, cached)).toBe(true)
    expect(subTableShowsCachedColumn(membersSub, live)).toBe(false)
    expect(subTableShowsCachedColumn(membersSub, liveWithEmptyCsv)).toBe(false)
    expect(
      resolveSubTableSimpleColumns(['displayName', 'members'], [membersSub], cached)
    ).toEqual(['displayName', 'membersCsv'])
    expect(
      resolveSubTableSimpleColumns(['displayName', 'members'], [membersSub], live)
    ).toEqual(['displayName', 'members'])
  })

  it('maps subTables to the active display column ids', () => {
    const cached = [{ id: '1', membersCsv: 'Jane, Bob' }]
    const live = [{ id: '1', displayName: 'Finance' }]

    expect(
      getSubTableDisplayColumnIds([membersSub], ['displayName', 'members'], cached)
    ).toEqual(['membersCsv'])
    expect(
      getSubTableDisplayColumnIds([membersSub], ['displayName', 'members'], live)
    ).toEqual(['members'])
  })

  it('excludes the inactive half of each subTable column pair', () => {
    const cached = [{ id: '1', membersCsv: 'Jane, Bob', members: [{ id: 'u1' }] }]
    const live = [{ id: '1', displayName: 'Finance', membersCsv: '' }]

    expect(
      getInactiveSubTableColumnIds([membersSub], ['displayName', 'members'], cached)
    ).toEqual(['members'])
    expect(
      getInactiveSubTableColumnIds([membersSub], ['displayName', 'members'], live)
    ).toEqual(['membersCsv'])
  })

  it('detects stale column order ids that are not on the table', () => {
    expect(columnOrderHasStaleIds(['displayName', 'members'], ['displayName', 'membersCsv'])).toBe(
      true
    )
    expect(
      columnOrderHasStaleIds(['displayName', 'membersCsv'], ['displayName', 'membersCsv'])
    ).toBe(false)
    expect(columnOrderHasStaleIds(['mrt-row-select', 'displayName'], ['displayName'])).toBe(false)
  })

  it('sanitizes stale column order in the same pass (cache→live membersCsv swap)', () => {
    expect(
      sanitizeColumnOrder(
        ['mrt-row-select', 'CacheTimestamp', 'displayName', 'membersCsv', 'mrt-row-actions'],
        ['displayName', 'members'],
        ['displayName', 'members']
      )
    ).toEqual(['mrt-row-select', 'displayName', 'members', 'mrt-row-actions'])
  })

  it('leaves a valid column order untouched', () => {
    const order = ['mrt-row-select', 'displayName', 'membersCsv', 'mrt-row-actions']
    expect(sanitizeColumnOrder(order, ['displayName', 'membersCsv'], ['displayName', 'membersCsv'])).toBe(
      order
    )
  })
})
