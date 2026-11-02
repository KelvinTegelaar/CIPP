import {
  matchPattern,
  flattenPermissionTree,
  expandRules,
  rulesToFlatMap,
  flatMapToRules,
  validateRulePattern,
  buildRuleSuggestions,
} from '../../src/utils/permission-rules'

// Shape returned by /api/ExecAPIPermissionList: Cat -> Obj -> Read|ReadWrite -> functions
const apiPermissions = {
  CIPP: {
    Core: { Read: {}, ReadWrite: {} },
  },
  Identity: {
    User: { Read: {}, ReadWrite: {} },
    Device: { Read: {}, ReadWrite: {} },
  },
  Exchange: {
    Mailbox: { Read: {}, ReadWrite: {} },
  },
}

const universe = flattenPermissionTree(apiPermissions)

describe('matchPattern', () => {
  it('mirrors PowerShell -like: multiple wildcards all expand', () => {
    // The old implementation only replaced the first *; this pattern needs both.
    expect(matchPattern('CIPP.*.Read*', 'CIPP.Core.ReadWrite')).toBe(true)
    expect(matchPattern('*.Mailbox.*', 'Exchange.Mailbox.Read')).toBe(true)
  })

  it('treats dots as literal separators, not regex wildcards', () => {
    expect(matchPattern('Identity.User.Read', 'IdentityXUserXRead')).toBe(false)
    expect(matchPattern('Identity.User.Read', 'Identity.User.Read')).toBe(true)
  })

  it('is case-insensitive like -like', () => {
    expect(matchPattern('identity.user.*', 'Identity.User.ReadWrite')).toBe(true)
  })

  it('anchors the pattern to the whole string', () => {
    expect(matchPattern('Identity.User', 'Identity.User.Read')).toBe(false)
    expect(matchPattern('*.Read', 'Identity.User.ReadWrite')).toBe(false)
  })
})

describe('flattenPermissionTree', () => {
  it('lists every Cat.Obj.Level string, sorted', () => {
    expect(universe).toEqual([
      'CIPP.Core.Read',
      'CIPP.Core.ReadWrite',
      'Exchange.Mailbox.Read',
      'Exchange.Mailbox.ReadWrite',
      'Identity.Device.Read',
      'Identity.Device.ReadWrite',
      'Identity.User.Read',
      'Identity.User.ReadWrite',
    ])
  })

  it('handles a missing tree', () => {
    expect(flattenPermissionTree(undefined)).toEqual([])
  })
})

describe('expandRules', () => {
  it('grants includes minus excludes, exclude wins', () => {
    const { matched, excludedBy } = expandRules(
      { Include: ['Identity.*'], Exclude: ['Identity.Device.*'] },
      universe,
    )
    expect(matched).toEqual(['Identity.User.Read', 'Identity.User.ReadWrite'])
    expect(excludedBy['Identity.Device.Read']).toBe('Identity.Device.*')
  })

  it('reports per-pattern match counts for the live preview', () => {
    const { includeCounts, excludeCounts } = expandRules(
      { Include: ['*.Read', 'Identity.Uesr.*'], Exclude: ['CIPP.*'] },
      universe,
    )
    expect(includeCounts['*.Read']).toBe(4)
    // Typo'd pattern matches nothing — this is what powers the zero-match warning.
    expect(includeCounts['Identity.Uesr.*']).toBe(0)
    expect(excludeCounts['CIPP.*']).toBe(1)
  })

  it('accepts autocomplete option objects as rule entries', () => {
    const { matched } = expandRules(
      { Include: [{ label: 'Identity.User.Read', value: 'Identity.User.Read' }], Exclude: [] },
      universe,
    )
    expect(matched).toEqual(['Identity.User.Read'])
  })
})

describe('rulesToFlatMap', () => {
  it('produces the editor grid map with ReadWrite beating Read', () => {
    const flat = rulesToFlatMap({ Include: ['Identity.User.*'], Exclude: [] }, apiPermissions)
    expect(flat['IdentityUser']).toBe('Identity.User.ReadWrite')
    expect(flat['IdentityDevice']).toBe('Identity.Device.None')
  })

  it('floors CIPP.Core at Read so a saved snapshot never locks out sign-in', () => {
    const flat = rulesToFlatMap({ Include: ['Exchange.*'], Exclude: [] }, apiPermissions)
    expect(flat['CIPPCore']).toBe('CIPP.Core.Read')
  })

  it('honours excludes', () => {
    const flat = rulesToFlatMap(
      { Include: ['Identity.*'], Exclude: ['Identity.User.ReadWrite'] },
      apiPermissions,
    )
    expect(flat['IdentityUser']).toBe('Identity.User.Read')
  })
})

describe('flatMapToRules', () => {
  it('converts a grid map to concrete-string rules, dropping None', () => {
    expect(
      flatMapToRules({
        IdentityUser: 'Identity.User.ReadWrite',
        IdentityDevice: 'Identity.Device.None',
        CIPPCore: 'CIPP.Core.Read',
      }),
    ).toEqual({ Include: ['CIPP.Core.Read', 'Identity.User.ReadWrite'], Exclude: [] })
  })
})

describe('validateRulePattern', () => {
  it.each(['*', '*.Read', 'Identity.*', 'Identity.User.*', 'Identity.User.ReadWrite'])(
    'accepts %s',
    (pattern) => expect(validateRulePattern(pattern)).toBe(true),
  )

  it.each(['', 'Identity.User.Read.Extra', 'Identity User', 'Identity..Read', 'a.b.c;drop'])(
    'rejects %s',
    (pattern) => expect(validateRulePattern(pattern)).toBe(false),
  )
})

describe('buildRuleSuggestions', () => {
  it('offers global, category and concrete patterns', () => {
    const values = buildRuleSuggestions(apiPermissions).map((o) => o.value)
    expect(values).toContain('*')
    expect(values).toContain('Identity.*')
    expect(values).toContain('Identity.User.*')
    expect(values).toContain('Identity.User.ReadWrite')
  })
})
