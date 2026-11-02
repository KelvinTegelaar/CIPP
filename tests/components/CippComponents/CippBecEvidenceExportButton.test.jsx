import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '../../test-utils'
import { CippBecEvidenceExportButton } from '../../../src/components/CippComponents/CippBecEvidenceExportButton'
import { ApiPostCall } from '../../../src/api/ApiCall'

vi.mock('../../../src/api/ApiCall', () => ({
  ApiGetCall: vi.fn(),
  ApiPostCall: vi.fn(),
  ApiGetCallWithPagination: vi.fn(),
}))

describe('CippBecEvidenceExportButton', () => {
  let mutate
  beforeEach(() => {
    // the single POST returns the freshly built ZIP (base64); the backend renders the report PDFs
    // server-side and collates the package - nothing is stored, and no PDF is sent from the browser
    mutate = vi.fn((payload, options) =>
      options?.onSuccess?.({
        data: {
          Evidence: {
            ZipSha256: 'abc123',
            ZipBase64: btoa('PK fake zip bytes'),
          },
        },
      })
    )
    ApiPostCall.mockReturnValue({ mutate, isPending: false })
    global.URL.createObjectURL = vi.fn(() => 'blob:zip')
    global.URL.revokeObjectURL = vi.fn()
  })

  it('posts the case id and downloads the ZIP the backend returns', async () => {
    renderWithProviders(
      <CippBecEvidenceExportButton
        tenantFilter="contoso.com"
        caseId="BEC-20260820120000-ab12cd"
        userData={{ id: 'u1', userPrincipalName: 'victim@contoso.com' }}
      />
    )
    const clickSpy = vi
      .spyOn(HTMLAnchorElement.prototype, 'click')
      .mockImplementation(() => {})
    await userEvent.click(
      screen.getByRole('button', { name: /export evidence/i })
    )
    await waitFor(() => expect(mutate).toHaveBeenCalledTimes(1))
    const [payload] = mutate.mock.calls[0]
    expect(payload.url).toBe('/api/ExecBECEvidenceExport')
    expect(payload.data.tenantFilter).toBe('contoso.com')
    expect(payload.data.caseId).toBe('BEC-20260820120000-ab12cd')
    // no client-rendered PDF is sent; the backend renders both report PDFs server-side
    expect(payload.data.pdfBase64).toBeUndefined()
    // the ZIP from the response is handed straight to the browser - no second request
    await waitFor(() => expect(clickSpy).toHaveBeenCalled())
    expect(global.URL.createObjectURL).toHaveBeenCalledTimes(1)
    clickSpy.mockRestore()
  }, 30000)

  it('is disabled without a case id', () => {
    renderWithProviders(
      <CippBecEvidenceExportButton
        tenantFilter="contoso.com"
        caseId={null}
        userData={{ id: 'u1' }}
      />
    )
    expect(
      screen.getByRole('button', { name: /export evidence/i })
    ).toBeDisabled()
  })
})
