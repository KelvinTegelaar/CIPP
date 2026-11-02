import { describe, it, expect } from 'vitest'
import { toAutoCompleteOptions } from '../../src/utils/to-autocomplete-options'

// New User Default templates store autoComplete selections as whatever the form posted, and that
// shape has changed over time (single value -> list, option objects -> bare values). A field that
// receives an unexpected shape renders empty, which is how shared mailbox permissions silently
// stopped pre-filling in the Add User drawer.

const permissionOptions = [
  { label: 'Full Access', value: 'FullAccess' },
  { label: 'Send As', value: 'SendAs' },
  { label: 'Send on Behalf', value: 'SendOnBehalf' },
]

describe('toAutoCompleteOptions', () => {
  it('passes option objects through unchanged', () => {
    const stored = [
      { label: 'Full Access', value: 'FullAccess' },
      { label: 'Send As', value: 'SendAs' },
    ]

    expect(toAutoCompleteOptions(stored, permissionOptions)).toEqual(stored)
  })

  it('resolves bare values back to their labelled option', () => {
    expect(toAutoCompleteOptions(['FullAccess', 'SendAs', 'SendOnBehalf'], permissionOptions)).toEqual(
      permissionOptions
    )
  })

  it('wraps a single stored value into a list', () => {
    expect(toAutoCompleteOptions('FullAccess', permissionOptions)).toEqual([
      { label: 'Full Access', value: 'FullAccess' },
    ])
    expect(toAutoCompleteOptions({ label: 'Send As', value: 'SendAs' }, permissionOptions)).toEqual([
      { label: 'Send As', value: 'SendAs' },
    ])
  })

  it('labels values that are not in the option list, so nothing disappears', () => {
    expect(toAutoCompleteOptions(['facility@contoso.com'])).toEqual([
      { label: 'facility@contoso.com', value: 'facility@contoso.com' },
    ])
    expect(toAutoCompleteOptions([{ value: 'ReadPermission' }], permissionOptions)).toEqual([
      { label: 'ReadPermission', value: 'ReadPermission' },
    ])
  })

  it('returns an empty list for every empty shape', () => {
    expect(toAutoCompleteOptions(undefined)).toEqual([])
    expect(toAutoCompleteOptions(null)).toEqual([])
    expect(toAutoCompleteOptions('')).toEqual([])
    expect(toAutoCompleteOptions([])).toEqual([])
    expect(toAutoCompleteOptions([null, ''], permissionOptions)).toEqual([])
  })
})
