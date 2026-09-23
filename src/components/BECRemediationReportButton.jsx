import { useState } from 'react'
import { CippIcons } from '../utils/icon-registry'
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { CippPdfPreview } from './CippPdf/CippPdfPreview'
import { useReportVariables } from './CippPdf/useReportVariables'
import { useBrandingSettings } from './CippPdf/useBrandingSettings'
import {
  AlertBox,
  Bold,
  Bullet,
  BulletList,
  ClearBox,
  ContentPage,
  CoverMeta,
  DataTable,
  InfoBox,
  Note,
  Paragraph,
  ProgressList,
  ReportDocument,
  Section,
  StatRow,
} from './CippPdf'
import {
  BEC_GROUPS,
  becGroupFlagged,
  becWindowStart,
} from '../utils/bec-objectives'
import {
  BEC_OBJECTIVE_COLOR,
  BEC_OBJECTIVE_LABEL,
  buildBecTimeline,
} from '../utils/bec-timeline'

// BEC Remediation PDF Document Component
// Exported so the branding preview can render this report against sample data, and so tests can
// render it to a real PDF.
export const BECRemediationReportDocument = ({
  userData,
  becData,
  brandingSettings,
  tenantName,
  variables,
  // 'full' (default) = every page; 'summary' = the executive pages only, for a C-suite reader.
  variant = 'full',
}) => {
  const isSummary = variant === 'summary'
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Helper function to format dates
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateString
    }
  }

  const formatSafelistValue = (value) => {
    if (!value) return 'unchanged'
    return Array.isArray(value)
      ? value.join(', ') || 'unchanged'
      : String(value)
  }

  // Calculate statistics
  const stats = {
    newRules: becData?.NewRules?.length || 0,
    ruleChanges: becData?.InboxRuleChanges?.length || 0,
    newUsers: becData?.NewUsers?.length || 0,
    newApps: becData?.AddedApps?.length || 0,
    permissionChanges: becData?.MailboxPermissionChanges?.length || 0,
    permissionChangesTargetingUser: (
      becData?.MailboxPermissionChanges || []
    ).filter((change) => change?.TargetsSuspect === true).length,
    mfaDevices: becData?.MFADevices?.length || 0,
    passwordChanges: becData?.ChangedPasswords?.length || 0,
    sentMessages: becData?.SentMessages?.length || 0,
    trustedSenders: becData?.TrustedSenders?.length || 0,
    blockedSenders: becData?.BlockedSenders?.length || 0,
    safelistChanges: becData?.SafelistChanges?.length || 0,
    sharingChanges: becData?.SharingChanges?.length || 0,
    anonymousLinks: (becData?.SharingChanges || []).filter((c) =>
      c?.Operation?.startsWith('AnonymousLink')
    ).length,
    intuneDevices: becData?.IntuneDevices?.length || 0,
    signIns: becData?.SuspectUserSignIns?.length || 0,
    sentTotalMessages: becData?.SentMessageAnalysis?.TotalMessages ?? 0,
    sentTotalRecipients: becData?.SentMessageAnalysis?.TotalRecipients ?? 0,
    repeatedSubjects: becData?.SentMessageAnalysis?.FlaggedSubjectCount || 0,
    sendBursts: becData?.SentMessageAnalysis?.Bursts?.length || 0,
    massMailFlagged: becData?.SentMessageAnalysis?.Flagged === true,
    maliciousApps:
      (becData?.AddedApps || []).filter((app) => app?.MaliciousMatch).length +
      (becData?.MaliciousSPs?.length || 0),
  }

  const locationAnalysis = becData?.LocationAnalysis
  stats.foreignSignIns = locationAnalysis?.ForeignSignInCount || 0
  stats.foreignSuccessfulSignIns =
    locationAnalysis?.ForeignSuccessfulSignInCount || 0
  stats.foreignSentMessages = locationAnalysis?.ForeignSentMessageCount || 0
  stats.foreignActivity =
    (locationAnalysis?.ForeignRuleChangeCount || 0) +
    (locationAnalysis?.ForeignSafelistChangeCount || 0) +
    (locationAnalysis?.ForeignSharingChangeCount || 0) +
    (locationAnalysis?.ForeignSentMessageCount || 0)

  const analysisWindowStart = becWindowStart(
    becData,
    becData?.AnalysisWindowDays || 7
  )

  const recentIntuneDevices = (becData?.IntuneDevices || []).filter(
    (device) => {
      if (!device?.enrolledDateTime) return false
      const enrolled = new Date(device.enrolledDateTime)
      if (Number.isNaN(enrolled.getTime())) return false
      return enrolled >= analysisWindowStart
    }
  )
  stats.recentIntuneDevices = recentIntuneDevices.length

  const isRecentMfaDevice = (method) => {
    if (!method?.createdDateTime) return false
    const created = new Date(method.createdDateTime)
    if (Number.isNaN(created.getTime())) return false
    return created >= analysisWindowStart
  }
  stats.recentMfaDevices = (becData?.MFADevices || []).filter(
    isRecentMfaDevice
  ).length

  // successful foreign sign-ins first - they prove access, failed ones are mostly spray noise
  const foreignSignIns = (becData?.SuspectUserSignIns || [])
    .filter((signIn) => signIn?.ForeignLocation === true)
    .sort((a, b) => (b?.Status === 'Success') - (a?.Status === 'Success'))

  const sortedIntuneDevices = [...(becData?.IntuneDevices || [])].sort(
    (a, b) => {
      const aTime = a?.enrolledDateTime
        ? new Date(a.enrolledDateTime).getTime()
        : 0
      const bTime = b?.enrolledDateTime
        ? new Date(b.enrolledDateTime).getTime()
        : 0
      return bTime - aTime
    }
  )

  // The threat level is computed server-side (Get-CIPPBecScore) and stored on the run.
  const threatLevel = {
    level: becData?.Score?.Level || 'Low',
    value: becData?.Score?.Value ?? 0,
    color:
      becData?.Score?.Level === 'High'
        ? '#742A2A'
        : becData?.Score?.Level === 'Medium'
          ? '#744210'
          : '#22543D',
  }
  const appliedSignals = (becData?.Score?.Breakdown || []).filter(
    (signal) => signal.Applied
  )
  const completenessEntries = Object.entries(becData?.Completeness || {})
  // A check that could not run for lack of a licence/permission/mailbox is "skipped" (not applicable),
  // reported apart from a check that failed or was capped - a skipped check is never a clean pass.
  const skippedCollectors = completenessEntries.filter(
    ([, marker]) => marker && marker.Skipped
  )
  const incompleteCollectors = completenessEntries.filter(
    ([, marker]) => marker && marker.Complete === false && !marker.Skipped
  )
  const windowDays = becData?.AnalysisWindowDays || 7
  const flaggedDelegations = (becData?.Delegations || []).filter(
    (d) => d.Flagged
  )
  const flaggedGrants = (becData?.UserGrants || []).filter((g) => g.Flagged)
  const flaggedTransportChanges = (becData?.TransportRuleChanges || []).filter(
    (c) => c.Flagged
  )
  const flaggedTransportRules = becData?.TransportRulesFlagged || []
  const flaggedAddIns = (becData?.MailboxAddIns || []).filter((a) => a.Flagged)
  const receivedFindings = becData?.ReceivedMailFindings || []
  const deliveredThreats = (becData?.DefenderDetections || []).filter(
    (d) => d.Delivered
  )
  const flaggedAudits = (becData?.DirectoryAudits || []).filter(
    (a) => a.Flagged
  )
  const recentRegisteredDevices = (becData?.RegisteredDevices || []).filter(
    (d) => d.RegisteredInWindow
  )
  const foreignNonInteractive = (becData?.NonInteractiveSignIns || []).filter(
    (s) => s.ForeignLocation === true && s.Status === 'Success'
  )
  const mailActivitySummary = becData?.MailActivitySummary
  const riskState = becData?.RiskState

  // The attacker's addresses and what was done from them. Only an address judged the attacker's
  // (Compromised or LikelyAttacker) counts toward a statement; a Suspicious one is listed in the
  // detail for review, never asserted. The item lists are capped - the evidence export has them all.
  const isAttackerVerdict = (verdict) =>
    verdict === 'Compromised' || verdict === 'LikelyAttacker'
  const listNames = (names, max = 3) =>
    names.slice(0, max).join(', ') +
    (names.length > max ? ` and ${names.length - max} more` : '')
  const ipVerdicts = becData?.IPVerdicts || []
  const attackerIps = ipVerdicts.filter((v) => isAttackerVerdict(v.Verdict))
  const reviewIps = ipVerdicts.filter(
    (v) => isAttackerVerdict(v.Verdict) || v.Verdict === 'Suspicious'
  )
  const attackerCountries = [
    ...new Set(attackerIps.map((v) => v.Country).filter(Boolean)),
  ]
  const attackerMail = (becData?.AttackerMailActivity || []).filter((row) =>
    isAttackerVerdict(row.IPVerdict)
  )
  const attackerFiles = (becData?.AttackerFileActivity || []).filter((row) =>
    isAttackerVerdict(row.IPVerdict)
  )
  const attackerForms = (becData?.FormsActivity || []).filter(
    (row) => row.Flagged && isAttackerVerdict(row.IPVerdict)
  )
  const attackerFormIds = [
    ...new Set(attackerForms.map((row) => row.FormId).filter(Boolean)),
  ]
  const attackerFormNames = [
    ...new Set(attackerForms.map((row) => row.FormName).filter(Boolean)),
  ]
  const formsReach = (becData?.FormsSummary?.Forms || []).filter((form) =>
    attackerFormIds.includes(form.FormId)
  )
  const formResponses = formsReach.reduce(
    (sum, form) => sum + (form.Responses || 0),
    0
  )
  const blastRadius = becData?.BlastRadius || []
  const reachedAccounts = blastRadius.filter((row) => row.Reached)
  const delegatedReached = (becData?.DelegatedAccess || []).filter(
    (row) => row.Flagged
  )
  const attackerTotals = {
    opened: new Set(
      attackerMail
        .filter(
          (row) =>
            row.Operation === 'MailItemsAccessed' && row.InternetMessageId
        )
        .map((row) => row.InternetMessageId)
    ).size,
    synced: new Set(
      attackerMail
        .filter(
          (row) =>
            row.Operation === 'MailItemsAccessed' && row.AccessType === 'Sync'
        )
        .map((row) => `${row.MailboxOwner}|${row.Folder}`)
    ).size,
    sent: attackerMail.filter((row) =>
      ['Send', 'SendAs', 'SendOnBehalf'].includes(row.Operation)
    ).length,
    deleted: attackerMail.filter((row) =>
      ['SoftDelete', 'HardDelete', 'MoveToDeletedItems'].includes(row.Operation)
    ).length,
    files: new Set(
      attackerFiles.map((row) => row.Url || row.File).filter(Boolean)
    ).size,
    downloaded: attackerFiles.filter((row) =>
      ['FileDownloaded', 'FileSyncDownloadedFull'].includes(row.Operation)
    ).length,
  }
  // plain-English counts for the statements a non-technical reader sees
  const count = (n, one, many = `${one}s`) => `${n} ${n === 1 ? one : many}`
  const attackerDid = [
    attackerTotals.opened > 0 &&
      `opened ${count(attackerTotals.opened, 'email')}`,
    attackerTotals.synced > 0 &&
      `copied ${count(attackerTotals.synced, 'mail folder')} to a desktop client`,
    attackerTotals.sent > 0 && `sent ${count(attackerTotals.sent, 'email')}`,
    attackerTotals.deleted > 0 &&
      `deleted ${count(attackerTotals.deleted, 'email')}`,
    attackerTotals.files > 0 &&
      `opened ${count(attackerTotals.files, 'file')}${
        attackerTotals.downloaded
          ? ` (${count(attackerTotals.downloaded, 'download')})`
          : ''
      }`,
  ].filter(Boolean)
  const attackerReach = [
    reachedAccounts.length > 0 &&
      `${count(reachedAccounts.length, 'other account')} signed into or used from the same addresses (${listNames(reachedAccounts.map((row) => row.UserPrincipalName))})`,
    delegatedReached.length > 0 &&
      `${count(delegatedReached.length, 'other mailbox', 'other mailboxes')} reached through this account's access (${listNames(delegatedReached.map((row) => row.Mailbox))})`,
    attackerFormIds.length > 0 &&
      `${count(attackerFormIds.length, 'Microsoft Form')} created from those addresses (a common phishing lure)${formResponses ? `, with ${count(formResponses, 'response')}` : ''}`,
  ].filter(Boolean)
  // the three strongest reasons behind a verdict, or the list/investigator that decided it
  const verdictWhy = (v) =>
    v.Source && v.Source !== 'Heuristics'
      ? v.Source
      : (v.Reasons || [])
          .filter((reason) => reason.Weight > 0)
          .sort((a, b) => b.Weight - a.Weight)
          .slice(0, 3)
          .map((reason) => reason.Text)
          .join('; ')

  // ============================================================================================
  // Executive intelligence. A results roll-up, a findings-by-objective breakdown, evidence-driven
  // priority actions and a chronological timeline — all derived from the same becData the detailed
  // check pages render. These lead the report so a reader who stops after the first pages still has
  // the verdict, the shape of what was found, and what to do about it, before any deep detail.
  // ============================================================================================
  const forwardingAddress =
    becData?.MailboxState?.ForwardingSmtpAddress ||
    becData?.MailboxState?.ForwardingAddress ||
    null
  const hasForwarding = !!(
    becData?.MailboxState?.HasForwarding || forwardingAddress
  )

  // Every check as one row — flagged (with a high-risk sub-count) or clear — so the summary page
  // carries the whole result set at a glance, not only the four headline stats.
  const summaryData = [
    {
      area: 'Attacker network addresses',
      count: attackerIps.length,
      danger: attackerIps.filter(
        (v) => v.SuccessfulSignIns > 0 || v.Activities > 0
      ).length,
    },
    {
      area: 'Mail, files & forms touched by the attacker',
      count: attackerMail.length + attackerFiles.length + attackerForms.length,
      danger: attackerFormIds.length,
    },
    {
      area: 'Other accounts & mailboxes reached',
      count: blastRadius.length + delegatedReached.length,
      danger: reachedAccounts.length,
    },
    {
      area: 'Inbox rules & changes',
      count: stats.newRules + stats.ruleChanges,
    },
    { area: 'Mailbox delegations', count: flaggedDelegations.length },
    {
      area: 'Application consents',
      count: flaggedGrants.length,
      danger: flaggedGrants.length,
    },
    {
      area: 'New / rogue applications',
      count: stats.newApps,
      danger: stats.maliciousApps,
    },
    { area: 'Mailbox permission changes', count: stats.permissionChanges },
    {
      area: 'Transport rules',
      count: flaggedTransportRules.length + flaggedTransportChanges.length,
    },
    { area: 'Mailbox add-ins', count: flaggedAddIns.length },
    { area: 'Forwarding & auto-reply', count: hasForwarding ? 1 : 0 },
    { area: 'Trusted / blocked sender changes', count: stats.safelistChanges },
    { area: 'Sent mail / mass-mail', count: stats.massMailFlagged ? 1 : 0 },
    {
      area: 'Received phishing & threats',
      count: receivedFindings.length + deliveredThreats.length,
      danger: deliveredThreats.length,
    },
    {
      area: 'Sharing links',
      count: stats.sharingChanges,
      danger: stats.anonymousLinks,
    },
    { area: 'MFA methods (new in window)', count: stats.recentMfaDevices },
    {
      area: 'Registered devices (new in window)',
      count: recentRegisteredDevices.length,
    },
    {
      area: 'Intune devices (new in window)',
      count: stats.recentIntuneDevices,
    },
    {
      area: 'Foreign successful sign-ins',
      count: stats.foreignSuccessfulSignIns,
      danger: stats.foreignSuccessfulSignIns,
    },
    { area: 'Directory audit events', count: flaggedAudits.length },
    { area: 'Identity Protection risk', count: riskState?.Listed ? 1 : 0 },
  ].map((row) => {
    const danger = row.danger || 0
    const flagged = row.count || 0
    return {
      area: row.area,
      result:
        danger > 0
          ? `${flagged} flagged · ${danger} high-risk`
          : flagged > 0
            ? `${flagged} flagged`
            : 'Clear',
      resultColour:
        danger > 0 ? '#C53030' : flagged > 0 ? '#B7791F' : '#2F855A',
    }
  })
  const flaggedAreaCount = summaryData.filter(
    (row) => row.result !== 'Clear'
  ).length

  // The findings grouped by the attacker objective they serve — the same five-objective lens and
  // the same flag predicates the case workspace uses, so the report and the page agree.
  const objectiveFlagged = becGroupFlagged(becData, windowDays)
  const objectiveBreakdown = BEC_GROUPS.map((group) => ({
    // the attacker group is not a timeline objective, so it has no entry in the objective maps
    label: BEC_OBJECTIVE_LABEL[group.id] || group.title,
    value: objectiveFlagged[group.id] || 0,
    colour: BEC_OBJECTIVE_COLOR[group.id] || '#C53030',
  }))
  const objectiveMax = Math.max(
    ...objectiveBreakdown.map((entry) => entry.value),
    1
  )
  const totalFindings = objectiveBreakdown.reduce(
    (sum, objective) => sum + objective.value,
    0
  )

  // Priority remediation actions, written from what was actually found. Each line names the count
  // and, where it helps, the specific rule/app/address — so the report tells this user's story
  // rather than repeating a generic checklist.
  const isHighOrMed =
    threatLevel.level === 'High' || threatLevel.level === 'Medium'
  const ruleNames = (becData?.NewRules || [])
    .map((rule) => rule.Name)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')
  const rogueAppNames = [
    ...(becData?.AddedApps || [])
      .filter((app) => app.MaliciousMatch)
      .map((app) => app.DisplayName || app.AppId),
    ...(becData?.MaliciousSPs || []).map((sp) => sp.DisplayName || sp.AppId),
  ]
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')
  const consentNames = flaggedGrants
    .map((grant) => grant.ClientDisplayName || grant.ClientAppId)
    .filter(Boolean)
    .slice(0, 3)
    .join(', ')

  const tailoredActions = [
    isHighOrMed && {
      tag: 'Critical',
      text: `Reset ${userData?.userPrincipalName || 'the user'}'s password and revoke all active sessions to cut off any current attacker access.`,
    },
    threatLevel.level === 'High' && {
      tag: 'Critical',
      text: 'Block sign-in for the account until the mailbox and identity are confirmed clean.',
    },
    reachedAccounts.length > 0 && {
      tag: 'Critical',
      text: `Secure the ${reachedAccounts.length} other account(s) reached from the attacker's addresses (${listNames(reachedAccounts.map((row) => row.UserPrincipalName))}): reset, revoke sessions and investigate each one.`,
    },
    (flaggedGrants.length > 0 || stats.maliciousApps > 0) && {
      tag: 'Critical',
      text: `Revoke ${flaggedGrants.length + stats.maliciousApps} risky application consent(s)${consentNames || rogueAppNames ? ` (${consentNames || rogueAppNames})` : ''} — consent survives a password reset.`,
    },
    stats.maliciousApps > 0 && {
      tag: 'Critical',
      text: `Disable the catalog-matched rogue application(s)${rogueAppNames ? ` (${rogueAppNames})` : ''} tenant-wide.`,
    },
    attackerIps.length > 0 && {
      tag: 'High',
      text: `Block the ${attackerIps.length} attacker address(es) (${listNames(attackerIps.map((v) => v.IP))}) tenant-wide so they cannot be used against any other account.`,
    },
    attackerFormIds.length > 0 && {
      tag: 'High',
      text: `Remove the ${attackerFormIds.length} Microsoft Form(s) built from the attacker's addresses${attackerFormNames.length ? ` (${listNames(attackerFormNames)})` : ''} and warn anyone who responded: confirm phishing and delete each one from its Microsoft Defender alert, or, after the password reset, delete it in Microsoft Forms as the account.`,
    },
    delegatedReached.length > 0 && {
      tag: 'High',
      text: `Check the ${delegatedReached.length} other mailbox(es) reached through this account (${listNames(delegatedReached.map((row) => row.Mailbox))}) for rules, forwarding and sent mail.`,
    },
    (stats.newRules > 0 || stats.ruleChanges > 0) && {
      tag: 'High',
      text: `Disable the ${stats.newRules + stats.ruleChanges} suspicious inbox rule(s)/change(s)${ruleNames ? ` (${ruleNames})` : ''} that hide replies or auto-forward mail.`,
    },
    hasForwarding && {
      tag: 'High',
      text: `Clear mailbox forwarding${forwardingAddress ? ` to ${forwardingAddress}` : ''}, which silently copies mail out of the tenant.`,
    },
    flaggedDelegations.length > 0 && {
      tag: 'High',
      text: `Remove ${flaggedDelegations.length} flagged mailbox delegation(s) — a delegate keeps access after a reset.`,
    },
    (stats.anonymousLinks > 0 || stats.sharingChanges > 0) && {
      tag: 'High',
      text: `Remove the ${stats.sharingChanges} sharing-link change(s)${stats.anonymousLinks ? `, including ${stats.anonymousLinks} "anyone" link(s)` : ''} and disable OneDrive sharing — anonymous links expose data past any reset.`,
    },
    stats.massMailFlagged && {
      tag: 'High',
      text: `The mailbox sent a mass-mail campaign (${stats.sentTotalMessages} message(s) to ${stats.sentTotalRecipients} recipient(s)). Scope the wave and warn recipients before anything is purged.`,
    },
    stats.foreignSuccessfulSignIns > 0 && {
      tag: 'High',
      text: `${stats.foreignSuccessfulSignIns} successful sign-in(s) from outside the assigned usage location confirm access — treat the account as compromised.`,
    },
    flaggedTransportRules.length + flaggedTransportChanges.length > 0 && {
      tag: 'High',
      text: `Review and disable ${flaggedTransportRules.length + flaggedTransportChanges.length} tenant transport rule(s) changed in the window — these affect every mailbox.`,
    },
    stats.recentMfaDevices > 0 && {
      tag: 'Medium',
      text: `Remove ${stats.recentMfaDevices} MFA method(s) registered during the window, then re-register trusted ones.`,
    },
    recentRegisteredDevices.length > 0 && {
      tag: 'Medium',
      text: `Disable ${recentRegisteredDevices.length} device(s) registered during the window so they cannot satisfy device-based Conditional Access.`,
    },
    stats.safelistChanges > 0 && {
      tag: 'Medium',
      text: `Review ${stats.safelistChanges} trusted-sender / safelist change(s) that would let an attacker's future mail skip filtering.`,
    },
    flaggedAddIns.length > 0 && {
      tag: 'Medium',
      text: `Disable ${flaggedAddIns.length} flagged mailbox add-in(s).`,
    },
  ].filter(Boolean)
  const priorityActions =
    tailoredActions.length > 0
      ? tailoredActions
      : [
          {
            tag: 'Monitor',
            text: 'No specific indicators require remediation. Continue monitoring the account for 30 days and keep MFA enforced as a precaution.',
          },
        ]

  // The outcome in plain business terms — what the intrusion actually achieved, phrased for a reader
  // who wants the "so what", not which checks ran or how the data was gathered. Leads the summary.
  const impactFindings = [
    (stats.foreignSuccessfulSignIns > 0 || foreignNonInteractive.length > 0) &&
      `Unauthorized access is confirmed — ${
        stats.foreignSuccessfulSignIns + foreignNonInteractive.length
      } successful sign-in(s) came from outside the account's assigned location.`,
    attackerIps.length > 0 &&
      `${count(attackerIps.length, 'network address', 'network addresses')}${
        attackerCountries.length ? ` in ${listNames(attackerCountries)}` : ''
      } ${attackerIps.length === 1 ? 'was' : 'were'} identified as the attacker's${
        attackerDid.length
          ? `; from there the attacker ${listNames(attackerDid, 5)}`
          : ''
      }.`,
    attackerReach.length > 0 &&
      `The attack reached beyond this account: ${listNames(attackerReach, 3)}.`,
    riskState?.Listed &&
      `Microsoft Identity Protection currently flags this account as at risk${
        riskState.RiskLevel ? ` (${riskState.RiskLevel} risk)` : ''
      }.`,
    hasForwarding &&
      `Incoming mail is being copied out of the organization${
        forwardingAddress ? ` to ${forwardingAddress}` : ''
      }, so the attacker keeps reading it even after a reset.`,
    (stats.newRules > 0 || stats.ruleChanges > 0) &&
      `${
        stats.newRules + stats.ruleChanges
      } inbox rule(s) or change(s) hide, delete or redirect the user's mail.`,
    stats.anonymousLinks > 0 &&
      `${stats.anonymousLinks} "anyone with the link" sharing link(s) expose files to anyone holding the URL, past any later reset.`,
    stats.massMailFlagged &&
      `The mailbox sent a mass-mail wave — ${stats.sentTotalMessages} message(s) to ${stats.sentTotalRecipients} recipient(s) — so it is now being used to attack others.`,
    (flaggedGrants.length > 0 || stats.maliciousApps > 0) &&
      `${
        flaggedGrants.length + stats.maliciousApps
      } risky application consent(s) or app(s) retain access to data independently of the password.`,
    (stats.recentMfaDevices > 0 || recentRegisteredDevices.length > 0) &&
      `New sign-in persistence was added — ${stats.recentMfaDevices} MFA method(s) and ${recentRegisteredDevices.length} device(s) registered during the window.`,
    flaggedDelegations.length > 0 &&
      `${flaggedDelegations.length} mailbox delegation(s) let another account read this mailbox.`,
  ].filter(Boolean)

  // A chronological "order of events" that correlates every timestamped signal — the same event
  // stream the case page's timeline shows (buildBecTimeline) — so the report reads as the shape of
  // the intrusion over time. Identical bursts collapse to one ×N line so a repeated audit event does
  // not drown the narrative.
  const { events: timelineRaw } = buildBecTimeline(
    becData,
    windowDays,
    userData?.userPrincipalName
  )

  // Collapse a run of identical events in the same minute (same label and detail) into one ×N row.
  const timelineCollapsed = []
  timelineRaw.forEach((event) => {
    const minute = event.date.toISOString().slice(0, 16)
    const previous = timelineCollapsed[timelineCollapsed.length - 1]
    if (
      previous &&
      previous.minute === minute &&
      previous.label === event.label &&
      previous.detail === event.detail
    ) {
      previous.count += 1
      return
    }
    timelineCollapsed.push({ ...event, minute, count: 1 })
  })
  const timelineEvents = timelineCollapsed.map((event) => ({
    when: formatDate(event.date),
    event: event.count > 1 ? `${event.label} (×${event.count})` : event.label,
    detail: event.detail,
  }))

  // Containment actions already run for this case (from the run's stored history), flattened to one
  // row per action result, newest first — so the report records what was done, not only what to do.
  const remediationRows = (becData?.Run?.Containment || [])
    .slice()
    .reverse()
    .flatMap((entry) =>
      (Array.isArray(entry.Results) ? entry.Results : []).map((row) => ({
        when: formatDate(entry.At),
        action: String(row.Action || '')
          .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
          .trim(),
        target: row.Target,
        result: row.resultText,
        state: row.state,
      }))
    )
  const remediationStateColour = (row) =>
    ({
      success: '#2F855A',
      error: '#C53030',
      warning: '#B7791F',
    })[row.state] || '#4A5568'

  return (
    <ReportDocument
      brandingSettings={brandingSettings}
      tenantName={tenantName}
      reportName="BEC Analysis Report"
      generatedOn={currentDate}
      variables={variables}
      coverLabel="SECURITY INCIDENT REPORT"
      coverTitle="BEC Compromise"
      coverAccent="Analysis"
      coverSubtitle={`Business Email Compromise Investigation Report for ${
        tenantName || 'your organization'
      }`}
      // The one report whose subject is a person rather than the tenant, so the cover names the
      // compromised account.
      coverTenant={userData?.displayName || 'Unknown User'}
      coverFallbackImage="/reportImages/soc.jpg"
      coverFooterNote="Confidential & Proprietary - For Internal Use Only"
      footerLabel={`${tenantName} - BEC Analysis Report for ${userData?.displayName}`}
      coverMeta={
        <CoverMeta
          lines={[userData?.userPrincipalName || 'user@domain.com']}
          note={`Analysis Date: ${becData?.ExtractedAt ? formatDate(becData.ExtractedAt) : 'N/A'}`}
        />
      }
    >
      {/* EXECUTIVE SUMMARY PAGE */}
      <ContentPage
        title="Executive Summary"
        subtitle="Overview of Business Email Compromise investigation findings"
      >
        <Section>
          <Paragraph>
            This report documents the findings of a Business Email Compromise
            (BEC) investigation performed for the user account{' '}
            <Bold>{userData?.userPrincipalName}</Bold> within{' '}
            <Bold>{tenantName}</Bold>. The investigation analyzed suspicious
            activity indicators including mailbox rules, permission changes, new
            applications, authentication patterns, and sign-in locations over a
            {windowDays}-day period.
          </Paragraph>

          <Paragraph>
            Business Email Compromise is a sophisticated scam targeting
            organizations that regularly perform wire transfers or have
            established relationships with foreign suppliers. Attackers
            compromise legitimate email accounts through social engineering or
            computer intrusion techniques to conduct unauthorized fund
            transfers, steal sensitive information, or impersonate executives.
          </Paragraph>
        </Section>

        <Section title="Investigation Overview">
          <StatRow
            stats={[
              { value: stats.newRules, label: 'Mailbox Rules' },
              { value: stats.permissionChanges, label: 'Permission Changes' },
              { value: stats.foreignSignIns, label: 'Foreign Sign-ins' },
              { value: stats.maliciousApps, label: 'Malicious Apps' },
            ]}
          />

          <AlertBox
            colour={threatLevel.color}
            title={`Threat Assessment: ${threatLevel.level} (score ${threatLevel.value})`}
          >
            {threatLevel.level === 'High' &&
              'HIGH RISK: Multiple indicators of compromise detected. Immediate remediation actions are strongly recommended. This account shows patterns consistent with active Business Email Compromise attacks.'}
            {threatLevel.level === 'Medium' &&
              'MEDIUM RISK: Suspicious activity patterns detected. Review findings and consider implementing recommended security measures. Some indicators suggest potential unauthorized access.'}
            {threatLevel.level === 'Low' &&
              'LOW RISK: Minimal suspicious activity detected. The findings show standard user behavior with no significant indicators of compromise. Continue monitoring as a precautionary measure.'}
          </AlertBox>
          {appliedSignals.length > 0 && (
            <InfoBox title="Signals that contributed to the score">
              {appliedSignals
                .map(
                  (signal) =>
                    `+${signal.Weight} ${signal.Description} (${signal.Count})`
                )
                .join('\n')}
            </InfoBox>
          )}
        </Section>

        <Section title="What We Found">
          {impactFindings.length > 0 ? (
            <>
              <Paragraph>
                In plain terms, this is what the investigation established about{' '}
                <Bold>{userData?.userPrincipalName}</Bold>:
              </Paragraph>
              <BulletList>
                {impactFindings.map((finding, index) => (
                  <Bullet key={index}>{finding}</Bullet>
                ))}
              </BulletList>
            </>
          ) : (
            <ClearBox title="✔️ No indicators of account compromise">
              None of the investigation&apos;s checks returned evidence that
              this account was accessed, altered or misused during the analysis
              window.
            </ClearBox>
          )}
        </Section>

        <Section title="Findings at a Glance">
          <Paragraph>
            Every check in this investigation and its result.{' '}
            {!isSummary &&
              'Flagged rows are expanded in the detailed findings later in this report. '}
            {flaggedAreaCount} of {summaryData.length} checks returned something
            to review.
          </Paragraph>
          {totalFindings > 0 && (
            <>
              <Paragraph>
                <Bold>Findings by attacker objective</Bold> — grouped by what
                each finding would let an attacker do:
              </Paragraph>
              <ProgressList
                items={objectiveBreakdown.map((objective) => ({
                  label: objective.label,
                  value: objective.value,
                  max: objectiveMax,
                  display: `${objective.value}`,
                  colour: objective.colour,
                }))}
              />
            </>
          )}
          <DataTable
            columns={[
              { header: 'Check', key: 'area', bold: true, width: 3 },
              {
                header: 'Result',
                key: 'result',
                width: 2,
                colour: (row) => row.resultColour,
              },
            ]}
            rows={summaryData}
            limit={summaryData.length}
          />
          {!isSummary && (
            <Note>
              Checks that could not run (missing a licence, permission, mailbox
              or service) are itemised under Data Source Information below — a
              check that did not run is not a pass.
            </Note>
          )}
        </Section>

        <Section title="Priority Remediation Actions">
          <Paragraph>
            Actions specific to what this investigation found, most urgent
            first. Your IT or security team should carry these out without delay
            {!isSummary
              ? '; the strategic and preventative measures follow later in this report.'
              : '.'}
          </Paragraph>
          <DataTable
            columns={[
              {
                header: 'Priority',
                key: 'tag',
                width: 1,
                colour: (row) =>
                  ({
                    Critical: '#C53030',
                    High: '#DD6B20',
                    Medium: '#B7791F',
                    Monitor: '#2F855A',
                  })[row.tag] || '#4A5568',
              },
              { header: 'Action', key: 'text', width: 5 },
            ]}
            rows={priorityActions}
            limit={priorityActions.length}
          />
        </Section>

        <Section title="Order of Events">
          {timelineEvents.length > 0 ? (
            <>
              <Paragraph>
                Every timestamped signal — sign-ins, directory and mailbox
                changes, sharing, and the mail itself — in the order it
                happened, with who and where where known. Read it as the shape
                of the intrusion over time, not as isolated findings.
              </Paragraph>
              <DataTable
                columns={[
                  { header: 'When', key: 'when', width: 2, bold: true },
                  { header: 'Event', key: 'event', width: 2 },
                  { header: 'Detail', key: 'detail', width: 3 },
                ]}
                rows={timelineEvents}
                limit={40}
              />
            </>
          ) : (
            <ClearBox title="✔️ No timestamped events in the window">
              None of the checks returned a dated event inside the analysis
              window. This usually means no changes were made to the account in
              the period, not that data was missing.
            </ClearBox>
          )}
        </Section>

        {remediationRows.length > 0 && (
          <Section title="Remediation Taken">
            <Paragraph>
              The containment actions already run for this account during the
              investigation, and their result for each target.
            </Paragraph>
            <DataTable
              columns={[
                { header: 'When', key: 'when', width: 2, bold: true },
                { header: 'Action', key: 'action', width: 2 },
                { header: 'Target', key: 'target', width: 2 },
                { header: 'Result', key: 'result', width: 3 },
                {
                  header: 'State',
                  key: 'state',
                  width: 1,
                  colour: remediationStateColour,
                },
              ]}
              rows={remediationRows}
              limit={remediationRows.length}
            />
          </Section>
        )}

        {!isSummary && (
          <Section title="Data Source Information">
            <InfoBox title="Audit Log Status">
              {becData?.ExtractResult || 'Unknown'}
            </InfoBox>
            <InfoBox title="Analysis Period">
              Last {windowDays} days ending{' '}
              {becData?.ExtractedAt ? formatDate(becData.ExtractedAt) : 'N/A'}
            </InfoBox>
            {becData?.CaseId && (
              <InfoBox title="Case">
                {becData.CaseId} - full investigation. Metadata only: audit
                records, sign-ins, trace headers, permissions, rules and devices
                were collected; no message content was read.
              </InfoBox>
            )}
            {skippedCollectors.length > 0 && (
              <AlertBox
                title={`⚠️ ${skippedCollectors.length} check(s) could not run (not applicable to this tenant or user)`}
              >
                {skippedCollectors
                  .map(
                    ([name, marker]) =>
                      `${name}: ${marker.Requirement || marker.Error || 'not checked'}`
                  )
                  .join('\n')}
              </AlertBox>
            )}
            {incompleteCollectors.length > 0 && (
              <AlertBox
                title={`⚠️ ${incompleteCollectors.length} check(s) returned partial data`}
              >
                {incompleteCollectors
                  .map(
                    ([name, marker]) =>
                      `${name}: ${marker.Error || `capped at ${marker.Cap}`}`
                  )
                  .join('\n')}
              </AlertBox>
            )}
            <InfoBox title="Assigned Usage Location">
              {locationAnalysis?.UsageLocation ||
                'Not assigned - sign-ins and activity could not be compared against an expected country'}
            </InfoBox>
          </Section>
        )}
      </ContentPage>

      {/* The educational, per-check detail, recommendations and compliance pages — everything past the
          executive summary. The summary variant stops here so a C-suite reader gets the verdict, the
          findings at a glance, the priority actions, the timeline and what was remediated, and no more. */}
      {!isSummary && (
        <>
          {/* ATTACKER ADDRESSES & ACTIVITY PAGE - capped lists; the evidence export has every row */}
          {ipVerdicts.length > 0 && (
            <ContentPage
              title="Attacker Addresses & Activity"
              subtitle="Where the attacker connected from, and what was done from there"
            >
              <Section title="Attacker and Suspicious Addresses">
                <Paragraph>
                  Every address seen on this account was judged from the
                  user&apos;s sign-in history, network and location, the IP
                  allow and block lists, and the other accounts using it.
                  Addresses judged the attacker&apos;s drive the findings below;
                  suspicious ones are listed for review only.
                </Paragraph>
                {reviewIps.length > 0 ? (
                  <DataTable
                    columns={[
                      { header: 'Address', key: 'IP', width: 2, bold: true },
                      {
                        header: 'Verdict',
                        key: 'verdict',
                        width: 2,
                        colour: (row) =>
                          isAttackerVerdict(row.Verdict)
                            ? '#C53030'
                            : '#B7791F',
                      },
                      { header: 'Location', key: 'location', width: 2 },
                      { header: 'Sign-ins', key: 'signIns', width: 1 },
                      { header: 'Why', key: 'why', width: 4 },
                    ]}
                    rows={reviewIps.map((v) => ({
                      ...v,
                      verdict: v.Verdict.replace(/([a-z])([A-Z])/g, '$1 $2'),
                      location:
                        [v.City, v.Country].filter(Boolean).join(', ') ||
                        'Unknown',
                      signIns: `${v.SuccessfulSignIns || 0} ok / ${v.FailedSignIns || 0} failed`,
                      why: verdictWhy(v),
                    }))}
                    limit={15}
                  />
                ) : (
                  <ClearBox title="✔️ No address was judged the attacker's">
                    None of the {ipVerdicts.length} address(es) seen on this
                    account was judged to be the attacker&apos;s or suspicious.
                  </ClearBox>
                )}
              </Section>

              {attackerMail.length + attackerFiles.length > 0 && (
                <Section title="What Was Done From the Attacker's Addresses">
                  <StatRow
                    stats={[
                      { value: attackerTotals.opened, label: 'Emails Opened' },
                      { value: attackerTotals.sent, label: 'Emails Sent' },
                      {
                        value: attackerTotals.deleted,
                        label: 'Emails Deleted',
                      },
                      { value: attackerTotals.files, label: 'Files Opened' },
                    ]}
                  />
                  {attackerMail.length > 0 && (
                    <DataTable
                      columns={[
                        { header: 'When', key: 'when', width: 2, bold: true },
                        { header: 'Action', key: 'action', width: 2 },
                        { header: 'Mailbox', key: 'mailbox', width: 2 },
                        { header: 'Item', key: 'item', width: 4 },
                      ]}
                      rows={attackerMail.map((row) => ({
                        ...row,
                        when: formatDate(row.When),
                        action: row.AccessType
                          ? `${row.Operation} (${row.AccessType})`
                          : row.Operation,
                        item: row.Subject || row.Folder || row.Detail,
                        mailbox:
                          !row.MailboxOwner ||
                          row.MailboxOwner.toLowerCase() ===
                            (userData?.userPrincipalName || '').toLowerCase()
                            ? 'This mailbox'
                            : row.MailboxOwner,
                      }))}
                      limit={10}
                    />
                  )}
                  {attackerFiles.length > 0 && (
                    <DataTable
                      columns={[
                        { header: 'When', key: 'when', width: 2, bold: true },
                        { header: 'Action', key: 'Operation', width: 2 },
                        { header: 'File', key: 'file', width: 3 },
                        { header: 'Site', key: 'Site', width: 3 },
                      ]}
                      rows={attackerFiles.map((row) => ({
                        ...row,
                        when: formatDate(row.When),
                        file: row.File || row.Url,
                      }))}
                      limit={10}
                    />
                  )}
                  <Note>
                    The first items of each kind are shown; the complete item
                    list is in the case&apos;s evidence export.
                  </Note>
                </Section>
              )}

              {blastRadius.length > 0 && (
                <Section title="Other Accounts Reached">
                  <Paragraph>
                    Accounts elsewhere in the organization that signed in or
                    acted from the attacker&apos;s addresses. A successful
                    sign-in or any recorded action means the account was
                    reached; failed sign-ins alone are an attempt.
                  </Paragraph>
                  <DataTable
                    columns={[
                      {
                        header: 'Account',
                        key: 'UserPrincipalName',
                        width: 3,
                        bold: true,
                      },
                      {
                        header: 'Status',
                        key: 'status',
                        width: 1,
                        colour: (row) => (row.Reached ? '#C53030' : '#B7791F'),
                      },
                      { header: 'Sign-ins', key: 'signIns', width: 2 },
                      { header: 'Actions', key: 'Operations', width: 3 },
                      { header: 'Last seen', key: 'lastSeen', width: 2 },
                    ]}
                    rows={blastRadius.map((row) => ({
                      ...row,
                      status: row.Reached ? 'Reached' : 'Attempted',
                      signIns: `${row.SuccessfulSignIns || 0} ok / ${row.FailedSignIns || 0} failed`,
                      Operations: row.Operations || '-',
                      lastSeen: formatDate(row.LastSeen),
                    }))}
                    limit={15}
                  />
                </Section>
              )}

              {delegatedReached.length > 0 && (
                <Section title="Other Mailboxes Reached Through This Account">
                  <DataTable
                    columns={[
                      {
                        header: 'Mailbox',
                        key: 'Mailbox',
                        width: 3,
                        bold: true,
                      },
                      { header: 'Access', key: 'AccessRights', width: 3 },
                      { header: 'Opened', key: 'AttackerOpened', width: 1 },
                      { header: 'Synced', key: 'AttackerSynced', width: 1 },
                      { header: 'Sent', key: 'AttackerSent', width: 1 },
                    ]}
                    rows={delegatedReached}
                    limit={10}
                  />
                </Section>
              )}

              {attackerFormIds.length > 0 && (
                <Section title="Microsoft Forms From the Attacker's Addresses">
                  <Paragraph>
                    Forms built or shared from the attacker&apos;s addresses,
                    and how far they reached. A form asking for a password is a
                    phishing page hosted on Microsoft&apos;s own domain.
                  </Paragraph>
                  <DataTable
                    columns={[
                      { header: 'Form', key: 'name', width: 4, bold: true },
                      { header: 'Responses', key: 'Responses', width: 1 },
                      {
                        header: 'Anonymous',
                        key: 'AnonymousResponses',
                        width: 1,
                      },
                      { header: 'Views', key: 'Views', width: 1 },
                      { header: 'Phishing flag', key: 'flagged', width: 2 },
                    ]}
                    rows={
                      formsReach.length > 0
                        ? formsReach.map((form) => ({
                            ...form,
                            name: form.FormName || form.FormId,
                            flagged: form.PhishingFlagged ? 'Yes' : 'No',
                          }))
                        : attackerFormNames.map((name) => ({
                            name,
                            Responses: '-',
                            AnonymousResponses: '-',
                            Views: '-',
                            flagged: '-',
                          }))
                    }
                    limit={10}
                  />
                </Section>
              )}
            </ContentPage>
          )}

          {/* UNDERSTANDING BEC PAGE */}
          <ContentPage
            title="Understanding Business Email Compromise"
            subtitle="What is BEC and why does it matter?"
          >
            <Section title="What is Business Email Compromise?">
              <Paragraph>
                Business Email Compromise (BEC) is a type of cyberattack where
                criminals gain unauthorized access to a business email account.
                Once inside, attackers can:
              </Paragraph>

              <BulletList>
                <Bullet label="Monitor communications:">
                  {' '}
                  Read sensitive emails to learn about business operations,
                  financial processes, and key relationships.
                </Bullet>
                <Bullet label="Impersonate executives:">
                  {' '}
                  Send fraudulent emails appearing to come from company
                  leadership requesting wire transfers or sensitive data.
                </Bullet>
                <Bullet label="Manipulate transactions:">
                  {' '}
                  Intercept legitimate invoices and alter payment information to
                  redirect funds to attacker-controlled accounts.
                </Bullet>
                <Bullet label="Hide their tracks:">
                  {' '}
                  Create email rules to automatically delete or hide messages,
                  preventing detection.
                </Bullet>
              </BulletList>
            </Section>

            <Section title="Common Attack Methods">
              <Paragraph>
                Attackers typically gain access to email accounts through:
              </Paragraph>

              <BulletList>
                <Bullet label="Phishing:">
                  {' '}
                  Deceptive emails that trick users into providing their login
                  credentials on fake websites.
                </Bullet>
                <Bullet label="Password Spraying:">
                  {' '}
                  Automated attempts to log in using common passwords across
                  many accounts.
                </Bullet>
                <Bullet label="Credential Stuffing:">
                  {' '}
                  Using usernames and passwords leaked from other breached
                  websites.
                </Bullet>
                <Bullet label="Malware:">
                  {' '}
                  Software that captures keystrokes or steals stored passwords
                  from compromised devices.
                </Bullet>
              </BulletList>
            </Section>

            <Section title="Why This Investigation Was Performed">
              <Paragraph>
                This analysis was initiated because suspicious activity was
                detected or reported for this user account. The investigation
                examines multiple indicators that might suggest account
                compromise, including unusual mailbox rules, unexpected
                permission changes, new application authorizations, and abnormal
                sign-in patterns. Early detection is critical to minimize
                potential damage and prevent financial loss or data theft.
              </Paragraph>
            </Section>
          </ContentPage>

          {/* DETAILED FINDINGS PAGE */}
          <ContentPage
            title="Detailed Findings"
            subtitle="Investigation results and analysis"
          >
            {/* Check 1: Mailbox Rules */}
            <Section title="Check 1: Mailbox Rules">
              <InfoBox title="Why We Check This">
                Attackers often create email rules to automatically forward,
                delete, or hide messages so victims never see evidence of
                fraudulent activity. A rule is flagged when it forwards or
                redirects mail (especially to an external address), deletes
                messages, moves them to a low-visibility folder (RSS, Archive,
                Deleted Items), stops processing other rules, targets financial
                keywords, or takes any of these actions on all incoming mail
                with no condition.
              </InfoBox>

              {stats.newRules > 0 && (
                <>
                  <AlertBox
                    title={`⚠️ ${stats.newRules} Mailbox Rule(s) Found`}
                  >
                    The following mailbox rules were detected. Review each rule
                    carefully to determine if it was created by the user or by
                    an attacker. Rules that forward emails or move them to
                    unusual folders are particularly suspicious.
                  </AlertBox>

                  {becData.NewRules.slice(0, 10).map((rule, index) => (
                    <InfoBox
                      key={index}
                      title={`Rule: ${rule.Name || 'Unnamed Rule'}`}
                    >
                      {[
                        rule.MoveToFolder &&
                          `Moves mail to: ${rule.MoveToFolder}`,
                        rule.ForwardTo && `Forwards to: ${rule.ForwardTo}`,
                        rule.ForwardAsAttachmentTo &&
                          `Forwards as attachment to: ${rule.ForwardAsAttachmentTo}`,
                        rule.RedirectTo && `Redirects to: ${rule.RedirectTo}`,
                        rule.DeleteMessage && 'Deletes messages',
                        rule.MarkAsRead && 'Marks messages read',
                        rule.StopProcessingRules &&
                          'Stops processing further rules',
                        rule.SubjectContainsWords &&
                          `On subject words: ${
                            Array.isArray(rule.SubjectContainsWords)
                              ? rule.SubjectContainsWords.join(', ')
                              : rule.SubjectContainsWords
                          }`,
                        rule.RecentlyChanged &&
                          'Created or changed in the window',
                        rule.Enabled === false && 'Currently disabled',
                      ]
                        .filter(Boolean)
                        .join('\n') ||
                        rule.Description ||
                        'No actions recorded on this rule'}
                    </InfoBox>
                  ))}
                  {becData.NewRules.length > 10 && (
                    <Note>
                      ... and {becData.NewRules.length - 10} more rules (in the
                      retained investigation record)
                    </Note>
                  )}
                </>
              )}
              {stats.ruleChanges > 0 && (
                <>
                  <AlertBox
                    title={`⚠️ ${stats.ruleChanges} Rule Change(s) in the Last 7 Days`}
                  >
                    The audit log recorded inbox rules being created, changed or
                    removed on this mailbox. Rules that were removed after use
                    are a common way for attackers to cover their tracks.
                  </AlertBox>

                  {becData.InboxRuleChanges.slice(0, 10).map(
                    (change, index) => (
                      <InfoBox
                        key={index}
                        title={`${change.Operation || 'Rule Change'}: ${change.RuleName || 'Unnamed Rule'}`}
                      >
                        Date: {change.Date || 'Unknown'}
                        {'\n'}
                        By: {change.UserKey || 'Unknown'}
                        {change.ClientIP &&
                          `\nFrom: ${change.ClientIP}${change.Country ? ` (${change.Country})` : ''}`}
                        {change.ForeignLocation === true &&
                          '\n⚠️ Originated outside the assigned usage location'}
                        {change.Parameters &&
                          `\nParameters: ${change.Parameters}`}
                      </InfoBox>
                    )
                  )}
                  {becData.InboxRuleChanges.length > 10 && (
                    <Note>
                      ... and {becData.InboxRuleChanges.length - 10} more
                      changes (see the retained investigation record for the
                      full list)
                    </Note>
                  )}
                </>
              )}
              {stats.newRules === 0 && stats.ruleChanges === 0 && (
                <ClearBox title="✔️ No Suspicious Rules Found">
                  No mailbox rules were detected that match suspicious patterns.
                  This is a positive indicator.
                </ClearBox>
              )}
            </Section>
          </ContentPage>

          {/* CHECK 2: NEW USERS */}
          <ContentPage
            title="Detailed Findings (Continued)"
            subtitle="Investigation results and analysis"
          >
            <Section title="Check 2: Recently Created Users">
              <InfoBox title="Why We Check This">
                Attackers sometimes create new user accounts to maintain
                persistent access or to use as staging accounts for fraudulent
                activities. Reviewing recently created users helps identify
                unauthorized account creation.
              </InfoBox>

              {stats.newUsers > 0 ? (
                <>
                  <AlertBox title={`ℹ️ ${stats.newUsers} New User(s) Found`}>
                    The following users were created in the last {windowDays}{' '}
                    days. Verify that each account creation was authorized and
                    legitimate.
                  </AlertBox>

                  {becData.NewUsers.slice(0, 8).map((user, index) => (
                    <InfoBox
                      key={index}
                      title={`${user.displayName || 'Unknown'}`}
                    >
                      Email: {user.userPrincipalName || 'N/A'}
                      {'\n'}
                      Created: {formatDate(user.createdDateTime)}
                    </InfoBox>
                  ))}
                  {becData.NewUsers.length > 8 && (
                    <Note>
                      ... and {becData.NewUsers.length - 8} more users (see JSON
                      export for full list)
                    </Note>
                  )}
                </>
              ) : (
                <ClearBox title="✔️ No New Users Found">
                  No new user accounts were created during the analysis period.
                </ClearBox>
              )}
            </Section>

            {/* Check 3: New Applications */}
            <Section title="Check 3: New Applications">
              <InfoBox title="Why We Check This">
                Attackers may authorize malicious or suspicious third-party
                applications to access your email and data. These applications
                can read emails, send messages, and access files without the
                user's explicit knowledge.
              </InfoBox>

              {stats.maliciousApps > 0 && (
                <AlertBox
                  title={`⚠️ ${stats.maliciousApps} Known-Malicious Application(s) Detected`}
                >
                  One or more applications in this tenant match a
                  known-malicious application catalog. Consent-based access
                  survives a password reset, so these applications should be
                  removed unless their presence is explained.
                </AlertBox>
              )}

              {stats.newApps > 0 ? (
                <>
                  <AlertBox
                    title={`⚠️ ${stats.newApps} New Application(s) Found`}
                  >
                    New applications were granted access during the analysis
                    period. Review each application to ensure it was authorized
                    and is from a trusted publisher.
                  </AlertBox>

                  {becData.AddedApps.slice(0, 6).map((app, index) => (
                    <InfoBox
                      key={index}
                      title={`${app.displayName || app.appDisplayName || 'Unknown'}`}
                    >
                      Publisher: {app.publisher || 'Unknown'}
                      {'\n'}
                      App ID: {app.appId || 'N/A'}
                      {'\n'}
                      Created: {formatDate(app.createdDateTime)}
                      {app.MaliciousMatch &&
                        `\n⚠️ Matches known-malicious catalog entry "${app.MaliciousMatch.Name}"${
                          app.MaliciousMatch.Categories?.length
                            ? ` (${app.MaliciousMatch.Categories.join(', ')})`
                            : ''
                        }`}
                    </InfoBox>
                  ))}
                  {becData.AddedApps.length > 6 && (
                    <Note>
                      ... and {becData.AddedApps.length - 6} more apps (see JSON
                      export for full list)
                    </Note>
                  )}
                </>
              ) : (
                (becData?.MaliciousSPs?.length || 0) === 0 && (
                  <ClearBox title="✔️ No New Applications Found">
                    No new applications were authorized during the analysis
                    period, and no known malicious applications are present in
                    the tenant.
                  </ClearBox>
                )
              )}

              {(becData?.MaliciousSPs?.length || 0) > 0 && (
                <>
                  {becData.MaliciousSPs.slice(0, 6).map((app, index) => (
                    <InfoBox
                      key={`malsp-${index}`}
                      title={`⚠️ ${app.displayName || 'Unknown'} (present in tenant)`}
                    >
                      Catalog entry: {app.CatalogName || 'Unknown'}
                      {'\n'}
                      App ID: {app.appId || 'N/A'}
                      {'\n'}
                      Categories:{' '}
                      {app.Categories?.length
                        ? app.Categories.join(', ')
                        : 'N/A'}
                      {'\n'}
                      Enabled: {String(app.accountEnabled ?? 'Unknown')}
                      {'\n'}
                      First seen: {formatDate(app.createdDateTime)}
                    </InfoBox>
                  ))}
                  {becData.MaliciousSPs.length > 6 && (
                    <Note>
                      ... and {becData.MaliciousSPs.length - 6} more (see JSON
                      export for full list)
                    </Note>
                  )}
                </>
              )}
            </Section>
          </ContentPage>

          {/* CHECK 4, 5, 6, 7: PERMISSIONS, SENT MAIL, MFA, PASSWORDS */}
          <ContentPage
            title="Additional Security Checks"
            subtitle="Permissions, outbound mail, authentication, and access patterns"
          >
            {/* Check 4: Mailbox Permission Changes */}
            <Section title="Check 4: Mailbox Permission Changes">
              <InfoBox title="Why We Check This">
                Unauthorized changes to mailbox permissions can allow attackers
                to grant themselves or accomplices access to read, send, or
                manage emails. This is a common technique to maintain persistent
                access.
              </InfoBox>

              {stats.permissionChanges > 0 ? (
                <>
                  <AlertBox
                    title={`⚠️ ${stats.permissionChanges} Permission Change(s) Found`}
                  >
                    Mailbox permission changes were detected. Verify that each
                    change was authorized and necessary for legitimate business
                    purposes.
                  </AlertBox>

                  {becData.MailboxPermissionChanges.slice(0, 5).map(
                    (change, index) => (
                      <InfoBox
                        key={index}
                        title={`${change.Operation || 'Permission Change'}`}
                      >
                        User: {change.UserKey || 'Unknown'}
                        {'\n'}
                        Target: {change.ObjectId || 'N/A'}
                        {'\n'}
                        Permissions: {change.Permissions || 'Unknown'}
                        {change.TargetsSuspect === true &&
                          '\n⚠️ Targets the investigated mailbox'}
                      </InfoBox>
                    )
                  )}
                  {becData.MailboxPermissionChanges.length > 5 && (
                    <Note>
                      ... and {becData.MailboxPermissionChanges.length - 5} more
                      changes
                    </Note>
                  )}
                </>
              ) : (
                <ClearBox title="✔️ No Permission Changes Found">
                  No mailbox permission changes were detected during the
                  analysis period.
                </ClearBox>
              )}
            </Section>

            {/* Check 5: Sent Messages */}
            <Section title="Check 5: Sent Messages">
              <InfoBox title="Why We Check This">
                Attackers use a compromised mailbox to send fraudulent invoices,
                phishing, or internal impersonation mail. The message trace
                shows what actually left the mailbox during the analysis period,
                including the IP address it was sent from.
              </InfoBox>

              {stats.sentMessages > 0 ? (
                <>
                  <Paragraph indent>
                    ℹ️ {stats.sentTotalMessages || stats.sentMessages}{' '}
                    message(s) to{' '}
                    {stats.sentTotalRecipients || stats.sentMessages}{' '}
                    recipient(s) were sent by this mailbox during the analysis
                    period
                    {stats.foreignSentMessages > 0
                      ? `, including ${stats.foreignSentMessages} from an IP outside the user's assigned usage location.`
                      : '.'}
                  </Paragraph>

                  {stats.massMailFlagged && (
                    <AlertBox title="⚠️ Mass-Mail Pattern Detected">
                      {stats.repeatedSubjects > 0
                        ? `${stats.repeatedSubjects} subject(s) were sent as many separate messages or to many recipients. `
                        : ''}
                      {stats.sendBursts > 0
                        ? `${stats.sendBursts} short burst(s) of high-volume sending were detected. `
                        : ''}
                      Identical-subject mass mail and send bursts are how a
                      compromised mailbox spreads phishing or fraudulent
                      invoices. Review the campaigns below and warn the
                      recipients if the content was malicious.
                    </AlertBox>
                  )}

                  {(becData?.SentMessageAnalysis?.RepeatedSubjects || [])
                    .slice(0, 5)
                    .map((group, index) => (
                      <InfoBox
                        key={`subject-${index}`}
                        title={`${group.Flagged ? '⚠️ ' : ''}Repeated subject: ${group.Subject || '(no subject)'}`}
                      >
                        Messages: {group.MessageCount}
                        {'\n'}
                        Recipients: {group.RecipientCount}
                        {'\n'}
                        First sent: {group.FirstSent || 'N/A'}
                        {'\n'}
                        Last sent: {group.LastSent || 'N/A'}
                      </InfoBox>
                    ))}
                  {(becData?.SentMessageAnalysis?.RepeatedSubjects?.length ||
                    0) > 5 && (
                    <Note>
                      ... and{' '}
                      {becData.SentMessageAnalysis.RepeatedSubjects.length - 5}{' '}
                      more repeated subjects (see the retained investigation
                      record for the full list)
                    </Note>
                  )}

                  {(becData?.SentMessageAnalysis?.Bursts || [])
                    .slice(0, 5)
                    .map((burst, index) => (
                      <InfoBox
                        key={`burst-${index}`}
                        title={`⚠️ Send burst: ${burst.MessageCount} message(s) to ${burst.RecipientCount} recipient(s) in ${burst.WindowMinutes || 10} minutes`}
                      >
                        Starting: {burst.WindowStart || 'N/A'}
                        {burst.TopSubject &&
                          `\nMost common subject: ${burst.TopSubject}`}
                      </InfoBox>
                    ))}
                  {(becData?.SentMessageAnalysis?.Bursts?.length || 0) > 5 && (
                    <Note>
                      ... and {becData.SentMessageAnalysis.Bursts.length - 5}{' '}
                      more bursts (see the retained investigation record for the
                      full list)
                    </Note>
                  )}

                  {becData.SentMessages.slice(0, 10).map((msg, index) => (
                    <InfoBox
                      key={index}
                      title={`${msg.Subject || '(no subject)'}`}
                    >
                      To: {msg.RecipientAddress || 'N/A'}
                      {'\n'}
                      Status: {msg.Status || 'N/A'}
                      {'\n'}
                      Received: {msg.Received || 'N/A'}
                      {msg.FromIP &&
                        `\nFrom IP: ${msg.FromIP}${msg.Country ? ` (${msg.Country})` : ''}`}
                      {msg.ForeignLocation === true &&
                        '\n⚠️ Sent from outside the assigned usage location'}
                    </InfoBox>
                  ))}
                  {becData.SentMessages.length > 10 && (
                    <Note>
                      ... and {becData.SentMessages.length - 10} more messages
                      (see the retained investigation record for the full list)
                    </Note>
                  )}
                </>
              ) : (
                <ClearBox title="✔️ No Sent Messages Found">
                  No messages were sent by this mailbox during the analysis
                  period.
                </ClearBox>
              )}
            </Section>

            {/* Check 6: MFA Devices */}
            <Section title="Check 6: MFA Devices">
              <InfoBox title="Why We Check This">
                Multi-factor authentication (MFA) devices provide an additional
                layer of security. Reviewing registered MFA methods helps
                identify if attackers have added unauthorized devices to bypass
                security controls.
              </InfoBox>

              {stats.mfaDevices > 0 ? (
                <>
                  <Paragraph indent>
                    ℹ️ {stats.mfaDevices} MFA device(s) registered
                    {stats.recentMfaDevices > 0
                      ? `, including ${stats.recentMfaDevices} registered in the last ${windowDays} days. Verify the recent registrations were made by the user — attackers register their own method to keep access after a password reset.`
                      : '. Verify each device belongs to the user.'}
                  </Paragraph>

                  {[...becData.MFADevices]
                    .sort(
                      (a, b) =>
                        new Date(b?.createdDateTime || 0) -
                        new Date(a?.createdDateTime || 0)
                    )
                    .slice(0, 5)
                    .map((device, index) => (
                      <InfoBox
                        key={index}
                        title={`${device['@odata.type']?.replace('#microsoft.graph.', '').replace('AuthenticationMethod', '') || 'Unknown'}`}
                      >
                        Display Name: {device.displayName || 'N/A'}
                        {'\n'}
                        Registered: {formatDate(device.createdDateTime)}
                        {isRecentMfaDevice(device) &&
                          `
⚠️ Registered in the last ${windowDays} days`}
                      </InfoBox>
                    ))}
                  {becData.MFADevices.length > 5 && (
                    <Note>
                      ... and {becData.MFADevices.length - 5} more methods (see
                      JSON export for full list)
                    </Note>
                  )}
                </>
              ) : (
                <InfoBox tone="warn" title="⚠️ No MFA Devices Found">
                  No multi-factor authentication devices are registered. MFA is
                  highly recommended to prevent unauthorized access.
                </InfoBox>
              )}
            </Section>

            {/* Check 7: Password Changes */}
            <Section title="Check 7: Recent Password Changes">
              <InfoBox title="Why We Check This">
                Attackers often change passwords to lock out legitimate users.
                Reviewing recent password changes in the tenant helps identify
                if the compromised account's password was changed or if other
                accounts were affected.
              </InfoBox>

              {stats.passwordChanges > 0 ? (
                <>
                  <Paragraph indent>
                    ℹ️ {stats.passwordChanges} password change(s) detected in
                    the tenant during the analysis period.
                  </Paragraph>

                  {becData.ChangedPasswords.slice(0, 5).map((user, index) => (
                    <InfoBox
                      key={index}
                      title={`${user.displayName || 'Unknown'}`}
                    >
                      Email: {user.userPrincipalName || 'N/A'}
                      {'\n'}
                      Last Password Change:{' '}
                      {formatDate(user.lastPasswordChangeDateTime)}
                    </InfoBox>
                  ))}
                  {becData.ChangedPasswords.length > 5 && (
                    <Note>
                      ... and {becData.ChangedPasswords.length - 5} more (see
                      JSON export for full list)
                    </Note>
                  )}
                </>
              ) : (
                <Paragraph indent>
                  ℹ️ No password changes detected during the analysis period.
                </Paragraph>
              )}
            </Section>
          </ContentPage>

          {/* CHECK 8, 9, 10: SENDER LISTS, DEVICES, LOCATIONS */}
          <ContentPage
            title="Mailbox Lists, Devices & Locations"
            subtitle="Sender lists, managed devices, and sign-in origins"
          >
            {/* Check 8: Trusted & Blocked Senders */}
            <Section title="Check 8: Trusted &amp; Blocked Senders">
              <InfoBox title="Why We Check This">
                Attackers may add their own domain to the Trusted Senders list
                so their fraudulent messages bypass spam filtering, or add
                finance/security domains to the Blocked Senders list so warnings
                and alerts are hidden from the victim in the Junk Email folder.
              </InfoBox>

              {becData?.SafelistError && (
                <AlertBox title="⚠️ Could Not Retrieve Sender Lists">
                  {becData.SafelistError}
                  {'\n'}
                  An empty list here does not mean the mailbox has no trusted or
                  blocked senders.
                </AlertBox>
              )}

              {stats.safelistChanges > 0 && (
                <>
                  <AlertBox
                    title={`⚠️ ${stats.safelistChanges} Safelist Change(s) in the Last 7 Days`}
                  >
                    The audit log recorded changes to the Trusted/Blocked
                    Senders and Domains list on this mailbox. Review each change
                    carefully.
                  </AlertBox>

                  {becData.SafelistChanges.slice(0, 10).map((change, index) => (
                    <InfoBox
                      key={index}
                      title={`${change.Operation || 'Safelist Change'} by ${change.UserKey || 'Unknown'}`}
                    >
                      Date: {formatDate(change.Date)}
                      {change.ClientIP &&
                        `\nFrom: ${change.ClientIP}${change.Country ? ` (${change.Country})` : ''}`}
                      {change.ForeignLocation === true &&
                        '\n⚠️ Originated outside the assigned usage location'}
                      {'\n'}
                      Trusted: {formatSafelistValue(change.Trusted)}
                      {'\n'}
                      Blocked: {formatSafelistValue(change.Blocked)}
                    </InfoBox>
                  ))}
                  {becData.SafelistChanges.length > 10 && (
                    <Note>
                      ... and {becData.SafelistChanges.length - 10} more changes
                      (see the retained investigation record for the full list)
                    </Note>
                  )}
                </>
              )}

              {stats.trustedSenders > 0 && (
                <InfoBox
                  title={`Trusted Senders/Domains (${stats.trustedSenders})`}
                >
                  {becData.TrustedSenders.slice(0, 15).join(', ')}
                </InfoBox>
              )}
              {stats.trustedSenders > 15 && (
                <Note>
                  ... and {stats.trustedSenders - 15} more trusted entries (see
                  JSON export for full list)
                </Note>
              )}

              {stats.blockedSenders > 0 && (
                <InfoBox
                  title={`Blocked Senders/Domains (${stats.blockedSenders})`}
                >
                  {becData.BlockedSenders.slice(0, 15).join(', ')}
                </InfoBox>
              )}
              {stats.blockedSenders > 15 && (
                <Note>
                  ... and {stats.blockedSenders - 15} more blocked entries (see
                  JSON export for full list)
                </Note>
              )}

              {!becData?.SafelistError &&
                stats.trustedSenders === 0 &&
                stats.blockedSenders === 0 &&
                stats.safelistChanges === 0 && (
                  <ClearBox title="✔️ No Trusted or Blocked Senders Found">
                    No trusted or blocked sender/domain entries were found on
                    this mailbox.
                  </ClearBox>
                )}
            </Section>

            {/* Check 9: Intune Devices */}
            <Section title="Check 9: Intune Devices">
              <InfoBox title="Why We Check This">
                Newly enrolled Intune devices can indicate an attacker standing
                up a VM or BYOD endpoint under the compromised identity,
                including paths that re-register Windows Hello for Business.
                Review devices enrolled during the analysis window first.
              </InfoBox>

              {becData?.Completeness?.IntuneDevices?.Skipped ? (
                <AlertBox title="⚠️ Intune Not Checked">
                  {becData.Completeness.IntuneDevices.Requirement
                    ? `Not checked - ${becData.Completeness.IntuneDevices.Requirement}. This is not a pass; the result is unknown.`
                    : becData.Completeness.IntuneDevices.Error}
                </AlertBox>
              ) : becData?.IntuneDevicesError ? (
                <AlertBox title="⚠️ Could Not Retrieve Intune Devices">
                  {becData?.Completeness?.IntuneDevices?.Error ||
                    becData.IntuneDevicesError}
                  {'\n'}
                  An empty device list here does not mean the user has no Intune
                  devices.
                </AlertBox>
              ) : stats.intuneDevices > 0 ? (
                <>
                  <Paragraph indent>
                    ℹ️ {stats.intuneDevices} Intune-managed device(s) associated
                    with this user
                    {stats.recentIntuneDevices > 0
                      ? `, including ${stats.recentIntuneDevices} enrolled in the last ${windowDays} days.`
                      : `. None were enrolled in the last ${windowDays} days.`}
                  </Paragraph>

                  {sortedIntuneDevices.slice(0, 5).map((device, index) => (
                    <InfoBox
                      key={index}
                      title={`${device.deviceName || 'Unknown device'}`}
                    >
                      OS: {device.operatingSystem || 'N/A'}
                      {device.osVersion ? ` ${device.osVersion}` : ''}
                      {'\n'}
                      Enrolled: {formatDate(device.enrolledDateTime)}
                      {'\n'}
                      Compliance: {device.complianceState || 'N/A'}
                      {'\n'}
                      Enrollment Type: {device.deviceEnrollmentType || 'N/A'}
                      {device.serialNumber
                        ? `\nSerial: ${device.serialNumber}`
                        : ''}
                    </InfoBox>
                  ))}
                  {sortedIntuneDevices.length > 5 && (
                    <Note>
                      ... and {sortedIntuneDevices.length - 5} more devices (see
                      the retained investigation record for the full list)
                    </Note>
                  )}
                </>
              ) : (
                <ClearBox title="✔️ No Intune Devices Found">
                  No Intune-managed devices were found for this user.
                </ClearBox>
              )}
            </Section>

            {/* Check 10: Sign-in Locations */}
            <Section title="Check 10: Sign-in Locations">
              <InfoBox title="Why We Check This">
                Sign-ins from countries the user does not work from are one of
                the strongest compromise indicators. Each sign-in is compared
                against the user's assigned usage location in Entra ID
                {locationAnalysis?.UsageLocation
                  ? ` (${locationAnalysis.UsageLocation})`
                  : ''}
                , and the client IPs behind rule changes, safelist changes,
                sharing changes, and sent mail are geo-located and compared the
                same way.
              </InfoBox>

              {becData?.SuspectUserSignInsError ? (
                <AlertBox title="⚠️ Could Not Retrieve Sign-in Logs">
                  {becData.SuspectUserSignInsError}
                  {'\n'}
                  An empty list here does not mean the user has not signed in.
                </AlertBox>
              ) : (
                <>
                  {!locationAnalysis?.UsageLocation && (
                    <InfoBox tone="warn" title="⚠️ No Usage Location Assigned">
                      {locationAnalysis?.Note ||
                        'The user has no usage location assigned in Entra ID, so activity cannot be compared against an expected country.'}
                    </InfoBox>
                  )}

                  {(locationAnalysis?.SignInCountries?.length || 0) > 0 && (
                    <InfoBox
                      title={`Sign-in Countries Observed (last ${stats.signIns} sign-ins)`}
                    >
                      {locationAnalysis.SignInCountries.map(
                        (c) => `${c.Country}: ${c.Count} sign-in(s)`
                      ).join('\n')}
                    </InfoBox>
                  )}

                  {stats.foreignSignIns > 0 || stats.foreignActivity > 0 ? (
                    <>
                      <AlertBox title="⚠️ Activity Outside the Assigned Usage Location">
                        {stats.foreignSignIns} sign-in(s) (of which{' '}
                        {stats.foreignSuccessfulSignIns} succeeded),{' '}
                        {locationAnalysis?.ForeignRuleChangeCount || 0} inbox
                        rule change(s),{' '}
                        {locationAnalysis?.ForeignSafelistChangeCount || 0}{' '}
                        safelist change(s),{' '}
                        {locationAnalysis?.ForeignSharingChangeCount || 0}{' '}
                        sharing change(s), and{' '}
                        {locationAnalysis?.ForeignSentMessageCount || 0} sent
                        message(s) originated outside{' '}
                        {locationAnalysis?.UsageLocation}. Failed foreign
                        sign-ins are mostly password-spray noise; the successful
                        ones prove access. Review each carefully — a single
                        legitimate trip can explain some of this, but rule,
                        safelist, or sharing changes from a foreign IP rarely
                        have an innocent explanation.
                      </AlertBox>

                      {foreignSignIns.slice(0, 10).map((signIn, index) => (
                        <InfoBox
                          key={index}
                          title={`${formatDate(signIn.CreatedDateTime)} - ${signIn.Country || 'Unknown'}`}
                        >
                          Application: {signIn.AppDisplayName || 'N/A'}
                          {'\n'}
                          IP Address: {signIn.IPAddress || 'N/A'}
                          {'\n'}
                          City: {signIn.City || 'N/A'}
                          {'\n'}
                          Result: {signIn.Status || 'N/A'}
                        </InfoBox>
                      ))}
                      {foreignSignIns.length > 10 && (
                        <Note>
                          ... and {foreignSignIns.length - 10} more foreign
                          sign-ins (see the retained investigation record for
                          the full list)
                        </Note>
                      )}
                    </>
                  ) : locationAnalysis?.UsageLocation ? (
                    <ClearBox title="✔️ No Foreign Activity Detected">
                      All located sign-ins and activity match the user's
                      assigned usage location ({locationAnalysis.UsageLocation}
                      ).
                    </ClearBox>
                  ) : null}
                </>
              )}
            </Section>

            {/* Check 11: Sharing Links */}
            <Section title="Check 11: Sharing Links">
              <InfoBox title="Why We Check This">
                Attackers share OneDrive and SharePoint folders to give
                themselves a data feed that survives a password reset, and
                anonymous links expose the content to anyone holding the URL.
                This check lists every sharing link the account created or
                changed during the analysis period, including the IP address it
                was done from.
              </InfoBox>

              {stats.sharingChanges > 0 ? (
                <>
                  <AlertBox
                    title={`⚠️ ${stats.sharingChanges} Sharing Change(s) in the Last 7 Days`}
                  >
                    {stats.anonymousLinks > 0
                      ? `${stats.anonymousLinks} of these involve anonymous links, which anyone with the URL can open. `
                      : ''}
                    Review each link and remove any that are not explained, even
                    if the account has since been remediated.
                  </AlertBox>

                  {becData.SharingChanges.slice(0, 10).map((change, index) => (
                    <InfoBox
                      key={index}
                      title={`${change.Operation || 'Sharing Change'}: ${change.FileName || change.ItemUrl || 'Unknown item'}`}
                    >
                      Date: {formatDate(change.Date)}
                      {'\n'}
                      Workload: {change.Workload || 'N/A'}
                      {change.Target && `\nShared with: ${change.Target}`}
                      {change.ClientIP &&
                        `\nFrom: ${change.ClientIP}${change.Country ? ` (${change.Country})` : ''}`}
                      {change.ForeignLocation === true &&
                        '\n⚠️ Originated outside the assigned usage location'}
                    </InfoBox>
                  ))}
                  {becData.SharingChanges.length > 10 && (
                    <Note>
                      ... and {becData.SharingChanges.length - 10} more changes
                      (see the retained investigation record for the full list)
                    </Note>
                  )}
                </>
              ) : (
                <ClearBox title="✔️ No Sharing Changes Found">
                  No sharing links were created or changed by this account
                  during the analysis period.
                </ClearBox>
              )}
            </Section>
          </ContentPage>

          {/* FULL INVESTIGATION PAGE */}
          {
            <ContentPage
              title="Full Investigation Findings"
              subtitle="Delegations, consents, transport rules, received mail, directory audit, devices and risk state"
            >
              <Section title="Check 12: Mailbox Delegations and State">
                <InfoBox title="Why We Check This">
                  A delegate with FullAccess or SendAs, a forwarding address, or
                  an automatic reply lets an attacker keep reading and
                  impersonating after the password is changed.
                </InfoBox>
                {becData?.MailboxState?.HasForwarding && (
                  <AlertBox title="⚠️ Mail forwarding is configured">
                    Mail is forwarded to{' '}
                    {becData.MailboxState.ForwardingSmtpAddress ||
                      becData.MailboxState.ForwardingAddress}
                    {becData.MailboxState.DeliverToMailboxAndForward
                      ? ' (a copy stays in the mailbox)'
                      : ''}
                    .
                  </AlertBox>
                )}
                {flaggedDelegations.length > 0 ? (
                  <>
                    <AlertBox
                      title={`⚠️ ${flaggedDelegations.length} Flagged Delegation(s)`}
                    >
                      External, guest or catch-all principals hold rights on
                      this mailbox. Remove any the user cannot explain.
                    </AlertBox>
                    {flaggedDelegations.slice(0, 10).map((d, index) => (
                      <InfoBox
                        key={index}
                        title={`${d.PermissionType}: ${d.Trustee}`}
                      >
                        Rights: {d.AccessRights}
                        {'\n'}
                        Resource: {d.Resource}
                      </InfoBox>
                    ))}
                  </>
                ) : (
                  <ClearBox title="✔️ No Flagged Delegations">
                    {(becData?.Delegations || []).length} delegation(s) exist,
                    none to an external, guest or catch-all principal.
                  </ClearBox>
                )}
              </Section>

              <Section title="Check 13: Application Consents">
                <InfoBox title="Why We Check This">
                  Applications the user consented to keep their access after a
                  password reset. A rogue-catalog match or a high-risk scope
                  from an unverified publisher is how mailboxes are synchronised
                  out of the tenant.
                </InfoBox>
                {flaggedGrants.length > 0 ? (
                  <>
                    <AlertBox
                      title={`⚠️ ${flaggedGrants.length} Flagged Consent(s)`}
                    >
                      Revoke the grants below unless the user can explain them.
                    </AlertBox>
                    {flaggedGrants.slice(0, 10).map((g, index) => (
                      <InfoBox
                        key={index}
                        title={`${g.ClientDisplayName || g.ClientAppId} (${g.Risk})`}
                      >
                        Scopes: {g.Scope || 'N/A'}
                        {'\n'}
                        Publisher: {g.Publisher || 'Unknown'}{' '}
                        {g.PublisherVerified ? '(verified)' : '(not verified)'}
                        {g.CatalogMatch?.Name &&
                          `\nCatalog: ${g.CatalogMatch.Name} (${g.CatalogMatch.Source})`}
                      </InfoBox>
                    ))}
                  </>
                ) : (
                  <ClearBox title="✔️ No Flagged Consents">
                    {(becData?.UserGrants || []).length} consent(s) and role
                    assignment(s) exist, none matching the rogue-app catalogs or
                    carrying a high-risk scope from an unverified publisher.
                  </ClearBox>
                )}
              </Section>

              <Section title="Check 14: Transport Rules">
                <InfoBox title="Why We Check This">
                  A tenant-wide transport rule that BCCs, redirects, deletes or
                  quarantines mail keeps a feed open after the mailbox itself is
                  cleaned.
                </InfoBox>
                {flaggedTransportChanges.length > 0 ||
                flaggedTransportRules.length > 0 ? (
                  <>
                    <AlertBox
                      title={`⚠️ ${flaggedTransportChanges.length} risky change(s) in the window, ${flaggedTransportRules.length} current rule(s) with diversion or suppression actions`}
                    >
                      Review each rule; disable any that cannot be explained.
                    </AlertBox>
                    {flaggedTransportChanges.slice(0, 5).map((c, index) => (
                      <InfoBox
                        key={`tc-${index}`}
                        title={`${c.Operation}: ${c.RuleName}`}
                      >
                        Date: {formatDate(c.Date)}
                        {'\n'}
                        By: {c.Actor || 'Unknown'}
                        {c.ClientIP &&
                          `\nFrom: ${c.ClientIP}${c.Country ? ` (${c.Country})` : ''}`}
                        {'\n'}
                        Risky parameters:{' '}
                        {Array.isArray(c.RiskyParameters)
                          ? c.RiskyParameters.join(', ')
                          : c.RiskyParameters}
                      </InfoBox>
                    ))}
                    {flaggedTransportRules.slice(0, 5).map((r, index) => (
                      <InfoBox
                        key={`tr-${index}`}
                        title={`Rule: ${r.Name} (${r.State}, ${r.Mode})`}
                      >
                        {Array.isArray(r.RiskReasons)
                          ? r.RiskReasons.join('\n')
                          : r.RiskReasons}
                      </InfoBox>
                    ))}
                  </>
                ) : (
                  <ClearBox title="✔️ No Risky Transport Rules">
                    No transport rule with a diversion or suppression action was
                    changed in the window or exists in the tenant.
                  </ClearBox>
                )}
              </Section>

              <Section title="Check 15: Mailbox Add-ins">
                {flaggedAddIns.length > 0 ? (
                  <AlertBox
                    title={`⚠️ ${flaggedAddIns.length} user-installed non-Microsoft add-in(s)`}
                  >
                    {flaggedAddIns
                      .map(
                        (a) =>
                          `${a.DisplayName} (${a.ProviderName || 'unknown provider'})`
                      )
                      .join('\n')}
                  </AlertBox>
                ) : (
                  <ClearBox title="✔️ No Flagged Add-ins">
                    No enabled user-installed add-in from a non-Microsoft
                    provider was found.
                  </ClearBox>
                )}
              </Section>

              <Section title="Check 16: Received Mail">
                <InfoBox title="Why We Check This">
                  The message that started the compromise usually arrived in the
                  window. Trace metadata is checked for phishing-shaped subjects
                  and look-alike sender domains; Defender for Office 365
                  verdicts are included where licensed. No message content is
                  read.
                </InfoBox>
                {becData?.ReceivedMailSummary && (
                  <Paragraph indent>
                    ℹ️ {becData.ReceivedMailSummary.TotalMessages} message(s)
                    from {becData.ReceivedMailSummary.UniqueSenders} sender(s)
                    were received in the window.
                  </Paragraph>
                )}
                {receivedFindings.length > 0 || deliveredThreats.length > 0 ? (
                  <>
                    <AlertBox
                      title={`⚠️ ${receivedFindings.length} finding(s), ${deliveredThreats.length} Defender-classified threat(s) delivered`}
                    >
                      Look-alike sender domains are the strongest signal;
                      subject patterns are leads for review, not verdicts.
                    </AlertBox>
                    {receivedFindings.slice(0, 8).map((f, index) => (
                      <InfoBox
                        key={`rf-${index}`}
                        title={`${f.FindingType}: ${f.SenderAddress}`}
                      >
                        Subject: {f.Subject || '(no subject)'}
                        {'\n'}
                        Reason: {f.Reason}
                        {'\n'}
                        Received: {f.Received || 'N/A'} - {f.Status || 'N/A'}
                      </InfoBox>
                    ))}
                    {deliveredThreats.slice(0, 5).map((d, index) => (
                      <InfoBox
                        key={`dd-${index}`}
                        title={`Defender: ${Array.isArray(d.ThreatTypes) ? d.ThreatTypes.join(', ') : d.ThreatTypes}`}
                      >
                        From: {d.SenderAddress || 'Unknown'}
                        {'\n'}
                        Subject: {d.Subject || '(no subject)'}
                        {'\n'}
                        Delivery: {d.DeliveryAction || 'N/A'} /{' '}
                        {d.LatestDeliveryLocation || 'N/A'}
                      </InfoBox>
                    ))}
                  </>
                ) : (
                  <ClearBox title="✔️ No Received-mail Findings">
                    No phishing-shaped subjects, look-alike sender domains or
                    delivered Defender detections were found.
                  </ClearBox>
                )}
              </Section>

              <Section title="Check 17: Entra Directory Audit">
                {flaggedAudits.length > 0 ? (
                  <>
                    <AlertBox
                      title={`⚠️ ${flaggedAudits.length} flagged directory event(s)`}
                    >
                      Security-info registration, consent, service principal,
                      device, password, token or role events involving this
                      user.
                    </AlertBox>
                    {flaggedAudits.slice(0, 8).map((a, index) => (
                      <InfoBox
                        key={index}
                        title={`${a.Activity} (${a.Result})`}
                      >
                        Date: {formatDate(a.ActivityDateTime)}
                        {'\n'}
                        By: {a.InitiatedBy || 'Unknown'}
                        {a.ClientIP &&
                          `\nFrom: ${a.ClientIP}${a.Country ? ` (${a.Country})` : ''}`}
                        {a.Targets && `\nTargets: ${a.Targets}`}
                      </InfoBox>
                    ))}
                  </>
                ) : (
                  <ClearBox title="✔️ No Flagged Directory Events">
                    {(becData?.DirectoryAudits || []).length} directory event(s)
                    involved this user in the window, none of the flagged kinds.
                  </ClearBox>
                )}
              </Section>

              <Section title="Check 18 and 19: Registered Devices and Non-interactive Sign-ins">
                {recentRegisteredDevices.length > 0 ? (
                  <AlertBox
                    title={`⚠️ ${recentRegisteredDevices.length} Entra device(s) registered in the window`}
                  >
                    {recentRegisteredDevices
                      .map(
                        (d) =>
                          `${d.displayName || d.deviceId} (${d.operatingSystem || 'unknown OS'}, ${d.trustType || 'unknown trust'}) registered ${formatDate(d.registrationDateTime)}`
                      )
                      .join('\n')}
                  </AlertBox>
                ) : (
                  <ClearBox title="✔️ No Devices Registered in the Window">
                    {(becData?.RegisteredDevices || []).length} registered
                    device(s), none new.
                  </ClearBox>
                )}
                {foreignNonInteractive.length > 0 ? (
                  <AlertBox
                    title={`⚠️ ${foreignNonInteractive.length} successful non-interactive sign-in(s) from outside the usage location`}
                  >
                    {foreignNonInteractive
                      .slice(0, 8)
                      .map(
                        (s) =>
                          `${formatDate(s.CreatedDateTime)} - ${s.AppDisplayName || 'N/A'} from ${s.IPAddress || 'N/A'} (${s.Country || 'Unknown'})`
                      )
                      .join('\n')}
                  </AlertBox>
                ) : (
                  <ClearBox title="✔️ No Foreign Non-interactive Sign-ins">
                    {(becData?.NonInteractiveSignIns || []).length} recent
                    non-interactive sign-in(s), none successful from outside the
                    usage location.
                  </ClearBox>
                )}
              </Section>

              <Section title="Check 20 and 21: Mailbox Activity and Identity Protection">
                {mailActivitySummary ? (
                  <InfoBox
                    tone={
                      mailActivitySummary.HardDeleteExceeded
                        ? 'warn'
                        : undefined
                    }
                    title="Mailbox activity counts"
                  >
                    Item accesses: {mailActivitySummary.MailItemsAccessedCount}
                    {'\n'}
                    Hard deletes: {mailActivitySummary.HardDeleteCount}
                    {mailActivitySummary.HardDeleteExceeded
                      ? ` ⚠️ exceeds the ${mailActivitySummary.HardDeleteThreshold} threshold`
                      : ''}
                    {'\n'}
                    Soft deletes: {mailActivitySummary.SoftDeleteCount}
                    {'\n'}
                    Sends: {mailActivitySummary.SendCount}
                    {'\n'}
                    Distinct client IPs: {mailActivitySummary.DistinctClientIPs}
                    {mailActivitySummary.SendAsByOthersCount > 0 &&
                      `\nSent as/on behalf by others: ${mailActivitySummary.SendAsByOthersCount}`}
                    {'\n'}
                    Counts only - no items were read.
                  </InfoBox>
                ) : (
                  <Note>
                    Mailbox activity counts were not available for this run.
                  </Note>
                )}
                {becData?.Completeness?.RiskState?.Skipped ? (
                  <AlertBox title="⚠️ Identity Protection Not Checked">
                    {becData.Completeness.RiskState.Requirement
                      ? `Not checked - ${becData.Completeness.RiskState.Requirement}. This is not a pass; whether the account is flagged as risky is unknown.`
                      : becData.Completeness.RiskState.Error}
                  </AlertBox>
                ) : riskState?.Listed ? (
                  <AlertBox
                    title={`⚠️ Identity Protection: ${riskState.RiskState} at ${riskState.RiskLevel} risk`}
                  >
                    {riskState.RiskDetail || 'No detail'} - last updated{' '}
                    {formatDate(riskState.RiskLastUpdatedDateTime)}.
                    {(riskState.Detections || []).length > 0 &&
                      ` ${(riskState.Detections || []).length} risk detection(s) in the window.`}
                  </AlertBox>
                ) : (
                  <ClearBox title="✔️ Not Listed as Risky">
                    Identity Protection does not list this user as risky.
                  </ClearBox>
                )}
              </Section>
            </ContentPage>
          }

          {/* RECOMMENDATIONS PAGE */}
          <ContentPage
            title="Recommendations"
            subtitle="Actions to take and prevention best practices"
          >
            <Section title="Immediate Actions">
              <Paragraph>
                The immediate, evidence-specific actions for this account are
                listed under <Bold>Priority Remediation Actions</Bold> in the
                executive summary at the front of this report, most urgent
                first, and should be carried out by your IT or security team
                without delay. The strategies below reduce the chance of a
                repeat once the account has been recovered.
              </Paragraph>
            </Section>

            <Section title="Long-Term Prevention Strategies">
              <Paragraph>
                To prevent future Business Email Compromise attacks, implement
                these security best practices:
              </Paragraph>

              <BulletList>
                <Bullet label="Enforce Multi-Factor Authentication (MFA):">
                  {' '}
                  Require MFA for all users, especially those with
                  administrative privileges or access to financial systems.
                </Bullet>
                <Bullet label="Implement Security Awareness Training:">
                  {' '}
                  Educate employees about phishing, social engineering, and how
                  to identify suspicious emails. Regular training significantly
                  reduces successful attacks.
                </Bullet>
                <Bullet label="Enable Advanced Threat Protection:">
                  {' '}
                  Use email security solutions that detect and block phishing,
                  malware, and suspicious attachments.
                </Bullet>
                <Bullet label="Configure Conditional Access Policies:">
                  {' '}
                  Restrict access based on location, device compliance, and risk
                  level to prevent unauthorized sign-ins.
                </Bullet>
                <Bullet label="Monitor Audit Logs:">
                  {' '}
                  Regularly review audit logs for suspicious activities such as
                  unusual sign-in patterns, rule creation, or permission
                  changes.
                </Bullet>
                <Bullet label="Establish Financial Controls:">
                  {' '}
                  Implement multi-person approval processes for wire transfers
                  and payment changes to prevent fraudulent transactions.
                </Bullet>
              </BulletList>
            </Section>

            <Section title="User Education Points">
              <Paragraph>
                Share these key points with the affected user to help prevent
                future compromises:
              </Paragraph>

              <BulletList>
                <Bullet>
                  Never click on links or open attachments in unexpected emails,
                  even if they appear to come from known contacts.
                </Bullet>
                <Bullet>
                  Always verify unusual requests for money transfers or
                  sensitive information through a separate communication channel
                  (phone call, in person).
                </Bullet>
                <Bullet>
                  Use strong, unique passwords for each account and consider
                  using a password manager.
                </Bullet>
                <Bullet>
                  Be cautious when authorizing new applications or granting
                  permissions to third-party services.
                </Bullet>
                <Bullet>
                  Report suspicious emails or activities to your IT security
                  team immediately.
                </Bullet>
              </BulletList>
            </Section>
          </ContentPage>

          {/* COMPLIANCE & DOCUMENTATION PAGE */}
          <ContentPage
            title="Compliance & Documentation"
            subtitle="Meeting regulatory and audit requirements"
          >
            <Section title="Compliance Considerations">
              <Paragraph>
                This report supports compliance and documentation requirements
                for various security frameworks and regulatory standards:
              </Paragraph>

              <BulletList>
                <Bullet label="ISO 27001:">
                  {' '}
                  Demonstrates incident detection, analysis, and response
                  procedures (Controls A.16.1.1 - A.16.1.7).
                </Bullet>
                <Bullet label="CMMC Level 2:">
                  {' '}
                  Provides evidence of security incident monitoring, analysis,
                  and documentation (AC.L2-3.1.12, AU.L2-3.3.1).
                </Bullet>
                <Bullet label="SOC 2 Type II:">
                  {' '}
                  Documents detective and responsive controls for security
                  incidents (CC7.3, CC7.4).
                </Bullet>
                <Bullet label="NIST CSF:">
                  {' '}
                  Aligns with Detect (DE.AE, DE.CM) and Respond (RS.AN, RS.MI)
                  functions.
                </Bullet>
                <Bullet label="GDPR:">
                  {' '}
                  Demonstrates security breach detection and potential data
                  breach assessment (Articles 32, 33).
                </Bullet>
              </BulletList>
            </Section>

            <Section title="Audit Trail">
              <Paragraph>
                This investigation and resulting documentation provide an audit
                trail for security incident response:
              </Paragraph>

              <InfoBox title="Investigation Details">
                Investigation Date: {formatDate(becData?.ExtractedAt)}
                {'\n'}
                Analyzed User: {userData?.userPrincipalName}
                {'\n'}
                Organization: {tenantName}
                {'\n'}
                Analysis Period: {windowDays} days
                {'\n'}
                Assigned Usage Location:{' '}
                {locationAnalysis?.UsageLocation || 'Not assigned'}
                {'\n'}
                Audit Log Status: {becData?.ExtractResult || 'Unknown'}
              </InfoBox>

              <InfoBox title="Findings Summary">
                Threat Level: {threatLevel.level}
                {'\n'}
                Mailbox Rules Found: {stats.newRules}
                {'\n'}
                Rule Changes: {stats.ruleChanges}
                {'\n'}
                Permission Changes: {stats.permissionChanges} (
                {stats.permissionChangesTargetingUser} targeting this mailbox)
                {'\n'}
                New Applications: {stats.newApps}
                {'\n'}
                Known-Malicious Applications: {stats.maliciousApps}
                {'\n'}
                New Users: {stats.newUsers}
                {'\n'}
                Sent Messages: {stats.sentTotalMessages || stats.sentMessages}
                {'\n'}
                Repeated Subject Campaigns: {stats.repeatedSubjects}
                {'\n'}
                Send Bursts: {stats.sendBursts}
                {'\n'}
                MFA Devices: {stats.mfaDevices}
                {'\n'}
                Recent MFA Registrations ({windowDays}d):{' '}
                {stats.recentMfaDevices}
                {'\n'}
                Password Changes: {stats.passwordChanges}
                {'\n'}
                Trusted Senders: {stats.trustedSenders}
                {'\n'}
                Blocked Senders: {stats.blockedSenders}
                {'\n'}
                Safelist Changes: {stats.safelistChanges}
                {'\n'}
                Sharing Changes: {stats.sharingChanges}
                {'\n'}
                Anonymous Links: {stats.anonymousLinks}
                {'\n'}
                Intune Devices: {stats.intuneDevices}
                {'\n'}
                Recent Intune Enrollments ({windowDays}d):{' '}
                {stats.recentIntuneDevices}
                {'\n'}
                Foreign Sign-ins: {stats.foreignSignIns} (
                {stats.foreignSuccessfulSignIns} successful)
                {'\n'}
                Foreign Rule/Safelist/Sharing/Mail Activity:{' '}
                {stats.foreignActivity}
              </InfoBox>
            </Section>

            <Section title="Document Retention">
              <Paragraph>
                This report should be retained according to your organization's
                document retention policy and regulatory requirements. Typical
                retention periods range from 3-7 years depending on applicable
                compliance frameworks. Store this document securely with
                restricted access as it contains sensitive security information.
              </Paragraph>
            </Section>

            <Section title="Additional Resources">
              <Paragraph>
                For more information about Business Email Compromise and
                cybersecurity best practices:
              </Paragraph>

              <BulletList>
                <Bullet>
                  FBI IC3: Internet Crime Complaint Center (ic3.gov)
                </Bullet>
                <Bullet>
                  CISA: Cybersecurity & Infrastructure Security Agency
                  (cisa.gov)
                </Bullet>
                <Bullet>
                  Microsoft Security: Business Email Compromise resources
                </Bullet>
              </BulletList>
            </Section>
          </ContentPage>
        </>
      )}
    </ReportDocument>
  )
}

// Main Button Component
export const BECRemediationReportButton = ({
  userData,
  becData,
  tenantName,
}) => {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  // 'full' = the complete report; 'summary' = the executive pages only, for a C-suite reader.
  const [variant, setVariant] = useState('full')

  // Check if we have the necessary data
  const hasData = userData && becData && !becData.Waiting

  const brandingSettings = useBrandingSettings()
  const variables = useReportVariables()

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
  }

  if (!hasData) {
    return null // Don't show button if data isn't ready
  }

  return (
    <>
      <Tooltip title="Generate BEC Remediation Report PDF">
        <Button
          size="small"
          variant="contained"
          startIcon={<CippIcons.PictureAsPdf />}
          onClick={handleOpenDialog}
          disabled={!hasData}
          color="primary"
        >
          Generate PDF Report
        </Button>
      </Tooltip>

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="lg"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              height: '90vh',
            },
          },
        }}
      >
        <DialogTitle>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography variant="h6" component="div">
              BEC Remediation Report Preview
            </Typography>
            <Stack direction="row" spacing={1} alignItems="center">
              <ToggleButtonGroup
                size="small"
                exclusive
                value={variant}
                onChange={(event, value) => value && setVariant(value)}
              >
                <ToggleButton value="summary">C-suite summary</ToggleButton>
                <ToggleButton value="full">Full report</ToggleButton>
              </ToggleButtonGroup>
              <IconButton onClick={handleCloseDialog} size="small">
                <CippIcons.Close />
              </IconButton>
            </Stack>
          </Box>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          {hasData && (
            <CippPdfPreview
              key={variant}
              width="100%"
              height="100%"
              title={`BEC Remediation Report - ${tenantName}`}
              fileName={`BEC_${variant === 'summary' ? 'Summary' : 'Report'}_${tenantName}.pdf`}
            >
              <BECRemediationReportDocument
                userData={userData}
                becData={becData}
                brandingSettings={brandingSettings}
                tenantName={tenantName}
                variables={variables}
                variant={variant}
              />
            </CippPdfPreview>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
          <PDFDownloadLink
            key={variant}
            document={
              <BECRemediationReportDocument
                userData={userData}
                becData={becData}
                brandingSettings={brandingSettings}
                tenantName={tenantName}
                variables={variables}
                variant={variant}
              />
            }
            fileName={`BEC_${variant === 'summary' ? 'Summary' : 'Report'}_${userData?.userPrincipalName}_${new Date().toISOString().split('T')[0]}.pdf`}
            style={{ textDecoration: 'none' }}
          >
            {({ loading }) => (
              <Button
                variant="contained"
                startIcon={
                  loading ? (
                    <CircularProgress size={20} />
                  ) : (
                    <CippIcons.Download />
                  )
                }
                disabled={loading}
              >
                {loading
                  ? 'Generating...'
                  : `Download ${variant === 'summary' ? 'summary' : 'full report'}`}
              </Button>
            )}
          </PDFDownloadLink>
        </DialogActions>
      </Dialog>
    </>
  )
}
