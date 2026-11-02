import { getCippTranslation } from '../../src/utils/get-cipp-translation'

describe('getCippTranslation', () => {
  it('returns No data for null and undefined', () => {
    expect(getCippTranslation(null)).toBe('No data')
    expect(getCippTranslation(undefined)).toBe('No data')
  })

  it('uses the translation map when the field is known', () => {
    expect(getCippTranslation('userPrincipalName')).toBe('User Principal Name')
    expect(getCippTranslation('tenantId')).toBe('Tenant ID')
  })

  it('splits camelCase fields not in the map', () => {
    expect(getCippTranslation('customAttributeOne')).toBe('Custom Attribute One')
  })

  it('splits acronym boundaries', () => {
    expect(getCippTranslation('SMTPAddress')).toBe('SMTP Address')
  })

  it('strips extension_ prefixes down to the final segment', () => {
    // extension_<appid>_<field> -> translate <field>
    expect(getCippTranslation('extension_abc123_customAttr')).toBe('Custom Attr')
  })

  it('strips ext schema prefixes down to the final segment', () => {
    expect(getCippTranslation('ext1_someField')).toBe('Some Field')
  })

  it('renders dotted paths as segments', () => {
    expect(getCippTranslation('nested.osVersion')).toBe('Nested - Os Version')
  })

  it('replaces underscores with spaces', () => {
    expect(getCippTranslation('some_field')).toBe('Some field')
  })
})
