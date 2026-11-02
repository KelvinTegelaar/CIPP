import {
  inlineToPlainText,
  parseInlineMarkdown,
} from '../../src/utils/markdown-inline'

// Compact rendering of the node tree so expectations stay readable:
// 'plain <strong>bold</strong>'
const show = (nodes) =>
  nodes
    .map((node) =>
      node.type === 'text'
        ? node.value
        : `<${node.type}>${show(node.children)}</${node.type}>`
    )
    .join('')

const parse = (text) => show(parseInlineMarkdown(text))

describe('parseInlineMarkdown', () => {
  it('italicises the underscore emphasis that used to leak into the PDF', () => {
    expect(
      parse('_No results available for this test. Run an assessment first._')
    ).toBe(
      '<em>No results available for this test. Run an assessment first.</em>'
    )
  })

  it('leaves underscores inside a word alone', () => {
    // Licence SKUs are everywhere in these reports; eating their separators would be worse
    // than the leaked markup this parser exists to fix.
    expect(parse('Defender_for_Business_Servers')).toBe(
      'Defender_for_Business_Servers'
    )
    expect(parse('SPE_E5_USGOV_GCCHIGH')).toBe('SPE_E5_USGOV_GCCHIGH')
    expect(parse('snake_case_name and more_text_here')).toBe(
      'snake_case_name and more_text_here'
    )
  })

  it('handles emphasis and intraword underscores in the same line', () => {
    expect(parse('Defender_for_Business_Servers is _not_ assigned')).toBe(
      'Defender_for_Business_Servers is <em>not</em> assigned'
    )
  })

  it('reads both emphasis characters', () => {
    expect(parse('*italic*')).toBe('<em>italic</em>')
    expect(parse('_italic_')).toBe('<em>italic</em>')
    expect(parse('**bold**')).toBe('<strong>bold</strong>')
    expect(parse('__bold__')).toBe('<strong>bold</strong>')
    expect(parse('***both***')).toBe('<strongEm>both</strongEm>')
    expect(parse('___both___')).toBe('<strongEm>both</strongEm>')
    expect(parse('~~gone~~')).toBe('<strike>gone</strike>')
  })

  it('keeps surrounding text', () => {
    expect(parse('**Total Licensed Users:** 3')).toBe(
      '<strong>Total Licensed Users:</strong> 3'
    )
    expect(parse('a **b** c *d* e')).toBe('a <strong>b</strong> c <em>d</em> e')
  })

  it('nests emphasis', () => {
    expect(parse('**bold with _em_ inside**')).toBe(
      '<strong>bold with <em>em</em> inside</strong>'
    )
  })

  it('renders code spans literally', () => {
    expect(parse('run `Get-Mailbox -Identity a_b_c` now')).toBe(
      'run <code>Get-Mailbox -Identity a_b_c</code> now'
    )
  })

  it('keeps only the label of a link', () => {
    expect(parse('see [the docs](https://docs.cipp.app/x)')).toBe(
      'see the docs'
    )
  })

  it('treats unmatched and spaced delimiters as ordinary text', () => {
    expect(parse('5 * 3 * 2')).toBe('5 * 3 * 2')
    expect(parse('*unclosed')).toBe('*unclosed')
    expect(parse('a_b')).toBe('a_b')
    expect(parse('100% * done')).toBe('100% * done')
  })

  it('honours backslash escapes', () => {
    expect(parse('\\*not italic\\*')).toBe('*not italic*')
    expect(parse('a \\| b')).toBe('a | b')
  })

  it('handles empty and nullish input', () => {
    expect(parseInlineMarkdown('')).toEqual([])
    expect(parseInlineMarkdown(null)).toEqual([])
    expect(parseInlineMarkdown(undefined)).toEqual([])
  })
})

describe('inlineToPlainText', () => {
  it('strips markup down to readable text', () => {
    expect(inlineToPlainText('**bold** and _italic_')).toBe('bold and italic')
  })

  it('preserves a value that only looks like markup', () => {
    expect(inlineToPlainText('Defender_for_Business_Servers')).toBe(
      'Defender_for_Business_Servers'
    )
  })
})
