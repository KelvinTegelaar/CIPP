import React from 'react'
import { screen, waitFor } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'
import { CippCodeBlock } from '../../../src/components/CippComponents/CippCodeBlock'

vi.mock('@monaco-editor/react', () => ({
  Editor: ({ value, language }) => (
    <div data-testid="monaco-editor" data-language={language}>{value}</div>
  ),
}))

describe('CippCodeBlock', () => {
  it('renders code in syntax highlighter mode (default)', async () => {
    const { container } = renderWithProviders(
      <CippCodeBlock code="const x = 1;" language="javascript" />
    )
    // highlighter is next/dynamic-loaded, wait for the lazy chunk to resolve
    await waitFor(() => expect(container.querySelector('pre')).toBeInTheDocument())
    // SyntaxHighlighter splits tokens across spans, so check the pre/code element contains all text
    const codeEl = container.querySelector('pre')
    expect(codeEl.textContent).toContain('const')
    expect(codeEl.textContent).toContain('1')
  })

  it('renders code in editor mode (type="editor")', async () => {
    renderWithProviders(
      <CippCodeBlock code="const y = 2;" language="javascript" type="editor" />
    )
    const editor = await screen.findByTestId('monaco-editor')
    expect(editor).toBeInTheDocument()
    // language prop is forwarded to monaco
    expect(editor).toHaveAttribute('data-language', 'javascript')
  })

  it('renders line numbers in syntax mode when showLineNumbers is set', async () => {
    const { container } = renderWithProviders(
      <CippCodeBlock code={'const a = 1;\nconst b = 2;'} language="javascript" showLineNumbers />
    )
    await waitFor(() => expect(container.querySelector('pre')).toBeInTheDocument())
    // react-syntax-highlighter tags each line number span with .linenumber
    expect(container.querySelectorAll('.linenumber').length).toBeGreaterThanOrEqual(2)
  })

  it('omits line numbers in syntax mode by default', async () => {
    const { container } = renderWithProviders(
      <CippCodeBlock code={'const a = 1;\nconst b = 2;'} language="javascript" />
    )
    await waitFor(() => expect(container.querySelector('pre')).toBeInTheDocument())
    expect(container.querySelector('.linenumber')).not.toBeInTheDocument()
  })

  it('renders copy button', () => {
    renderWithProviders(
      <CippCodeBlock code="const z = 3;" language="javascript" />
    )
    expect(screen.getByRole('button')).toBeInTheDocument()
  })
})
