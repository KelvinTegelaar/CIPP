import { utilColumnsFromAPI, resolveSimpleColumnVariables } from '../../../src/components/CippTable/util-columnsFromAPI'

describe('utilColumnsFromAPI', () => {
  it('generates columns from simple flat data', () => {
    const data = [
      { displayName: 'Alice Smith', mail: 'alice@contoso.com', department: 'IT' },
      { displayName: 'Bob Johnson', mail: 'bob@contoso.com', department: 'Sales' },
    ]
    const columns = utilColumnsFromAPI(data)
    const ids = columns.map((c) => c.id)
    expect(ids).toContain('displayName')
    expect(ids).toContain('mail')
    expect(ids).toContain('department')
  })

  it('generates columns for nested object properties', () => {
    const data = [
      { info: { city: 'Seattle', state: 'WA' }, name: 'Test' },
    ]
    const columns = utilColumnsFromAPI(data)
    const ids = columns.map((c) => c.id)
    expect(ids).toContain('info.city')
    expect(ids).toContain('info.state')
  })

  it('returns empty array for empty data', () => {
    const columns = utilColumnsFromAPI([])
    expect(columns).toEqual([])
  })

  it('handles null/undefined values in data', () => {
    const data = [
      { name: 'Alice', email: null },
      { name: 'Bob', email: 'bob@test.com' },
    ]
    const columns = utilColumnsFromAPI(data)
    const ids = columns.map((c) => c.id)
    expect(ids).toContain('name')
    expect(ids).toContain('email')
  })

  it('accessorFn resolves nested paths through formatting', () => {
    const data = [{ info: { city: 'Seattle' } }]
    const columns = utilColumnsFromAPI(data)
    const cityColumn = columns.find((c) => c.id === 'info.city')
    expect(cityColumn).toBeDefined()
    expect(cityColumn.accessorFn({ info: { city: 'Seattle' } })).toBe('Seattle')
    expect(cityColumn.accessorFn({})).toBe('No data')
  })

  it('each column has required MRT properties', () => {
    const data = [{ displayName: 'Alice', accountEnabled: true }]
    const columns = utilColumnsFromAPI(data)
    for (const col of columns) {
      expect(col).toHaveProperty('id')
      expect(col).toHaveProperty('header')
      expect(col).toHaveProperty('accessorFn')
    }
  })
})

describe('resolveSimpleColumnVariables', () => {
  it('returns columns as-is when no variables present', () => {
    const columns = ['displayName', 'mail', 'department']
    const result = resolveSimpleColumnVariables(columns, [])
    expect(result).toEqual(['displayName', 'mail', 'department'])
  })

  it('returns empty array for empty input', () => {
    const result = resolveSimpleColumnVariables([], [])
    expect(result).toEqual([])
  })

  it('resolves %cippuserschema% to the first _cippUser property', () => {
    const data = [
      { displayName: 'Alice', extension_abc123_cippUser: 'alice@contoso.com' },
    ]
    const result = resolveSimpleColumnVariables(['displayName', '%cippuserschema%'], data)
    expect(result).toEqual(['displayName', 'extension_abc123_cippUser'])
  })

  it('falls back to literal name when no _cippUser property exists', () => {
    const data = [{ displayName: 'Alice' }]
    const result = resolveSimpleColumnVariables(['%cippuserschema%'], data)
    expect(result).toEqual(['cippuserschema'])
  })
})
