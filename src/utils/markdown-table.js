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

/**
 * Escape a value so it survives being dropped into a Markdown table cell.
 *
 * Mirrors `ConvertTo-CippMarkdownCell` on the backend.
 */
export const escapeTableCell = (value) => {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\|/g, '\\|').replace(/\r?\n/g, ' ').trim()
}