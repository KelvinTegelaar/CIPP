import { describe, it, expect } from 'vitest'
import { getListGraphBulkRequestRows } from '../../src/utils/getListGraphBulkRequestRows.js'

const row = { id: 'roleAssignments', status: 200, body: { value: [{ id: 'a' }] } }
const mutation = (data) => ({ data: { data } })

describe('getListGraphBulkRequestRows', () => {
  it('returns the rows of a multi-request batch', () => {
    const rows = [row, { id: 'other', status: 200, body: {} }]
    expect(getListGraphBulkRequestRows(mutation(rows))).toEqual(rows)
  })

  it('wraps the bare row a one-request batch returns', () => {
    expect(getListGraphBulkRequestRows(mutation(row))).toEqual([row])
  })

  it('returns nothing before the call resolves or for a non-row payload', () => {
    expect(getListGraphBulkRequestRows(undefined)).toEqual([])
    expect(getListGraphBulkRequestRows(mutation(null))).toEqual([])
    expect(getListGraphBulkRequestRows(mutation('No requests found in the body'))).toEqual([])
  })
})
