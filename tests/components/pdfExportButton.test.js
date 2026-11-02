import { createReportTheme } from '../../src/components/CippPdf/reportTheme'
import {
  detectJsPdfImageFormat,
  exportFooterText,
  fitLogoDimensions,
  toJsPdfLogo,
} from '../../src/components/pdfExportButton'

// The table export is jsPDF in the browser, while the branding gallery accepts every format the
// server-side report engine draws. These pin the bridge between the two: which logos pass straight
// through, which are redrawn, and which are dropped.
describe('pdfExportButton', () => {
  describe('toJsPdfLogo', () => {
    const rasterize = vi.fn(async () => 'data:image/png;base64,REDRAWN')

    beforeEach(() => {
      rasterize.mockClear()
    })

    it('passes a PNG or JPEG straight through without redrawing it', async () => {
      await expect(
        toJsPdfLogo('data:image/png;base64,AAAA', rasterize)
      ).resolves.toEqual({
        data: 'data:image/png;base64,AAAA',
        format: 'PNG',
      })
      await expect(
        toJsPdfLogo('data:image/jpeg;base64,AAAA', rasterize)
      ).resolves.toEqual({
        data: 'data:image/jpeg;base64,AAAA',
        format: 'JPEG',
      })
      expect(rasterize).not.toHaveBeenCalled()
    })

    it('redraws an SVG, GIF, BMP or WebP logo as a PNG', async () => {
      for (const type of ['svg+xml', 'gif', 'bmp', 'webp']) {
        const dataUrl = `data:image/${type};base64,AAAA`
        await expect(toJsPdfLogo(dataUrl, rasterize)).resolves.toEqual({
          data: 'data:image/png;base64,REDRAWN',
          format: 'PNG',
        })
        expect(rasterize).toHaveBeenLastCalledWith(dataUrl)
      }
    })

    it('drops a logo the browser cannot decode so the export still runs', async () => {
      const failing = vi.fn(async () => {
        throw new Error('undecodable')
      })
      await expect(
        toJsPdfLogo('data:image/tiff;base64,AAAA', failing)
      ).resolves.toBeNull()
    })

    it('ignores anything that is not an image data URL', async () => {
      await expect(toJsPdfLogo(null, rasterize)).resolves.toBeNull()
      await expect(
        toJsPdfLogo('https://contoso.com/logo.png', rasterize)
      ).resolves.toBeNull()
      expect(rasterize).not.toHaveBeenCalled()
    })
  })

  describe('detectJsPdfImageFormat', () => {
    it('names only the formats jsPDF embeds natively', () => {
      expect(detectJsPdfImageFormat('data:image/png;base64,AAAA')).toBe('PNG')
      expect(detectJsPdfImageFormat('data:image/jpg;base64,AAAA')).toBe('JPEG')
      expect(detectJsPdfImageFormat('data:image/webp;base64,AAAA')).toBeNull()
      expect(
        detectJsPdfImageFormat('data:image/svg+xml;base64,AAAA')
      ).toBeNull()
      expect(detectJsPdfImageFormat(undefined)).toBeNull()
    })
  })

  describe('fitLogoDimensions', () => {
    it('fits inside the box without upscaling a small logo', () => {
      expect(fitLogoDimensions(700, 180)).toEqual({ width: 140, height: 36 })
      expect(fitLogoDimensions(50, 20)).toEqual({ width: 50, height: 20 })
      expect(fitLogoDimensions(0, 20)).toBeNull()
    })
  })

  describe('exportFooterText', () => {
    const variables = { reportname: 'Users', reportdate: '1 September 2026' }

    it('resolves the report tokens and drops the ones only the server can resolve', () => {
      const theme = createReportTheme({
        footerText: '%tenantname% %reportname% exported %reportdate%',
      })
      expect(exportFooterText(theme, variables)).toBe(
        'Users exported 1 September 2026'
      )
    })

    it('is empty when the footer is switched off or has no text', () => {
      expect(
        exportFooterText(
          createReportTheme({ footerText: 'x', showFooter: false }),
          variables
        )
      ).toBe('')
      expect(exportFooterText(createReportTheme({}), variables)).toBe('')
    })
  })
})

// The whole export against real jsPDF in jsdom, reading the PDF it would have saved: the logo is
// embedded, the head is painted in the branding's table colour, the title and the footer are drawn.
const captured = vi.hoisted(() => ({ pdf: '' }))
vi.mock('jspdf', async (importOriginal) => {
  const actual = await importOriginal()
  const Real = actual.default
  // jsPDF's core methods live on each instance, so save is replaced per instance rather than
  // spied on the prototype.
  class Capturing extends Real {
    constructor(...args) {
      super(...args)
      this.save = () => {
        captured.pdf = this.output()
        return this
      }
    }
  }
  return { ...actual, default: Capturing, jsPDF: Capturing }
})

describe('exportRowsToPdf', () => {
  const PNG_1PX =
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

  it('brands the export with the logo, the table colour, the title and the footer', async () => {
    const { exportRowsToPdf } =
      await import('../../src/components/pdfExportButton')

    await exportRowsToPdf({
      rows: [{ displayName: 'Adele Vance', mail: 'adele@contoso.com' }],
      columns: [
        { id: 'displayName', header: 'Name' },
        { id: 'mail', header: 'Mail' },
      ],
      columnVisibility: { displayName: true, mail: true },
      reportName: 'Users',
      brandingSettings: {
        colour: '#0E4C92',
        logo: PNG_1PX,
        footerText: 'Confidential - %reportname%',
        roleColours: { tableColour: '#123456' },
      },
    })

    const pdf = captured.pdf
    expect(pdf.startsWith('%PDF-')).toBe(true)
    expect(pdf).toContain('/Subtype /Image')
    expect(pdf).toContain('(Users) Tj')
    expect(pdf).toContain('(Confidential - Users   -   Page 1 of 1) Tj')
    // #123456 as jsPDF writes a fill colour, the table role rather than the brand colour
    expect(pdf).toContain('0.07 0.2 0.34 rg')
  })
})
