import { Alert, AlertTitle } from '@mui/material'
import { useWatch } from 'react-hook-form'
import { ApiGetCall } from '../../api/ApiCall'
import { useSettings } from '../../hooks/use-settings.js'

// Unlicensed shared mailboxes and their archives are capped at 50 GiB; warn at 49 GiB.
const SHARED_MAILBOX_WARN_BYTES = 49 * 1024 ** 3
const toGB = (bytes) => (Number(bytes) / 1024 ** 3).toFixed(1)

// Why a cached mailbox row still needs a license once converted to shared; empty when it doesn't.
export const getSharedMailboxLicenseReasons = (mb) => {
  const reasons = []
  const bytes = Number(mb?.storageUsedInBytes)
  if (Number.isFinite(bytes) && bytes >= SHARED_MAILBOX_WARN_BYTES) {
    reasons.push(`${toGB(bytes)} GB mailbox`)
  }
  const archiveBytes = Number(mb?.ArchiveSize)
  if (mb?.ArchiveEnabled === true && archiveBytes >= SHARED_MAILBOX_WARN_BYTES) {
    reasons.push(`${toGB(archiveBytes)} GB archive`)
  }
  if (mb?.LitigationHoldEnabled === true) {
    reasons.push('litigation hold')
  }
  return reasons
}

// Cached mailbox rows for a tenant, shared by every shared-mailbox license check.
export const useSharedMailboxLicenseData = (tenant, enabled) =>
  ApiGetCall({
    url: '/api/ListMailboxes',
    data: { tenantFilter: tenant, UseReportDB: true },
    queryKey: `SharedMailboxLicenseCheck-${tenant}`,
    waiting: !!enabled && !!tenant,
  })

// Rendered as a field component in the Convert Mailbox dialog; shows once Shared is picked.
export const CippSharedMailboxLicenseAlert = ({ formControl, row }) => {
  const tenantFilter = useSettings().currentTenant
  const rowData = Array.isArray(row) ? row[0] : row
  const tenant = tenantFilter === 'AllTenants' && rowData?.Tenant ? rowData.Tenant : tenantFilter
  const upn = (rowData?.userPrincipalName ?? rowData?.UPN)?.toString().toLowerCase()
  const isShared = useWatch({ control: formControl.control, name: 'MailboxType' }) === 'Shared'
  const mailboxes = useSharedMailboxLicenseData(tenant, isShared && !!upn)

  if (!isShared || !Array.isArray(mailboxes.data)) return null
  const mailbox = mailboxes.data.find((mb) => mb?.UPN?.toString().toLowerCase() === upn)
  const reasons = getSharedMailboxLicenseReasons(mailbox)
  if (!reasons.length) return null

  return (
    <Alert severity="warning" sx={{ mt: 2 }}>
      <AlertTitle>Keep a license on this mailbox</AlertTitle>
      This mailbox has {reasons.join('; ')}. A shared mailbox needs a license if its mailbox or
      archive is over 50 GB, or it is on litigation hold. Unless a license is kept, converting may
      fail or the mailbox may stop receiving mail.
    </Alert>
  )
}
