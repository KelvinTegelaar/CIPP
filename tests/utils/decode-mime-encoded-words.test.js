import { describe, expect, it } from 'vitest'
import { decodeMimeEncodedWords } from '../../src/utils/decode-mime-encoded-words'

describe('decodeMimeEncodedWords', () => {
  it('leaves plain names and non-strings alone', () => {
    expect(decodeMimeEncodedWords('invoice.pdf')).toBe('invoice.pdf')
    expect(decodeMimeEncodedWords(undefined)).toBeUndefined()
    expect(decodeMimeEncodedWords(null)).toBeNull()
  })

  it('decodes Q-encoded Windows-1252 names with underscores as spaces', () => {
    expect(
      decodeMimeEncodedWords(
        '=?Windows-1252?Q?2024.11.08_-_Statement_of_Account_=E9.pdf?='
      )
    ).toBe('2024.11.08 - Statement of Account é.pdf')
  })

  it('decodes B-encoded utf-8 names', () => {
    const encoded = btoa(
      String.fromCharCode(...new TextEncoder().encode('Übersicht.xlsx'))
    )
    expect(decodeMimeEncodedWords(`=?UTF-8?B?${encoded}?=`)).toBe(
      'Übersicht.xlsx'
    )
  })

  it('treats an empty charset as utf-8', () => {
    expect(decodeMimeEncodedWords('=??Q?Memo_=C3=A9.docx?=')).toBe(
      'Memo é.docx'
    )
  })

  it('joins adjacent encoded words and keeps surrounding text', () => {
    expect(
      decodeMimeEncodedWords('=?utf-8?Q?Memo?==?utf-8?Q?_2026?=.pdf')
    ).toBe('Memo 2026.pdf')
  })

  it('returns the original word when it cannot be decoded', () => {
    expect(decodeMimeEncodedWords('=?no-such-charset?B?QUJD?=')).toBe(
      '=?no-such-charset?B?QUJD?='
    )
  })
})
