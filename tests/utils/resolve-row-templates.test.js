import {
  getNestedValue,
  resolveRowTemplates,
  attachParentRow,
  getRowTenant,
} from '../../src/utils/resolve-row-templates'

const row = {
  id: 'abc-123',
  displayName: 'Finance',
  siteId: 'site-1',
  nested: { mail: 'finance@contoso.com' },
}

describe('getNestedValue', () => {
  it('reads a top-level field', () => {
    expect(getNestedValue(row, 'id')).toBe('abc-123')
  })

  it('reads a dotted path', () => {
    expect(getNestedValue(row, 'nested.mail')).toBe('finance@contoso.com')
  })

  it('returns undefined for a missing path', () => {
    expect(getNestedValue(row, 'missing.path')).toBeUndefined()
  })
})

describe('resolveRowTemplates', () => {
  it('replaces [id] in a string', () => {
    expect(resolveRowTemplates('group-members-[id]', row)).toBe(
      'group-members-abc-123'
    )
  })

  it('replaces a nested path', () => {
    expect(resolveRowTemplates('mail=[nested.mail]', row)).toBe(
      'mail=finance@contoso.com'
    )
  })

  it('leaves an unmatched token in place', () => {
    expect(resolveRowTemplates('x-[unknown]', row)).toBe('x-[unknown]')
  })

  it('walks objects used as api.data', () => {
    expect(
      resolveRowTemplates(
        { someId: '[id]', extra: true, siteId: '[siteId]' },
        row
      )
    ).toEqual({ someId: 'abc-123', extra: true, siteId: 'site-1' })
  })

  it('leaves booleans and numbers alone', () => {
    expect(resolveRowTemplates(true, row)).toBe(true)
    expect(resolveRowTemplates(999, row)).toBe(999)
  })

  it('walks arrays', () => {
    expect(resolveRowTemplates(['[id]', 1], row)).toEqual(['abc-123', 1])
  })
})

describe('attachParentRow', () => {
  const parentRow = { id: 'group-1', displayName: 'Finance' }

  it('attaches the opening row as parent', () => {
    expect(attachParentRow({ id: 'member-1' }, parentRow)).toEqual({
      id: 'member-1',
      parent: parentRow,
    })
  })

  it('leaves a row unchanged when there is no parent', () => {
    const child = { id: 'member-1' }
    expect(attachParentRow(child, undefined)).toBe(child)
  })

  it('maps arrays', () => {
    expect(attachParentRow([{ id: 'a' }, { id: 'b' }], parentRow)).toEqual([
      { id: 'a', parent: parentRow },
      { id: 'b', parent: parentRow },
    ])
  })

  it('chains an existing parent when the opening row is not nested', () => {
    const child = { id: 'member-1', parent: { id: 'api-parent' } }
    expect(attachParentRow(child, parentRow).parent).toEqual({
      id: 'group-1',
      displayName: 'Finance',
      parent: { id: 'api-parent' },
    })
  })

  it('keeps a nested table chain instead of overwriting it', () => {
    const nestedParent = { id: 'member-1', parent: parentRow }
    const grandchild = { id: 'license-1' }
    expect(attachParentRow(grandchild, nestedParent).parent).toBe(nestedParent)
  })
})

describe('getRowTenant', () => {
  it('returns the current tenant outside AllTenants', () => {
    expect(
      getRowTenant({ Tenant: 'other.com' }, 'contoso.com')
    ).toBe('contoso.com')
  })

  it('prefers the row tenant in AllTenants', () => {
    expect(getRowTenant({ Tenant: 'child.com' }, 'AllTenants')).toBe(
      'child.com'
    )
  })

  it('falls back to the nested parent tenant', () => {
    expect(
      getRowTenant({ parent: { Tenant: 'parent.com' } }, 'AllTenants')
    ).toBe('parent.com')
  })

  it('prefers tenantId on the row in AllTenants', () => {
    expect(getRowTenant({ tenantId: 'child.com' }, 'AllTenants')).toBe(
      'child.com'
    )
  })
})
