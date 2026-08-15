import { getMobileCardSlots, isStatusLike } from '../../../src/components/CippTable/util-mobile-card-slots'

// Shorthand column factory mirroring what table.getVisibleLeafColumns() yields
const col = (id, def = {}) => ({ id, columnDef: { id, ...def } })
const bool = (id) => col(id, { sortingFn: 'boolean', filterVariant: 'select', filterSelectOptions: ['Yes', 'No'] })

const ids = (cols) => cols.map((c) => c.id)

// The real /identity/administration/users simpleColumns, in page order.
// accountEnabled mirrors its explicit get-cipp-filter-variant case: select variant,
// alphanumeric sorting, NO options — only the STATUS_FIELDS id match can catch it.
const USERS_COLUMNS = [
  col('accountEnabled', { filterVariant: 'select', sortingFn: 'alphanumeric', filterFn: 'equals' }),
  col('userPrincipalName'),
  col('displayName'),
  col('mail'),
  col('businessPhones'),
  col('proxyAddresses'),
  col('assignedLicenses'),
  col('licenseAssignmentStates'),
  col('userType', { filterVariant: 'select', filterSelectOptions: ['Member', 'Guest'] }),
]

describe('getMobileCardSlots', () => {
  it('resolves the users page correctly — never titles cards "Yes"', () => {
    const slots = getMobileCardSlots(USERS_COLUMNS)
    expect(slots.primary.id).toBe('displayName')
    expect(slots.secondary.id).toBe('userPrincipalName')
    expect(ids(slots.chips)).toEqual(['accountEnabled', 'userType'])
    expect(ids(slots.details)).toEqual(['mail', 'businessPhones', 'proxyAddresses'])
    expect(ids(slots.rest)).toEqual(['assignedLicenses', 'licenseAssignmentStates'])
    expect(slots.restCount).toBe(2)
  })

  it('filters out mrt-* utility columns', () => {
    const slots = getMobileCardSlots([col('mrt-row-select'), col('displayName'), col('mrt-row-actions')])
    expect(slots.primary.id).toBe('displayName')
    expect(slots.secondary).toBeNull()
    expect(slots.restCount).toBe(0)
  })

  it('handles an empty column set', () => {
    expect(getMobileCardSlots([])).toEqual({
      primary: null,
      secondary: null,
      chips: [],
      details: [],
      rest: [],
      restCount: 0,
    })
    expect(getMobileCardSlots(undefined).primary).toBeNull()
  })

  it('handles a single column', () => {
    const slots = getMobileCardSlots([col('Tenant')])
    expect(slots.primary.id).toBe('Tenant')
    expect(slots.secondary).toBeNull()
    expect(slots.chips).toEqual([])
    expect(slots.details).toEqual([])
  })

  it('falls back to first non-status textual column when nothing matches NAME_FIELDS', () => {
    const slots = getMobileCardSlots([bool('isCompliant'), col('osVersion'), col('manufacturer')])
    expect(slots.primary.id).toBe('osVersion')
    expect(ids(slots.chips)).toEqual(['isCompliant'])
    expect(ids(slots.details)).toEqual(['manufacturer'])
  })

  it('falls back to the first column when everything is status-like', () => {
    const slots = getMobileCardSlots([bool('enabled'), bool('isCompliant')])
    expect(slots.primary.id).toBe('enabled')
    expect(ids(slots.chips)).toEqual(['isCompliant'])
  })

  it('caps chips at 3 and details at 3, remainder goes to rest', () => {
    const slots = getMobileCardSlots([
      col('displayName'),
      bool('a'), bool('b'), bool('c'), bool('d'),
      col('e'), col('f'), col('g'), col('h'),
    ])
    expect(ids(slots.chips)).toEqual(['a', 'b', 'c'])
    // 'd' overflowed the chip cap — it flows into details ("whatever remains"), not rest
    expect(ids(slots.details)).toEqual(['d', 'e', 'f'])
    expect(ids(slots.rest)).toEqual(['g', 'h'])
  })

  it('respects mobileCard overrides for every slot', () => {
    const slots = getMobileCardSlots(USERS_COLUMNS, {
      primary: 'userPrincipalName',
      secondary: 'mail',
      chips: ['userType'],
      details: ['assignedLicenses'],
    })
    expect(slots.primary.id).toBe('userPrincipalName')
    expect(slots.secondary.id).toBe('mail')
    expect(ids(slots.chips)).toEqual(['userType'])
    expect(ids(slots.details)).toEqual(['assignedLicenses'])
    // everything unassigned lands in rest
    expect(ids(slots.rest)).toEqual([
      'accountEnabled',
      'displayName',
      'businessPhones',
      'proxyAddresses',
      'licenseAssignmentStates',
    ])
  })

  it('ignores override ids that are not visible and empty override arrays fall through to rest', () => {
    const slots = getMobileCardSlots(USERS_COLUMNS, { primary: 'notAColumn', chips: [], details: [] })
    expect(slots.primary.id).toBe('displayName') // heuristic fallback
    expect(slots.chips).toEqual([])
    expect(slots.details).toEqual([])
    expect(slots.restCount).toBe(7)
  })

  it('secondary never duplicates primary', () => {
    const slots = getMobileCardSlots([col('RowKey'), col('Timestamp')])
    // RowKey matches both NAME_FIELDS and IDENTIFIER_FIELDS — must not appear twice
    expect(slots.primary.id).toBe('RowKey')
    expect(slots.secondary).toBeNull()
    expect(ids(slots.details)).toEqual(['Timestamp'])
  })
})

describe('isStatusLike', () => {
  it('detects boolean sortingFn (the get-cipp-filter-variant signal)', () => {
    expect(isStatusLike(bool('anything'))).toBe(true)
  })
  it('detects known status ids case-insensitively', () => {
    expect(isStatusLike(col('complianceState'))).toBe(true)
    expect(isStatusLike(col('Severity'))).toBe(true)
    // the identity/device/custom test tables — Risk fell to the detail rows while Result sat
    // in the chips row, two chips organised by two different systems on one card
    expect(isStatusLike(col('Risk'))).toBe(true)
    expect(isStatusLike(col('Result'))).toBe(true)
  })
  it('detects small select filters, rejects large ones', () => {
    expect(isStatusLike(col('x', { filterVariant: 'select', filterSelectOptions: ['a', 'b'] }))).toBe(true)
    expect(
      isStatusLike(col('x', { filterVariant: 'select', filterSelectOptions: ['a', 'b', 'c', 'd', 'e', 'f', 'g'] }))
    ).toBe(false)
  })
  it('rejects plain text columns', () => {
    expect(isStatusLike(col('displayName'))).toBe(false)
  })
})
