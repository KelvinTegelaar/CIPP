// RFC 2047 encoded-word: =?charset?B|Q?text?=
// eml-parse-js decodes these in the Subject header but not in attachment file names. It also
// strips whitespace and the literal "utf-8" from the name header before handing it over, so a
// lowercase utf-8 word arrives as "=??Q?...?=" - an empty charset therefore means utf-8.
const ENCODED_WORD = /=\?([^?]*)\?([BbQq])\?([^?]*)\?=/g

const qDecode = (text) =>
  text
    .replace(/_/g, ' ')
    .replace(/=([0-9A-Fa-f]{2})/g, (match, hex) =>
      String.fromCharCode(parseInt(hex, 16))
    )

const toBytes = (text) =>
  Uint8Array.from(text, (char) => char.charCodeAt(0) & 0xff)

export const decodeMimeEncodedWords = (value) => {
  if (typeof value !== 'string' || !value.includes('=?')) {
    return value
  }
  return value.replace(ENCODED_WORD, (word, charset, encoding, text) => {
    try {
      const raw =
        encoding.toUpperCase() === 'B'
          ? atob(text.replace(/\s/g, ''))
          : qDecode(text)
      return new TextDecoder(charset || 'utf-8').decode(toBytes(raw))
    } catch {
      return word
    }
  })
}
