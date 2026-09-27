import { useState } from 'react'
import { ApiPostCall } from '../../api/ApiCall'

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
 * Downloads a case's evidence package. The export endpoint (ExecBECEvidenceExport) renders the report
 * PDFs (the full report and the C-suite summary) server-side and collates the ZIP; the browser just
 * requests it by case id and saves it. One hook serves the runs hub (per row) and the case page's
 * export button.
 */
export const useBecEvidenceDownload = () => {
  const [pendingCaseId, setPendingCaseId] = useState(null)
  const [lastError, setLastError] = useState(null)
  const exportCall = ApiPostCall({})

  const download = async (row) => {
    const caseId = caseOf(row)
    const tenantFilter = tenantOf(row)
    if (!caseId || !tenantFilter || pendingCaseId) return
    setPendingCaseId(caseId)
    setLastError(null)
    try {
      await new Promise((resolve) => {
        exportCall.mutate(
          {
            url: '/api/ExecBECEvidenceExport',
            data: { tenantFilter, caseId },
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
                link.download = `BEC_Evidence_${safe(upnOf(row) || row?.UserId || caseId)}_${safe(caseId)}.zip`
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
