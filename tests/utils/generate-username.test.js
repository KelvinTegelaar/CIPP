import { describe, expect, it } from 'vitest'
import { generateUsername, splitSurname } from '../../src/utils/generate-username'

const PRESET = '%FirstName[1]%.%LastNamePrefix[1]%%LastNameCore%'

describe('generateUsername existing tokens', () => {
  it('builds from full and truncated names', () => {
    expect(generateUsername('%FirstName%.%LastName%', 'John', 'Doe')).toBe('john.doe')
    expect(generateUsername('%FirstName[1]%%LastName%', 'John', 'Doe')).toBe('jdoe')
    expect(generateUsername('%LastName[1]%', 'Jan', 'van der Berg')).toBe('vdb')
  })

  it('applies space handling', () => {
    const f = '%FirstName%.%LastName%'
    expect(generateUsername(f, 'Jan', 'van der Berg', 'remove')).toBe('jan.vanderberg')
    expect(generateUsername(f, 'Jan', 'van der Berg', 'replace', '_')).toBe(
      'jan.van_der_berg'
    )
  })
})

describe('generateUsername prefix/core tokens', () => {
  it('splits particles from the core', () => {
    expect(generateUsername(PRESET, 'Jan', 'van der Berg')).toBe('j.vdberg')
    expect(
      generateUsername('%FirstName[1]%%LastNamePrefix[1]%%LastNameCore%', 'Jan', 'van der Berg')
    ).toBe('jvdberg')
    expect(generateUsername('%FirstName%.%LastNameCore%', 'Jan', 'van der Berg')).toBe(
      'jan.berg'
    )
  })

  it('degrades when there is no prefix', () => {
    expect(generateUsername(PRESET, 'John', 'Doe')).toBe('j.doe')
  })

  it("takes the initial of an apostrophe word without the apostrophe (van 't Hoff)", () => {
    expect(
      generateUsername('%FirstName[1]%%LastNamePrefix[1]%%LastNameCore%', 'John', "van 't Hoff")
    ).toBe('jvthoff')
  })

  it('joins whole prefix and core with a space for space handling', () => {
    expect(generateUsername('%LastNamePrefix%.%LastNameCore%', 'A', 'van der Berg', 'replace', '-')).toBe(
      'van-der.berg'
    )
  })
})

describe('splitSurname', () => {
  it('splits a multi-word particle', () => {
    expect(splitSurname('van der Berg')).toEqual({ prefix: ['van', 'der'], core: ['Berg'] })
    expect(splitSurname("van 't Hoff")).toEqual({ prefix: ['van', "'t"], core: ['Hoff'] })
  })

  it('leaves a non-particle surname as core', () => {
    expect(splitSurname('Doe')).toEqual({ prefix: [], core: ['Doe'] })
  })

  it('keeps the whole surname as core when it is only particles', () => {
    expect(splitSurname('De')).toEqual({ prefix: [], core: ['De'] })
  })
})
