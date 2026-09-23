import { useState } from 'react'
import { ApiPostCall } from '../../api/ApiCall'
import { useBrandingSettings } from '../CippPdf/useBrandingSettings'
import { useReportVariables } from '../CippPdf/useReportVariables'
import { BECRemediationReportDocument } from '../BECRemediationReportButton'

const blobToBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(String(reader.result).split(',')[1] || '')
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })

const base64ToBlob = (base64, type) => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new Blob([bytes], { type })
}

const safe = (value) =>
  String(value || 'case')
    .replace(/[^a-zA-Z0-9._-]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80)

const caseOf = (row) => row?.CaseId ?? row?.caseId
const tenantOf = (row) => row?.Tenant ?? row?.tenantFilter
const upnOf = (row) => row?.UserPrincipalName ?? row?.userPrincipalName

/**
 * Downloads a case's evidence package WITH the report PDFs: fetches the case results when the caller
 * has none, renders the full report and the C-suite summary in-memory (no browser tab), posts them to
 * the export endpoint (which collates the ZIP), and saves the ZIP under a name carrying the user and
 * case. One hook serves the runs hub (per row) and the case page's export button.
 */
export const useBecEvidenceDownload = () => {
  const brandingSettings = useBrandingSettings()
  const variables = useReportVariables()
  const [pendingCaseId, setPendingCaseId] = useState(null)
  const [lastError, setLastError] = useState(null)
  const exportCall = ApiPostCall({})

  const download = async (row, providedBecData) => {
    const caseId = caseOf(row)
    const tenantFilter = tenantOf(row)
    if (!caseId || !tenantFilter || pendingCaseId) return
    setPendingCaseId(caseId)
    setLastError(null)
    try {
      let becData = providedBecData
      if (!becData) {
        const response = await fetch(
          `/api/execBECCheck?GUID=${encodeURIComponent(caseId)}&tenantFilter=${encodeURIComponent(tenantFilter)}`
        )
        if (!response.ok) throw new Error('Could not load the case results')
        becData = await response.json()
      }
      if (becData?.Waiting || becData?.Error) {
        throw new Error('The case is not a completed run')
      }
      const userData = {
        id: row?.UserId ?? row?.userId,
        userPrincipalName: upnOf(row),
        displayName: row?.DisplayName ?? row?.displayName ?? upnOf(row),
      }

      let pdfBase64 = ''
      let pdfSummaryBase64 = ''
      try {
        const { pdf } = await import('@react-pdf/renderer')
        const render = async (reportVariant) => {
          const blob = await pdf(
            <BECRemediationReportDocument
              userData={userData}
              becData={becData}
              brandingSettings={brandingSettings}
              tenantName={tenantFilter}
              variables={variables}
              variant={reportVariant}
            />
          ).toBlob()
          return blobToBase64(blob)
        }
        pdfBase64 = await render('full')
        pdfSummaryBase64 = await render('summary')
      } catch (renderError) {
        console.error(
          'BEC evidence: PDF render failed, exporting without it',
          renderError
        )
      }

      await new Promise((resolve) => {
        exportCall.mutate(
          {
            url: '/api/ExecBECEvidenceExport',
            data: { tenantFilter, caseId, pdfBase64, pdfSummaryBase64 },
          },
          {
            onSuccess: (result) => {
              const evidence = result?.data?.Evidence
              if (evidence?.ZipBase64) {
                const url = URL.createObjectURL(
                  base64ToBlob(evidence.ZipBase64, 'application/zip')
                )
                const link = document.createElement('a')
                link.href = url
                link.download = `BEC_Evidence_${safe(upnOf(row) || userData.id)}_${safe(caseId)}.zip`
                document.body.appendChild(link)
                link.click()
                document.body.removeChild(link)
                URL.revokeObjectURL(url)
              }
              resolve()
            },
            onError: (error) => {
              setLastError(
                error?.response?.data?.Results ||
                  'the export failed; see the logbook'
              )
              resolve()
            },
          }
        )
      })
    } catch (error) {
      console.error(
        'BEC evidence download failed:',
        String(error?.message ?? '').replace(/[\r\n]+/g, ' ')
      )
      setLastError(error?.message || 'the export failed; see the logbook')
    } finally {
      setPendingCaseId(null)
    }
  }

  return { download, busy: pendingCaseId != null, lastError }
}
