import React from 'react'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { screen } from '@testing-library/react'
import { renderWithProviders } from '../../test-utils'

// jsdom has no width-based matchMedia, so the mobile branch is driven by mocking the hook
const layoutState = vi.hoisted(() => ({ isMobile: false }))
vi.mock('../../../src/hooks/use-breakpoint', () => ({
  useIsMobileLayout: () => layoutState.isMobile,
  useIsTabletLayout: () => false,
  useTableViewMode: () => 'table',
}))

// Building a real PDF in jsdom is neither possible nor the point: what is under test is which
// branch renders and what it hands the user. Stable identities — a fresh object per call
// re-renders forever.
const pdfState = vi.hoisted(() => ({
  instance: { loading: false, error: null, url: 'blob:http://localhost/report-1', blob: { size: 1_572_864 } },
  viewerProps: null,
}))
vi.mock('@react-pdf/renderer', () => ({
  PDFViewer: (props) => {
    pdfState.viewerProps = props
    return <div data-testid="pdf-viewer">{props.children}</div>
  },
  usePDF: () => [pdfState.instance],
}))

import { CippPdfPreview } from '../../../src/components/CippPdf/CippPdfPreview'

const doc = <div data-testid="report-doc">document</div>

const render = (props = {}) =>
  renderWithProviders(
    <CippPdfPreview title="Executive Report - Contoso" fileName="Executive_Report.pdf" {...props}>
      {doc}
    </CippPdfPreview>
  )

describe('CippPdfPreview', () => {
  beforeEach(() => {
    layoutState.isMobile = false
    pdfState.viewerProps = null
    pdfState.instance = {
      loading: false,
      error: null,
      url: 'blob:http://localhost/report-1',
      blob: { size: 1_572_864 },
    }
  })

  it('renders the embedded viewer on desktop', () => {
    render()
    expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument()
    expect(screen.getByTestId('report-doc')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /open report/i })).not.toBeInTheDocument()
  })

  // title/fileName/viewerKey are ours, not react-pdf's — forwarding them would land unknown
  // attributes on the iframe and warn.
  it('does not leak its own props onto the desktop viewer', () => {
    render({ style: { border: 'none' }, showToolbar: true, showDownload: true })
    expect(pdfState.viewerProps).not.toHaveProperty('title')
    expect(pdfState.viewerProps).not.toHaveProperty('fileName')
    expect(pdfState.viewerProps).not.toHaveProperty('viewerKey')
    expect(pdfState.viewerProps).not.toHaveProperty('showDownload')
    expect(pdfState.viewerProps.showToolbar).toBe(true)
  })

  // iOS renders a PDF in an iframe as a fixed first-page preview that cannot be scrolled, so
  // below md the document goes to the platform viewer instead of being embedded.
  it('hands off to the platform viewer on mobile instead of embedding', () => {
    layoutState.isMobile = true
    render()

    expect(screen.queryByTestId('pdf-viewer')).not.toBeInTheDocument()

    const open = screen.getByRole('link', { name: /open report/i })
    expect(open).toHaveAttribute('href', 'blob:http://localhost/report-1')
    expect(open).toHaveAttribute('target', '_blank')
    // a real anchor, not window.open in a handler — that is what popup blockers stop
    expect(open.tagName).toBe('A')
  })

  // Six of the eight hosts already put a Download in their dialog actions; showing one here
  // as well is exactly the duplicate that appeared on a phone.
  it('offers no download of its own by default', () => {
    layoutState.isMobile = true
    render()

    expect(screen.queryByRole('link', { name: /download/i })).not.toBeInTheDocument()
  })

  it('offers a download named after the report where the host has none', () => {
    layoutState.isMobile = true
    render({ showDownload: true })

    const download = screen.getByRole('link', { name: /download/i })
    expect(download).toHaveAttribute('download', 'Executive_Report.pdf')
    expect(download).toHaveAttribute('href', 'blob:http://localhost/report-1')
  })

  it('names the report and its size', () => {
    layoutState.isMobile = true
    render()

    expect(screen.getByText('Executive Report - Contoso')).toBeInTheDocument()
    expect(screen.getByText(/1\.5 MB/)).toBeInTheDocument()
  })

  it('shows progress while the document is still building', () => {
    layoutState.isMobile = true
    pdfState.instance = { loading: true, error: null, url: null, blob: null }
    render()

    expect(screen.getByRole('progressbar')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /open report/i })).not.toBeInTheDocument()
  })

  it('surfaces a generation failure rather than an empty frame', () => {
    layoutState.isMobile = true
    pdfState.instance = { loading: false, error: 'boom', url: null, blob: null }
    render()

    expect(screen.getByText(/could not be generated/i)).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: /open report/i })).not.toBeInTheDocument()
  })
})
