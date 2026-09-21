/**
 * Inline HTML parsing for the PDF renderer.
 *
 * Blank blocks and static test blocks are authored in the TipTap rich-text editor and
 * stored as HTML. The PDF used to run that HTML through `stripTags`, which threw the marks
 * away with the markup — bold and italic typed into the editor arrived on the page as flat
 * body text.
 *
 * The node shape here is deliberately identical to `parseInlineMarkdown`'s, so both content
 * types share one renderer in ReportBuilderPDF.
 */

// Tags that carry formatting. Anything else is transparent: its children still render, the
// tag itself contributes nothing. That keeps stray wrappers such as an unclosed `<ul>` left
// behind by the block splitter from reaching the page as text.
const MARK_TAGS = {
  strong: 'strong',
  b: 'strong',
  em: 'em',
  i: 'em',
  s: 'strike',
  del: 'strike',
  strike: 'strike',
  u: 'underline',
  code: 'code',
}

// Tags whose content is not text at all — drop them and everything inside.
const VOID_CONTENT_TAGS = new Set(['script', 'style'])

const NAMED_ENTITIES = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  ndash: '–',
  mdash: '—',
  hellip: '…',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
}

export const decodeHtmlEntities = (text) =>
  String(text ?? '').replace(
    /&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g,
    (match, entity) => {
      if (entity[0] === '#') {
        const codePoint =
          entity[1] === 'x' || entity[1] === 'X'
            ? parseInt(entity.slice(2), 16)
            : parseInt(entity.slice(1), 10)
        return Number.isFinite(codePoint) && codePoint > 0
          ? String.fromCodePoint(codePoint)
          : match
      }
      const named = NAMED_ENTITIES[entity.toLowerCase()]
      return named ?? match
    }
  )

/**
 * Parse a fragment of inline HTML into the shared node tree.
 *
 * Nodes are `{ type: 'text', value }` or `{ type: 'strong' | 'em' | 'strike' | 'underline' |
 * 'code', children }`. Nesting is preserved, so `<strong><em>x</em></strong>` renders bold
 * *and* italic.
 *
 * @param {string} html an inline HTML fragment
 * @returns {Array<object>} node tree
 */
export const parseInlineHtml = (html) => {
  const source = typeof html === 'string' ? html : String(html ?? '')
  const root = { children: [] }
  const stack = [root]
  let buffer = ''
  let skipUntil = null

  const flush = () => {
    if (!buffer) return
    stack[stack.length - 1].children.push({
      type: 'text',
      value: decodeHtmlEntities(buffer),
    })
    buffer = ''
  }

  const tagPattern = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b[^>]*>/g
  let cursor = 0
  let match

  while ((match = tagPattern.exec(source)) !== null) {
    const [tag, closingSlash, rawName] = match
    const name = rawName.toLowerCase()
    const isClosing = closingSlash === '/'

    if (skipUntil) {
      // Inside <script>/<style>: swallow everything until the matching close tag.
      cursor = tagPattern.lastIndex
      if (isClosing && name === skipUntil) skipUntil = null
      continue
    }

    buffer += source.slice(cursor, match.index)
    cursor = tagPattern.lastIndex

    if (VOID_CONTENT_TAGS.has(name)) {
      if (!isClosing && !tag.endsWith('/>')) skipUntil = name
      continue
    }

    if (name === 'br') {
      flush()
      stack[stack.length - 1].children.push({ type: 'text', value: '\n' })
      continue
    }

    const type = MARK_TAGS[name]
    if (!type) continue

    if (isClosing) {
      // Close the nearest matching open mark; ignore a stray close tag entirely.
      for (let i = stack.length - 1; i > 0; i -= 1) {
        if (stack[i].type === type) {
          flush()
          stack.length = i
          break
        }
      }
      continue
    }

    // A self-closing mark tag opens nothing.
    if (tag.endsWith('/>')) continue

    flush()
    const node = { type, children: [] }
    stack[stack.length - 1].children.push(node)
    stack.push(node)
  }

  if (!skipUntil) buffer += source.slice(cursor)
  flush()

  return root.children
}

/**
 * Flatten parsed inline HTML to plain text, markup removed.
 */
export const htmlToPlainText = (html) => {
  const walk = (nodes) =>
    nodes
      .map((node) => (node.type === 'text' ? node.value : walk(node.children)))
      .join('')
  return walk(parseInlineHtml(html))
}
