import {
  createTableCellHyphenation,
  escapeTableCell,
  isTableSeparatorRow,
  normaliseTableRow,
  parseTableRow,
  splitLongToken,
} from '../../src/utils/markdown-table'

describe('isTableSeparatorRow', () => {
  it('matches separators with and without outer pipes', () => {
    expect(isTableSeparatorRow('|------|----------|')).toBe(true)
    expect(isTableSeparatorRow('| --- | --- |')).toBe(true)
    expect(isTableSeparatorRow('| :--- | ---: | :---: |')).toBe(true)
    expect(isTableSeparatorRow('--- | ---')).toBe(true)
  })

  it('rejects data rows and horizontal rules', () => {
    expect(isTableSeparatorRow('| User | Licenses |')).toBe(false)
    expect(isTableSeparatorRow('| 5 days | Past due |')).toBe(false)
    expect(isTableSeparatorRow('---')).toBe(false)
    expect(isTableSeparatorRow('')).toBe(false)
    expect(isTableSeparatorRow(null)).toBe(false)
  })
})

describe('parseTableRow', () => {
  it('splits a row on its delimiters and drops the border pipes', () => {
    expect(parseTableRow('| User | Licenses |')).toEqual(['User', 'Licenses'])
  })

  it('keeps empty cells so later columns do not shift left', () => {
    // The old split-and-filter dropped the blank Seats cell, pulling every column after
    // it one place left — this is the reported "rows under the wrong header" bug.
    expect(parseTableRow('| Business Basic | Enabled |  | 12 days |')).toEqual([
      'Business Basic',
      'Enabled',
      '',
      '12 days',
    ])
  })

  it('treats an escaped pipe as content, not a delimiter', () => {
    expect(parseTableRow('| John Doe \\| Contoso | E3, E5 |')).toEqual([
      'John Doe | Contoso',
      'E3, E5',
    ])
  })

  it('unescapes backslashes', () => {
    expect(parseTableRow('| CONTOSO\\\\jdoe | Admin |')).toEqual([
      'CONTOSO\\jdoe',
      'Admin',
    ])
  })

  it('handles rows without outer pipes', () => {
    expect(parseTableRow('User | Licenses')).toEqual(['User', 'Licenses'])
  })

  it('handles a single-column row', () => {
    expect(parseTableRow('| Only |')).toEqual(['Only'])
  })

  it('returns nothing for blank input', () => {
    expect(parseTableRow('')).toEqual([])
    expect(parseTableRow(null)).toEqual([])
  })
})

describe('normaliseTableRow', () => {
  it('leaves a matching row alone', () => {
    expect(normaliseTableRow(['a', 'b'], 2)).toEqual(['a', 'b'])
  })

  it('pads a short row so its cells stay under their own headers', () => {
    expect(normaliseTableRow(['a'], 3)).toEqual(['a', '', ''])
  })

  it('folds surplus cells into the last column rather than dropping them', () => {
    expect(normaliseTableRow(['John Doe', 'Contoso', 'E3'], 2)).toEqual([
      'John Doe',
      'Contoso | E3',
    ])
  })

  it('handles empty input', () => {
    expect(normaliseTableRow([], 2)).toEqual(['', ''])
    expect(normaliseTableRow(undefined, 2)).toEqual(['', ''])
    expect(normaliseTableRow(['a'], 0)).toEqual([])
  })
})

describe('splitLongToken', () => {
  it('leaves short tokens untouched', () => {
    expect(splitLongToken('Enabled')).toEqual(['Enabled'])
  })

  it('breaks a long token at its separators', () => {
    expect(splitLongToken('Defender_for_Business_Servers')).toEqual([
      'Defender_',
      'for_',
      'Business_',
      'Servers',
    ])
  })

  it('breaks at camelCase humps', () => {
    expect(splitLongToken('microsoftBusinessPremium')).toEqual([
      'microsoft',
      'Business',
      'Premium',
    ])
  })

  it('treats a digit-to-capital hump as a seam only in mixed-case tokens', () => {
    expect(splitLongToken('Microsoft365BusinessPremium')).toEqual([
      'Microsoft365',
      'Business',
      'Premium',
    ])
    // An all-caps thumbprint has no humps — chopping it at every digit would shred it
    // into two-character fragments.
    expect(splitLongToken('A1B2C3D4E5F60718293A4B5C6D7E8F90A1B2C3D4')).toEqual([
      'A1B2C3D4E5F607',
      '18293A4B5C6D7E',
      '8F90A1B2C3D4',
    ])
  })

  it('chops a seamless run at a fixed width', () => {
    expect(splitLongToken('aaaaaaaaaabbbbbbbbbbcc', 10)).toEqual([
      'aaaaaaaaaa',
      'bbbbbbbbbb',
      'cc',
    ])
  })

  it('always rejoins to the original token', () => {
    const tokens = [
      'Defender_for_Business_Servers',
      'SPE_E5_USGOV_GCCHIGH',
      'a'.repeat(40),
      'user.name@contoso-group.example.com',
    ]
    tokens.forEach((token) =>
      expect(splitLongToken(token).join('')).toBe(token)
    )
  })

  it('does not split surrogate pairs when chopping', () => {
    const token = '🔴'.repeat(12)
    const parts = splitLongToken(token, 4)
    expect(parts.join('')).toBe(token)
    parts.forEach((part) =>
      expect(part).toBe('🔴'.repeat(Array.from(part).length))
    )
  })
})

describe('createTableCellHyphenation', () => {
  const hyphenate = createTableCellHyphenation(14)

  it('defers to the built-in engine for ordinary words', () => {
    const builtin = (word) => [word.slice(0, 3), word.slice(3)]
    expect(hyphenate('Licenses', builtin)).toEqual(['Lic', 'enses'])
  })

  it('returns the word unchanged when there is no built-in engine', () => {
    expect(hyphenate('Licenses')).toEqual(['Licenses'])
  })

  it('forces a break once a token is too wide for its column', () => {
    const builtin = (word) => [word]
    expect(hyphenate('Defender_for_Business_Servers', builtin)).toEqual([
      'Defender_',
      'for_',
      'Business_',
      'Servers',
    ])
  })

  it('passes whitespace runs straight through', () => {
    expect(hyphenate('   ', () => ['x'])).toEqual(['   '])
  })
})

describe('escapeTableCell', () => {
  it('escapes pipes', () => {
    expect(escapeTableCell('John Doe | Contoso')).toBe('John Doe \\| Contoso')
  })

  it('flattens newlines that would split the row', () => {
    expect(escapeTableCell('Line1\nLine2')).toBe('Line1 Line2')
    expect(escapeTableCell('Line1\r\nLine2')).toBe('Line1 Line2')
  })

  it('renders nullish values as an empty cell', () => {
    expect(escapeTableCell(null)).toBe('')
    expect(escapeTableCell(undefined)).toBe('')
  })

  it('round-trips through the parser', () => {
    const value = 'John Doe | Contoso'
    expect(parseTableRow(`| ${escapeTableCell(value)} | E3 |`)).toEqual([
      value,
      'E3',
    ])
  })
})
