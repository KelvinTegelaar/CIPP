import { describe, it, expect } from 'vitest'
import { variableValuesFromExpected } from '../../../src/components/CippBaselines/CippBaselineStandardSettings'

describe('variableValuesFromExpected', () => {
  it('maps the expected value back onto the variables of an expected template', () => {
    const standard = {
      expected: { preferredLanguage: '%Language%', fixed: true },
      variables: { Language: { type: 'textField' } },
    }
    expect(
      variableValuesFromExpected(standard, {
        preferredLanguage: 'de-DE',
        fixed: true,
      })
    ).toEqual({ Language: 'de-DE' })
  })

  it('reads the effective tier when the standard has no expected template', () => {
    const standard = {
      variables: {
        LockoutThreshold: { type: 'number', default: 10 },
        LockoutDurationInSeconds: { type: 'number', default: 60 },
      },
    }
    expect(
      variableValuesFromExpected(
        standard,
        { lockoutThreshold: '5' },
        { LockoutThreshold: 5, unrelated: 'x' }
      )
    ).toEqual({ LockoutThreshold: 5 })
  })
})
