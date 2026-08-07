import React from 'react'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../test-utils'
import { ExecutiveReportButton } from '../../src/components/ExecutiveReportButton'

// report data only fetches with the preview open (waiting: previewOpen), mirror that
vi.mock('../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(({ waiting }) => ({
    data: undefined,
    isFetching: waiting === true,
    isSuccess: false,
    isError: false,
  })),
  ApiPostCall: vi.fn(() => ({ mutate: vi.fn(), isPending: false })),
  ApiGetCallWithPagination: vi.fn(() => ({ data: undefined, isFetching: false })),
}))

// jsdom can't run the real pdf renderer, passthrough stubs are enough for dialog assertions
vi.mock('@react-pdf/renderer', () => {
  const passthrough =
    (tag) =>
    ({ children }) =>
      React.createElement(tag, null, children)
  return {
    Document: passthrough('div'),
    Page: passthrough('div'),
    View: passthrough('div'),
    Text: passthrough('span'),
    Image: () => null,
    Svg: () => null,
    Path: () => null,
    Circle: () => null,
    Line: () => null,
    Rect: () => null,
    PDFViewer: passthrough('div'),
    PDFDownloadLink: passthrough('div'),
    StyleSheet: { create: (styles) => styles },
    // The kit registers its hyphenation and emoji behaviour globally on import, so the stub has to
    // carry every `Font.register*` it calls or importing a report throws.
    Font: {
      register: () => {},
      registerHyphenationCallback: () => {},
      registerEmojiSource: () => {},
    },
    pdf: () => ({ toBlob: () => Promise.resolve(new Blob()) }),
  }
})

describe('ExecutiveReportButton', () => {
  it('does not trigger the MUI disabled-tooltip warning when rendered disabled', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})

    renderWithProviders(<ExecutiveReportButton disabled />)

    const tooltipWarnings = warnSpy.mock.calls.filter((args) =>
      String(args[0]).includes('disabled `button` child'),
    )
    expect(tooltipWarnings).toEqual([])
    warnSpy.mockRestore()
  })

  it('renders the button enabled by default and shows its tooltip on hover', async () => {
    renderWithProviders(<ExecutiveReportButton />)

    const button = screen.getByRole('button', { name: /executive summary/i })
    expect(button).toBeEnabled()

    await userEvent.hover(button)
    expect(
      await screen.findByRole('tooltip', {
        name: 'Generate Executive Report with preview and configuration',
      }),
    ).toBeInTheDocument()
  })

  it('disables the button when the disabled prop is set', () => {
    renderWithProviders(<ExecutiveReportButton disabled />)

    expect(screen.getByRole('button', { name: /executive summary/i })).toBeDisabled()
  })

  it('opens the preview dialog on click', async () => {
    renderWithProviders(<ExecutiveReportButton />)

    await userEvent.click(screen.getByRole('button', { name: /executive summary/i }))

    expect(await screen.findByRole('dialog')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument()
  })

  it('renders the menuItem variant and opens the dialog from it', async () => {
    const onClick = vi.fn()
    renderWithProviders(<ExecutiveReportButton variant="menuItem" onClick={onClick} />)

    const item = screen.getByRole('menuitem', { name: /executive summary/i })
    await userEvent.click(item)

    expect(onClick).toHaveBeenCalled()
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })
})
