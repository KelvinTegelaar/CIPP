// Measuring Helvetica, so a table cell can wrap a long value without a hyphen.
//
// react-pdf only breaks inside a word through hyphenation, and its line breaker inserts a literal
// `-` glyph at every such break (@react-pdf/textkit `breakLines`: a penalty breakpoint calls
// `insertGlyph(…, HYPHEN, …)`). There is no way to opt out — the only breakpoint that does not draw
// one is a glue node, which requires a whitespace syllable, and every whitespace character in the
// standard-14 WinAnsi encoding has a visible width. So a mid-token break that draws nothing has to
// be a real line break that we put there ourselves, which means knowing how wide the text is.
//
// These are the Adobe AFM advances for the standard-14 Helvetica faces, in 1/1000 em, for
// ASCII 32–126 — read straight out of the metrics @react-pdf/pdfkit embeds, not transcribed. Every
// report uses Helvetica; a report that registers its own font would need its own metrics, which is
// why `measureText` is deliberately conservative about characters it does not know.

const FIRST_CODE = 32
const LAST_CODE = 126

const HELVETICA = [
  278, 278, 355, 556, 556, 889, 667, 191, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 278, 278, 584, 584, 584, 556,
  1015, 667, 667, 722, 722, 667, 611, 778, 722, 278, 500, 667, 556, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 278, 278, 278, 469, 556,
  333, 556, 556, 500, 556, 556, 278, 556, 556, 222, 222, 500, 222, 833, 556, 556,
  556, 556, 333, 500, 278, 556, 500, 722, 500, 500, 500, 334, 260, 334, 584,
]

const HELVETICA_BOLD = [
  278, 333, 474, 556, 556, 889, 722, 238, 333, 333, 389, 584, 278, 333, 278, 278,
  556, 556, 556, 556, 556, 556, 556, 556, 556, 556, 333, 333, 584, 584, 584, 611,
  975, 722, 722, 722, 722, 667, 611, 778, 722, 278, 556, 722, 611, 833, 722, 778,
  667, 778, 722, 667, 611, 722, 667, 944, 667, 667, 611, 333, 278, 333, 584, 556,
  333, 556, 611, 556, 611, 556, 333, 611, 611, 278, 278, 556, 278, 889, 611, 611,
  611, 611, 389, 556, 333, 611, 556, 778, 556, 556, 500, 389, 280, 389, 584,
]

// Anything outside ASCII — an em dash, an accented name, a bullet — is assumed as wide as the
// widest ASCII glyph. Over-estimating means we break a shade early; under-estimating would let the
// value run out of its column, which is the bug this exists to fix.
const FALLBACK_WIDTH = 1015

const advanceOf = (character, bold) => {
  const code = character.charCodeAt(0)
  if (code < FIRST_CODE || code > LAST_CODE) return FALLBACK_WIDTH
  return (bold ? HELVETICA_BOLD : HELVETICA)[code - FIRST_CODE]
}

/** Width of `text` in points at `fontSize`. */
export const measureText = (text, fontSize, bold = false) => {
  let units = 0
  for (const character of String(text ?? '')) units += advanceOf(character, bold)
  return (units * fontSize) / 1000
}

// Seams a long identifier reads naturally at, in preference order. Breaking after `_` in
// `Defender_for_Business` looks deliberate; breaking mid-syllable does not.
const SEAM = /[_\-/\\.,:;@+&]/

/**
 * Insert real line breaks into any token too wide for `maxWidth`.
 *
 * Ordinary text is returned untouched — the layout engine wraps it at spaces as usual, and short
 * words keep their normal behaviour. Only a single run with no space in it that cannot fit its
 * container is touched, and it is cut at the last seam that fits, or mid-run when there is no seam
 * (a GUID, a thumbprint, a base64 blob).
 *
 * The result is a hard break, so it costs nothing at render time and draws no hyphen.
 */
export const wrapLongTokens = (text, maxWidth, fontSize, bold = false) => {
  const value = String(text ?? '')
  if (!value || !(maxWidth > 0)) return value

  return value
    .split(/(\s+)/)
    .map((token) => {
      if (!token.trim() || measureText(token, fontSize, bold) <= maxWidth) return token

      const pieces = []
      let current = ''
      let currentWidth = 0
      let lastSeam = -1

      for (const character of token) {
        const width = (advanceOf(character, bold) * fontSize) / 1000

        if (currentWidth + width > maxWidth && current) {
          // Prefer the last seam, as long as it does not leave a uselessly short piece.
          const cut = lastSeam > 0 && lastSeam >= current.length / 2 ? lastSeam + 1 : current.length
          pieces.push(current.slice(0, cut))
          current = current.slice(cut)
          currentWidth = measureText(current, fontSize, bold)
          lastSeam = -1
        }

        current += character
        currentWidth += width
        if (SEAM.test(character)) lastSeam = current.length - 1
      }

      if (current) pieces.push(current)
      return pieces.join('\n')
    })
    .join('');
}
