import { describe, expect, it } from 'vitest'
import { decodeTnef } from '../../src/utils/decode-tnef'
import { tnefBytes } from '../mocks/quarantine-tnef-message'

const u16 = (n) => [n & 0xff, n >> 8]
const u32 = (n) => [n & 0xff, (n >> 8) & 0xff, (n >> 16) & 0xff, n >>> 24]
const attribute = (id, data) => [
  2,
  ...u16(id),
  ...u16(0x0006),
  ...u32(data.length),
  ...data,
  0,
  0,
]

// a winmail.dat attached to a message is itself an attachment of the outer TNEF
const wrapAsAttachment = (inner) =>
  new Uint8Array([
    ...u32(0x223e9f78),
    ...u16(1),
    ...attribute(0x9002, [1, 0, 0, 0]),
    ...attribute(0x800f, inner),
  ])

describe('decodeTnef', () => {
  it('reads the HTML body and each attachment past the MAPI properties Exchange writes', () => {
    const message = decodeTnef(tnefBytes)

    expect(message.html).toContain('<p>Test message for issue 962.</p>')
    expect(
      message.attachments.map(({ name, contentType }) => [name, contentType])
    ).toEqual([
      ['Invoice_2026-10.pdf', 'application/pdf'],
      ['ViewDocument.html', 'text/html'],
    ])
    expect(new TextDecoder().decode(message.attachments[0].data)).toMatch(
      /^%PDF-1\.4/
    )
    expect(message.attachments[0].data.byteLength).toBe(192)
    expect(new TextDecoder().decode(message.attachments[1].data)).toBe(
      '<html><body><p>CIPP962 test attachment</p></body></html>'
    )
  })

  it('replaces a nested winmail.dat with the files inside it', () => {
    const message = decodeTnef(wrapAsAttachment(tnefBytes))

    expect(message.attachments.map((attachment) => attachment.name)).toEqual([
      'Invoice_2026-10.pdf',
      'ViewDocument.html',
    ])
    expect(message.html).toContain('Test message for issue 962.')
  })

  it('returns null for bytes without the TNEF signature', () => {
    expect(decodeTnef(new TextEncoder().encode('not a winmail.dat'))).toBeNull()
    expect(decodeTnef(new Uint8Array(0))).toBeNull()
  })
})
