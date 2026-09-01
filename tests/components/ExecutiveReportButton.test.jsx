import React from 'react'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MenuList } from '@mui/material'
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
    // MUI v9: MenuItem must live under a Menu/MenuList; the variant is built for
    // insertion into an action menu, so the test supplies that context.
    renderWithProviders(
      <MenuList>
        <ExecutiveReportButton variant="menuItem" onClick={onClick} />
      </MenuList>,
    )

    const item = screen.getByRole('menuitem', { name: /executive summary/i })
    await userEvent.click(item)

    expect(onClick).toHaveBeenCalled()
    expect(await screen.findByRole('dialog')).toBeInTheDocument()
  })

  // The 320px config rail would leave the preview about 70px wide on a phone, so below md it
  // moves into a drawer. Both homes render the same panel, and the toggles have to keep
  // working from the drawer.
  describe('section configuration on a phone', () => {
    const openSections = async () => {
      renderWithProviders(<ExecutiveReportButton />)
      await userEvent.click(screen.getByRole('button', { name: /executive summary/i }))
      await screen.findByRole('dialog')
      await userEvent.click(screen.getByRole('button', { name: 'Report sections' }))
      // jsdom applies no media queries, so the desktop rail is in the document too — every
      // query here has to be scoped to the drawer or it matches both copies.
      return within(document.querySelector('.MuiDrawer-paper'))
    }

    it('opens the sections panel in a drawer', async () => {
      const drawer = await openSections()

      expect(drawer.getByText('Report Sections')).toBeVisible()
      expect(drawer.getByText('Executive Summary')).toBeVisible()
      expect(drawer.getByText('Shadow AI Report')).toBeVisible()
    })

    it('toggles a section from inside the drawer', async () => {
      const drawer = await openSections()

      const deviceRow = drawer.getByText('Device Management').closest('.MuiPaper-root')
      const toggle = within(deviceRow).getByRole('switch')
      expect(toggle).toBeChecked()

      await userEvent.click(toggle)

      expect(toggle).not.toBeChecked()
      // the footer count is the shared state both panels read
      expect(screen.getByText(/Sections enabled: 6 of 9/)).toBeInTheDocument()
    })

    it('lifts the drawer above the dialog that opened it', async () => {
      await openSections()

      // A stock Drawer sits below a Dialog and would open behind the preview.
      const drawer = document.querySelector('.MuiDrawer-root')
      expect(drawer).not.toBeNull()
      expect(window.getComputedStyle(drawer).zIndex).toBe('1301')
    })
  })
})
