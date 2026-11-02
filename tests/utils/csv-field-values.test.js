import {
  extractCsvColumnValues,
  mergeCsvFormFields,
  normalizeAutoCompleteValues,
} from '../../src/utils/csv-field-values'

describe('csv-field-values', () => {
  describe('extractCsvColumnValues', () => {
    it('extracts values for a matching column (case-insensitive, trimmed header)', () => {
      const rows = [
        { userPrincipalName: 'a@contoso.com' },
        { ' UserPrincipalName ': 'b@contoso.com' },
        { other: 'skip' },
      ]
      expect(extractCsvColumnValues(rows, 'userPrincipalName')).toEqual([
        'a@contoso.com',
        'b@contoso.com',
      ])
    })

    it('returns empty when the column header is missing', () => {
      const rows = [{ 'User Principal Name': 'a@contoso.com' }]
      expect(extractCsvColumnValues(rows, 'userPrincipalName')).toEqual([])
    })
  })

  describe('normalizeAutoCompleteValues', () => {
    it('flattens {label,value} objects to string values', () => {
      expect(
        normalizeAutoCompleteValues([
          { label: 'Alice', value: 'id-1' },
          { label: 'Bob', value: 'id-2' },
        ])
      ).toEqual(['id-1', 'id-2'])
    })
  })

  describe('mergeCsvFormFields', () => {
    const fields = [
      { type: 'autoComplete', name: 'users', csvColumn: 'userPrincipalName' },
    ]

    it('merges autocomplete and CSV values and drops the companion field', () => {
      const merged = mergeCsvFormFields(
        {
          users: [{ label: 'Alice', value: 'id-1' }],
          users__csv: [{ userPrincipalName: 'csv@contoso.com' }],
        },
        fields
      )
      expect(merged).toEqual({
        users: ['id-1', 'csv@contoso.com'],
      })
    })

    it('yields an empty users array when CSV rows lack the configured column', () => {
      const merged = mergeCsvFormFields(
        {
          users: [],
          users__csv: [{ 'User Principal Name': 'a@contoso.com' }],
        },
        fields
      )
      expect(merged.users).toEqual([])
      expect(merged.users__csv).toBeUndefined()
    })
  })
})
