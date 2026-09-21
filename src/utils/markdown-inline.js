/**
 * Inline Markdown parsing for the PDF renderer.
 *
 * The on-screen report preview runs react-markdown, which understands the whole GFM inline
 * grammar. The PDF instead used a short list of regex replacements that only knew `*`, so
 * `_italic_` reached the page with its underscores still attached — and `*italic*` merely
 * lost its asterisks rather than becoming italic.
 *
 * One rule matters a great deal here: **underscores inside a word are literal**. Licence
 * SKUs such as `Defender_for_Business_Servers` and `SPE_E5_USGOV_GCCHIGH` fill these
 * reports, and a naive `/_(.*?)_/` would swallow those separators. GFM only opens `_`
 * emphasis when the delimiter sits against whitespace or punctuation, which is the
 * `isBoundary` check below. `*` carries no such restriction.
 */

// Longest first: `***` has to be tried before `**`, and `**` before `*`.
const EMPHASIS_MARKERS = [
  { marker: '***', type: 'strongEm' },
  { marker: '___', type: 'strongEm' },
  { marker: '**', type: 'strong' },
  { marker: '__', type: 'strong' },
  { marker: '~~', type: 'strike' },
  { marker: '*', type: 'em' },
  { marker: '_', type: 'em' },
]

// GFM lets a backslash escape any ASCII punctuation character.
const ESCAPABLE = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/

// A delimiter run may only open/close `_` emphasis when it borders whitespace, punctuation
// or the end of the string — never the middle of a word.
const isBoundary = (char) => char === undefined || /[\s\p{P}\p{S}]/u.test(char)

/**
 * Parse inline Markdown into a small node tree.
 *
 * Nodes are `{ type: 'text', value }` or `{ type: 'strong' | 'em' | 'strongEm' | 'code' |
 * 'strike', children }`. Anything that does not parse as markup is kept verbatim, so an
 * unmatched `*` or a stray `_` survives as ordinary text.
 *
 * @param {string} text a single line of inline Markdown
 * @returns {Array<object>} node tree
 */
export const parseInlineMarkdown = (text) => {
  const source = typeof text === 'string' ? text : String(text ?? '')
  const nodes = []
  let buffer = ''
  let i = 0

  const flush = () => {
    if (buffer) {
      nodes.push({ type: 'text', value: buffer })
      buffer = ''
    }
  }

  while (i < source.length) {
    const char = source[i]

    // Backslash escape: the next punctuation character is literal.
    if (
      char === '\\' &&
      i + 1 < source.length &&
      ESCAPABLE.test(source[i + 1])
    ) {
      buffer += source[i + 1]
      i += 2
      continue
    }

    // Code span — its contents are literal, so no recursion.
    if (char === '`') {
      const end = source.indexOf('`', i + 1)
      if (end > i + 1) {
        flush()
        nodes.push({
          type: 'code',
          children: [{ type: 'text', value: source.slice(i + 1, end) }],
        })
        i = end + 1
        continue
      }
    }

    // Link — the PDF has nowhere to navigate to, so only the label survives.
    if (char === '[') {
      const link = /^\[([^\]]*)\]\([^)\s]*(?:\s+"[^"]*")?\)/.exec(
        source.slice(i)
      )
      if (link) {
        flush()
        nodes.push(...parseInlineMarkdown(link[1]))
        i += link[0].length
        continue
      }
    }

    if (char === '*' || char === '_' || char === '~') {
      const span = matchEmphasis(source, i)
      if (span) {
        flush()
        nodes.push({
          type: span.type,
          children: parseInlineMarkdown(span.content),
        })
        i = span.end
        continue
      }
    }

    buffer += char
    i += 1
  }

  flush()
  return nodes
}

/**
 * Try to read an emphasis span starting at `start`.
 *
 * @returns {{type: string, content: string, end: number}|null} null when this delimiter is
 *   just an ordinary character — an unmatched marker, or an underscore inside a word.
 */
const matchEmphasis = (source, start) => {
  for (const { marker, type } of EMPHASIS_MARKERS) {
    if (!source.startsWith(marker, start)) continue

    // `_` and `___` only open at a word boundary; `*` may open anywhere.
    if (marker.startsWith('_') && !isBoundary(source[start - 1])) continue

    const contentStart = start + marker.length
    // An opening run cannot be followed by whitespace: `a * b` is not emphasis.
    if (contentStart >= source.length || /\s/.test(source[contentStart]))
      continue

    let search = contentStart
    while (search < source.length) {
      const close = source.indexOf(marker, search)
      if (close === -1) break

      const before = source[close - 1]
      const after = source[close + marker.length]
      const closes =
        !/\s/.test(before) &&
        (!marker.startsWith('_') || isBoundary(after)) &&
        close > contentStart

      if (closes) {
        return {
          type,
          content: source.slice(contentStart, close),
          end: close + marker.length,
        }
      }
      search = close + 1
    }
  }
  return null
}

/**
 * Flatten a parsed tree back to plain text, markup removed.
 */
export const inlineToPlainText = (text) => {
  const walk = (nodes) =>
    nodes
      .map((node) => (node.type === 'text' ? node.value : walk(node.children)))
      .join('')
  return walk(parseInlineMarkdown(text))
}
