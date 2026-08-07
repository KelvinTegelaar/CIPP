import { getCippFormatting } from '../../src/utils/get-cipp-formatting'

// pins exact text-mode output for high-churn cellNames so dependency bumps
// and refactors that change formatting show up as diffs here
describe('getCippFormatting (text mode)', () => {
  it('formats byte columns as GB with two decimals', () => {
    expect(getCippFormatting(5368709120, 'storageUsedInBytes', 'text')).toBe('5.00 GB')
    expect(getCippFormatting(53687091200, 'prohibitSendReceiveQuotaInBytes', 'text')).toBe(
      '50.00 GB'
    )
    expect(getCippFormatting(null, 'storageUsedInBytes', 'text')).toBe('No data')
  })

  it('formats percentage columns with a % suffix', () => {
    expect(getCippFormatting(75, 'alignmentScore', 'text')).toBe('75%')
    expect(getCippFormatting(42, 'combinedAlignmentScore', 'text')).toBe('42%')
    expect(getCippFormatting(88, 'ScorePercentage', 'text')).toBe('88%')
  })

  it('formats booleans as Yes/No', () => {
    expect(getCippFormatting(true, 'accountEnabled', 'text')).toBe('Yes')
    expect(getCippFormatting(false, 'accountEnabled', 'text')).toBe('No')
  })

  it('formats objects with an enabled flag as Yes/No', () => {
    expect(getCippFormatting({ enabled: true }, 'someField', 'text')).toBe('Yes')
    expect(getCippFormatting({ enabled: false }, 'someField', 'text')).toBe('No')
  })

  it('formats RepeatsEvery interval strings', () => {
    expect(getCippFormatting('1d', 'RepeatsEvery', 'text')).toBe('Every 1 day')
    expect(getCippFormatting('4h', 'RepeatsEvery', 'text')).toBe('Every 4 hour')
    expect(getCippFormatting('1w', 'RepeatsEvery', 'text')).toBe('Every 1 week')
    expect(getCippFormatting('30m', 'RepeatsEvery', 'text')).toBe('Every 30 minutes')
  })

  it('translates @odata.type graph types and passes non-graph types through', () => {
    expect(getCippFormatting('#microsoft.graph.conditionalAccessPolicy', '@odata.type', 'text')).toBe(
      'Conditional Access Policy'
    )
    expect(getCippFormatting('customType', '@odata.type', 'text')).toBe('customType')
  })

  it('returns a Date for dateTime columns so tables sort chronologically', () => {
    const result = getCippFormatting('2024-01-15T10:30:00Z', 'createdDateTime', 'text')
    expect(result).toBeInstanceOf(Date)
    expect(result.getTime()).toBe(new Date('2024-01-15T10:30:00Z').getTime())
  })

  it('returns a locale string for dateTime columns when canReceive is false (csv export)', () => {
    const expected = new Date('2024-01-15T10:30:00Z').toLocaleString()
    expect(getCippFormatting('2024-01-15T10:30:00Z', 'createdDateTime', 'text', false)).toBe(
      expected
    )
  })

  it('falls back to No data for null and undefined', () => {
    expect(getCippFormatting(null, 'anyField', 'text')).toBe('No data')
    expect(getCippFormatting(undefined, 'anyField', 'text')).toBe('No data')
  })

  it('hides password columns', () => {
    // breachPass not covered, passwordItems lists it mixed-case but is matched against
    // the lowercased cellName, so it never hits (component bug, not pinned here)
    expect(getCippFormatting('S3cr3t!', 'applicationSecret', 'text')).toBe('Password hidden')
    expect(getCippFormatting('tok-123', 'refreshToken', 'text')).toBe('Password hidden')
  })

  it('formats tenant columns from strings, label objects and arrays', () => {
    expect(getCippFormatting('contoso.com', 'tenantFilter', 'text')).toBe('contoso.com')
    expect(
      getCippFormatting({ label: 'Contoso Ltd', value: 'contoso.com' }, 'Tenant', 'text')
    ).toBe('Contoso Ltd')
    expect(getCippFormatting(['contoso.com', 'fabrikam.com'], 'Tenant', 'text')).toBe(
      'contoso.com, fabrikam.com'
    )
    expect(getCippFormatting(null, 'Tenant', 'text')).toBe('No data')
  })

  it('strips smtp prefixes from proxyAddresses and joins them', () => {
    expect(
      getCippFormatting(
        ['SMTP:alice@contoso.com', 'smtp:alice.smith@contoso.com'],
        'proxyAddresses',
        'text'
      )
    ).toBe('alice@contoso.com, alice.smith@contoso.com')
  })

  it('translates trustType device join values', () => {
    expect(getCippFormatting('azuread', 'trustType', 'text')).toBe('Microsoft Entra joined')
    expect(getCippFormatting('workplace', 'trustType', 'text')).toBe('Microsoft Entra registered')
    expect(getCippFormatting('serverad', 'trustType', 'text')).toBe(
      'Microsoft Entra hybrid joined'
    )
  })

  it('formats state values', () => {
    expect(getCippFormatting('enabled', 'state', 'text')).toBe('Enabled')
    expect(getCippFormatting('disabled', 'state', 'text')).toBe('Disabled')
    expect(getCippFormatting('enabledForReportingButNotEnforced', 'state', 'text')).toBe(
      'Report Only'
    )
  })

  it('formats ReportInterval seconds as days', () => {
    expect(getCippFormatting(86400, 'ReportInterval', 'text')).toBe('1 days')
    expect(getCippFormatting(604800, 'ReportInterval', 'text')).toBe('7 days')
  })
})

describe('getCippFormatting (component mode)', () => {
  it('ScheduledBackupValues cell tolerates rows missing the key', () => {
    // scheduler system-jobs view: scripted alert rows have no ScheduledBackupValues,
    // the global null guard has to catch it before the Object.keys branch
    expect(() => getCippFormatting(undefined, 'Parameters.ScheduledBackupValues')).not.toThrow()
    expect(() => getCippFormatting(null, 'Parameters.ScheduledBackupValues')).not.toThrow()
    expect(getCippFormatting(undefined, 'Parameters.ScheduledBackupValues', 'text')).toBe('No data')
  })

  it('Severity and logsToInclude cells tolerate null', () => {
    expect(() => getCippFormatting(null, 'Severity')).not.toThrow()
    expect(() => getCippFormatting(undefined, 'logsToInclude')).not.toThrow()
    expect(getCippFormatting(null, 'Severity', 'text')).toBe('No data')
  })
})
