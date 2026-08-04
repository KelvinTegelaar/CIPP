/**
 * Parsing helpers for GitHub-flavoured Markdown tables.
 *
 * The report builder renders the same markdown three different ways: a react-markdown
 * preview, a TipTap-editable HTML conversion, and the PDF. Only the preview runs a real
 * GFM parser — the other two hand-rolled it by splitting each line on every `|`, which
 * meant an escaped pipe (`John Doe \| Contoso`) opened a phantom column and an empty cell
 * was dropped outright, shifting every column after it one place to the left.
 *
 * These helpers give both hand-rolled renderers the same GFM-compatible behaviour.
 */

const SEPARATOR_ROW = /^\|?[\s:|-]*-[\s:|-]*\|?$/

// Long values wrap at these characters before we resort to chopping mid-token.
const BREAK_AFTER = /[_\-/\\.,:;@+&]/
const DEFAULT_MAX_TOKEN_LENGTH = 14

/**
 * True for the `|----|:---:|` divider that separates a GFM table header from its body.
 */
export const isTableSeparatorRow = (line) => {
  const trimmed = (line ?? '').trim()
  if (!trimmed.includes('|') || !trimmed.includes('-')) return false
  return SEPARATOR_ROW.test(trimmed)
}

/**
 * Split one Markdown table row into its cells.
 *
 * Unlike a plain `split('|')` this honours `\|` and `\\` escapes, keeps empty cells (they
 * hold a column open), and drops only the leading/trailing pipes that draw the row border.
 *
 * @param {string} line a single line of a Markdown table
 * @returns {string[]} trimmed cell values, escapes resolved
 */
export const parseTableRow = (line) => {
  const raw = (line ?? '').trim()
  if (!raw) return []

  const cells = []
  let current = ''
  let leadingBorder = false
  let trailingBorder = false

  for (let i = 0; i < raw.length; i += 1) {
    const char = raw[i]
    const next = raw[i + 1]

    if (char === '\\' && (next === '|' || next === '\\')) {
      current += next
      i += 1
      continue
    }
    if (char === '|') {
      if (i === 0) leadingBorder = true
      if (i === raw.length - 1) trailingBorder = true
      cells.push(current)
      current = ''
      continue
    }
    current += char
  }
  cells.push(current)

  if (leadingBorder) cells.shift()
  if (trailingBorder) cells.pop()

  return cells.map((cell) => cell.trim())
}

/**
 * Force a row to the table's column count so it always lines up under its headers.
 *
 * Short rows are padded with empty cells. Over-long rows — the signature of an unescaped
 * pipe in the source data — fold their surplus back into the final column rather than
 * being dropped: the value is already mangled at that point, but at least the row stays
 * under the right headings and no data disappears.
 *
 * @param {string[]} cells cells from {@link parseTableRow}
 * @param {number} columnCount the column count declared by the header row
 * @returns {string[]} exactly `columnCount` cells
 */
export const normaliseTableRow = (cells, columnCount) => {
  const row = cells ?? []
  if (columnCount <= 0) return []
  if (row.length === columnCount) return row
  if (row.length < columnCount) {
    return [...row, ...Array(columnCount - row.length).fill('')]
  }
  return [
    ...row.slice(0, columnCount - 1),
    row.slice(columnCount - 1).join(' | '),
  ]
}

const chunkByCodePoint = (value, size) => {
  const characters = Array.from(value)
  const chunks = []
  for (let i = 0; i < characters.length; i += size) {
    chunks.push(characters.slice(i, i + size).join(''))
  }
  return chunks
}

/**
 * Break an oversized token into pieces a narrow table column can wrap.
 *
 * Prefers natural seams — separators such as `_` and `.`, plus camelCase boundaries — so
 * `Defender_for_Business_Servers` becomes `Defender_ / for_ / Business_ / Servers`. Only
 * a run with no seam at all (a GUID, a thumbprint, a base64 blob) is chopped at a fixed
 * width. The pieces always rejoin to the original token.
 *
 * These are break *opportunities*, not forced breaks: the layout engine packs as many
 * consecutive pieces onto a line as will fit, and draws a hyphen wherever it does break —
 * that hyphen is react-pdf's own behaviour at any mid-word break and cannot be turned off.
 *
 * @param {string} word the token to split
 * @param {number} [maxLength] longest piece to leave intact
 * @returns {string[]} pieces that satisfy `pieces.join('') === word`
 */
export const splitLongToken = (word, maxLength = DEFAULT_MAX_TOKEN_LENGTH) => {
  if (!word || word.length <= maxLength) return [word]

  // `SPE365Business` reads as camelCase; `A1B2C3D4` is a hex blob, not humps. Only treat a
  // digit-to-capital transition as a seam when the token has lower-case letters elsewhere,
  // otherwise a thumbprint shreds into two-character fragments.
  const digitHumpIsSeam = /[a-z]/.test(word)

  const parts = []
  let current = ''
  for (let i = 0; i < word.length; i += 1) {
    current += word[i]
    const nextIsCapital = /[A-Z]/.test(word[i + 1] ?? '')
    const atSeparator = BREAK_AFTER.test(word[i])
    const atCamelHump =
      nextIsCapital &&
      (/[a-z]/.test(word[i]) || (digitHumpIsSeam && /[0-9]/.test(word[i])))
    if (atSeparator || atCamelHump) {
      parts.push(current)
      current = ''
    }
  }
  if (current) parts.push(current)

  return parts.flatMap((part) =>
    part.length <= maxLength ? [part] : chunkByCodePoint(part, maxLength)
  )
}

/**
 * Build a `hyphenationCallback` for @react-pdf/renderer `<Text>` nodes in table cells.
 *
 * react-pdf hyphenates with English patterns by default. Those find no break at all in a
 * GUID or a certificate thumbprint, so the whole token is drawn on one line and runs off
 * into the next column; and where they do fire on an identifier they land badly, cutting
 * `Defender_for_Business_Servers` after `Defend`. This defers to the built-in engine for
 * ordinary words and takes over once a token is too wide for its column.
 *
 * @param {number} [maxLength] longest token left to the built-in hyphenation engine
 * @returns {(word: string, builtinHyphenate?: (word: string) => string[]) => string[]}
 */
export const createTableCellHyphenation =
  (maxLength = DEFAULT_MAX_TOKEN_LENGTH) =>
  (word, builtinHyphenate) => {
    if (!word || !word.trim()) return [word]
    if (word.length <= maxLength) {
      return typeof builtinHyphenate === 'function'
        ? builtinHyphenate(word)
        : [word]
    }
    return splitLongToken(word, maxLength)
  }

/**
 * Escape a value so it survives being dropped into a Markdown table cell.
 *
 * Mirrors `ConvertTo-CippMarkdownCell` on the backend.
 */
export const escapeTableCell = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim()
}
