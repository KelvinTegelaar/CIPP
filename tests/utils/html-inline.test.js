import {
  decodeHtmlEntities,
  htmlToPlainText,
  parseInlineHtml,
} from '../../src/utils/html-inline'

// Compact rendering of the node tree: 'plain <strong>bold</strong>'
const show = (nodes) =>
  nodes
    .map((node) =>
      node.type === 'text'
        ? node.value
        : `<${node.type}>${show(node.children)}</${node.type}>`
    )
    .join('')

const parse = (html) => show(parseInlineHtml(html))

describe('parseInlineHtml', () => {
  it('keeps the marks the editor can produce', () => {
    expect(parse('plain <strong>bold</strong>')).toBe(
      'plain <strong>bold</strong>'
    )
    expect(parse('<em>italic</em>')).toBe('<em>italic</em>')
    expect(parse('<s>struck</s>')).toBe('<strike>struck</strike>')
    expect(parse('<code>x</code>')).toBe('<code>x</code>')
  })

  it('accepts the legacy tag spellings pasted content brings', () => {
    expect(parse('<b>bold</b> <i>italic</i> <u>under</u>')).toBe(
      '<strong>bold</strong> <em>italic</em> <underline>under</underline>'
    )
    expect(parse('<del>a</del><strike>b</strike>')).toBe(
      '<strike>a</strike><strike>b</strike>'
    )
  })

  it('preserves nesting so bold italic stays both', () => {
    expect(parse('<strong><em>both</em></strong>')).toBe(
      '<strong><em>both</em></strong>'
    )
    expect(parse('<em><strong>both</strong></em>')).toBe(
      '<em><strong>both</strong></em>'
    )
  })

  it('is transparent to tags it does not style', () => {
    // The block splitter leaves wrappers like this behind; they must not reach the page.
    expect(parse('<ul><li>item</li></ul>')).toBe('item')
    expect(parse('<span class="x">text</span>')).toBe('text')
    expect(parse('<a href="https://x.test">label</a>')).toBe('label')
  })

  it('turns a line break into a newline', () => {
    expect(parse('a<br>b')).toBe('a\nb')
    expect(parse('a<br />b')).toBe('a\nb')
  })

  it('decodes entities', () => {
    expect(parse('&amp; &lt; &gt; &quot;')).toBe('& < > "')
    expect(parse('&mdash; &#8212; &#x2014;')).toBe('— — —')
    expect(parse('&unknownent;')).toBe('&unknownent;')
  })

  it('leaves value text alone', () => {
    expect(parse('Defender_for_Business_Servers')).toBe(
      'Defender_for_Business_Servers'
    )
    // HTML is not Markdown: asterisks here are literal.
    expect(parse('5 * 3 and _snake_case_')).toBe('5 * 3 and _snake_case_')
  })

  it('survives malformed markup', () => {
    expect(parse('<strong>unclosed')).toBe('<strong>unclosed</strong>')
    expect(parse('stray </strong> close')).toBe('stray  close')
    expect(parse('<strong>a<em>b</strong>c</em>')).toBe(
      '<strong>a<em>b</em></strong>c'
    )
  })

  it('drops script and style content entirely', () => {
    expect(parse('before<script>alert(1)</script>after')).toBe('beforeafter')
    expect(parse('a<style>.x{color:red}</style>b')).toBe('ab')
  })

  it('handles empty and nullish input', () => {
    expect(parseInlineHtml('')).toEqual([])
    expect(parseInlineHtml(null)).toEqual([])
    expect(parseInlineHtml(undefined)).toEqual([])
  })
})

describe('htmlToPlainText', () => {
  it('flattens markup to readable text', () => {
    expect(htmlToPlainText('<p>a <strong>b</strong> c</p>')).toBe('a b c')
  })

  it('reports an empty paragraph as empty', () => {
    // htmlToElements uses this to decide whether a block is worth rendering.
    expect(htmlToPlainText('<p></p>').trim()).toBe('')
    expect(htmlToPlainText('<p><br></p>').trim()).toBe('')
  })
})

describe('decodeHtmlEntities', () => {
  it('handles named, decimal and hex forms', () => {
    expect(decodeHtmlEntities('&nbsp;')).toBe(' ')
    expect(decodeHtmlEntities('&#39;')).toBe("'")
    expect(decodeHtmlEntities('&#x27;')).toBe("'")
  })

  it('leaves a bare ampersand alone', () => {
    expect(decodeHtmlEntities('Tom & Jerry')).toBe('Tom & Jerry')
  })
})
