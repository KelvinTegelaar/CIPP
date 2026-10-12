import { describe, it, expect } from 'vitest'
import { SORTING_FNS } from '../../../src/components/CippTable/CippDataTable'

const row = (original) => ({ original })

describe('SORTING_FNS.arrayLength', () => {
  const sort = SORTING_FNS.arrayLength

  it('orders rows by the number of items in the array column', () => {
    const rows = [
      row({ Members: [{ id: '1' }, { id: '2' }] }),
      row({ Members: [] }),
      row({ Members: [{ id: '3' }] }),
    ]
    const sorted = [...rows].sort((a, b) => sort(a, b, 'Members'))
    expect(sorted.map((r) => r.original.Members.length)).toEqual([0, 1, 2])
  })

  it('puts rows without an array last', () => {
    const rows = [
      row({ Members: null }),
      row({ Members: [{ id: '1' }] }),
      row({}),
    ]
    const sorted = [...rows].sort((a, b) => sort(a, b, 'Members'))
    expect(Array.isArray(sorted[0].original.Members)).toBe(true)
    expect(Array.isArray(sorted[1].original.Members)).toBe(false)
    expect(Array.isArray(sorted[2].original.Members)).toBe(false)
  })

  it('resolves dot-delimited column ids against the original row', () => {
    const a = row({ role: { Members: [{ id: '1' }] } })
    const b = row({ role: { Members: [{ id: '1' }, { id: '2' }] } })
    expect(sort(a, b, 'role.Members')).toBe(-1)
    expect(sort(b, a, 'role.Members')).toBe(1)
    expect(sort(a, a, 'role.Members')).toBe(0)
  })
})
