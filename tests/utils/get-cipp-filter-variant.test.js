import { describe, it, expect } from 'vitest'
import { booleanEqualsFilterFn, getCippFilterVariant } from '../../src/utils/get-cipp-filter-variant'

describe('getCippFilterVariant array columns', () => {
  it('sorts arrays of objects (rendered as the items button) by item count', () => {
    const members = [{ id: '1', displayName: 'Alice' }]
    const result = getCippFilterVariant('Members', {
      sampleValue: members,
      values: [members],
    })
    expect(result).toEqual({ sortingFn: 'arrayLength' })
  })

  it('uses the first non-empty array in the sample, not just the first row', () => {
    const values = [[], [], [{ id: '1' }]]
    const result = getCippFilterVariant('Members', {
      sampleValue: values[0],
      values,
    })
    expect(result).toEqual({ sortingFn: 'arrayLength' })
  })

  it('leaves arrays of strings (rendered as chips) on the default text sort', () => {
    const addresses = ['SMTP:a@contoso.com', 'smtp:b@contoso.com']
    const result = getCippFilterVariant('proxyAddresses', {
      sampleValue: addresses,
      values: [addresses],
    })
    expect(result).toBeUndefined()
  })

  it('keeps the keyed assignedLicenses override ahead of the array rule', () => {
    const licenses = [{ skuId: 'cbdc14ab-d96c-4c30-b9f4-6ada7cdc1d46' }]
    const result = getCippFilterVariant('assignedLicenses', {
      sampleValue: licenses,
      values: [licenses],
      dataArray: [{ assignedLicenses: licenses }],
    })
    expect(result.sortingFn).toBe('alphanumeric')
    expect(result.filterFn).toBe('licenseIncludes')
  })

  it('still returns nothing for an all-empty array column', () => {
    const result = getCippFilterVariant('Members', {
      sampleValue: [],
      values: [[], []],
    })
    expect(result).toBeUndefined()
  })
})

describe('boolean columns', () => {
  it('filter on the raw value rather than the formatted cell text', () => {
    expect(getCippFilterVariant('MFARegistration', { sampleValue: false, values: [false] }).filterFn).toBe(
      'booleanEquals'
    )
  })

  it('match Yes and No against true, false and their string forms, never against an empty value', () => {
    const row = (value) => ({ original: { MFARegistration: value } })
    expect(booleanEqualsFilterFn(row(false), 'MFARegistration', 'No')).toBe(true)
    expect(booleanEqualsFilterFn(row(true), 'MFARegistration', 'No')).toBe(false)
    expect(booleanEqualsFilterFn(row(true), 'MFARegistration', 'Yes')).toBe(true)
    expect(booleanEqualsFilterFn(row('False'), 'MFARegistration', 'No')).toBe(true)
    expect(booleanEqualsFilterFn(row(null), 'MFARegistration', 'No')).toBe(false)
    expect(booleanEqualsFilterFn(row(null), 'MFARegistration', 'Yes')).toBe(false)
  })

  it('resolve nested column paths', () => {
    expect(booleanEqualsFilterFn({ original: { a: { b: true } } }, 'a.b', 'Yes')).toBe(true)
  })
})
