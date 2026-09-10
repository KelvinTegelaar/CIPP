import {
  escapeTableCell,
  isTableSeparatorRow,
  normaliseTableRow,
  parseTableRow,
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

describe('escapeTableCell', () => {
  it('escapes pipes', () => {
    expect(escapeTableCell('John Doe | Contoso')).toBe('John Doe \\| Contoso')
  })

  it('escapes backslashes so a literal one is not read as an escape', () => {
    expect(escapeTableCell('CONTOSO\\jdoe')).toBe('CONTOSO\\\\jdoe')
    // A backslash directly before a pipe must not swallow the pipe escape.
    expect(escapeTableCell('C:\\|x')).toBe('C:\\\\\\|x')
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
    for (const value of ['John Doe | Contoso', 'CONTOSO\\jdoe', 'C:\\|x', 'a\\\\b']) {
      expect(parseTableRow(`| ${escapeTableCell(value)} | E3 |`)).toEqual([
        value,
        'E3',
      ])
    }
  })
})