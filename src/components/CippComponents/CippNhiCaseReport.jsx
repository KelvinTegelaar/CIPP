import { useState } from 'react'
import NextLink from 'next/link'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  Grid,
  Link,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import CippButtonCard from '../CippCards/CippButtonCard'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippApiResults } from './CippApiResults'
import { CippNhiContainmentDrawer } from './CippNhiContainmentDrawer'
import { useBecEvidenceDownload } from './CippBecEvidenceDownload'
import { CippIcons } from '../../utils/icon-registry'
import { ApiPostCall } from '../../api/ApiCall'
import { PermissionButton } from '../../utils/permissions'

export const NHI_LEVEL_COLOR = {
  Critical: 'error',
  High: 'error',
  Medium: 'warning',
  Low: 'success',
}
export const NHI_VERDICT_COLOR = {
  Compromised: 'error',
  LikelyAttacker: 'error',
  Suspicious: 'warning',
  Unknown: 'default',
  Expected: 'success',
  Safe: 'success',
}
const join = (value) =>
  Array.isArray(value) ? value.filter(Boolean).join(', ') : (value ?? '')
const list = (value) =>
  Array.isArray(value) ? value.filter(Boolean) : value ? [value] : []

// One accordion per finding set; opened when it holds something flagged.
const Section = ({ title, count, flagged = 0, note, children }) => (
  <CippButtonCard
    variant="outlined"
    component="accordion"
    accordionExpanded={flagged > 0}
    title={
      <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
        <span>{title}</span>
        {flagged > 0 && (
          <Chip size="small" color="error" label={`${flagged} flagged`} />
        )}
        {count !== undefined && (
          <Chip size="small" variant="outlined" label={count} />
        )}
      </Stack>
    }
  >
    {note && (
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        {note}
      </Typography>
    )}
    {children}
  </CippButtonCard>
)

const Table = ({ title, rows, columns, actions }) =>
  rows.length > 0 ? (
    <CippDataTable
      noCard={true}
      title={title}
      data={rows}
      simpleColumns={columns}
      actions={actions}
    />
  ) : (
    <Typography variant="body2" color="text.secondary">
      Nothing found.
    </Typography>
  )

// The containment history of the case, and the release that re-enables a disabled app.
const ContainmentHistory = ({ caseData, tenantFilter, relatedQueryKeys }) => {
  const [confirmation, setConfirmation] = useState('')
  const releaseCall = ApiPostCall({
    relatedQueryKeys: [`ExecNHICheck-${caseData?.CaseId}`, ...relatedQueryKeys],
  })
  const history = list(caseData?.Run?.Containment)
  if (history.length === 0) return null
  const rows = history.flatMap((entry) =>
    list(entry.Results).map((row) => ({
      At: entry.At,
      By: entry.By,
      Kind: entry.Kind || 'Containment',
      Action: row.Action,
      Target: row.Target,
      State: row.state,
      Result: row.resultText,
    }))
  )
  return (
    <Section title="Containment history" count={history.length}>
      <Table
        title="Containment history"
        rows={rows}
        columns={['At', 'By', 'Kind', 'Action', 'State', 'Result', 'Target']}
      />
      <Divider sx={{ my: 2 }} />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={1}
        sx={{ alignItems: { md: 'center' } }}
      >
        <TextField
          size="small"
          label="Type the app's display name to release"
          value={confirmation}
          onChange={(event) => setConfirmation(event.target.value)}
          sx={{ minWidth: 320 }}
        />
        <PermissionButton
          requiredPermissions={['Tenant.Application.ReadWrite']}
          variant="outlined"
          onClick={() =>
            releaseCall.mutate({
              url: '/api/ExecNHIRelease',
              data: {
                tenantFilter,
                caseId: caseData?.CaseId,
                Confirmation: confirmation.trim(),
              },
            })
          }
          disabled={!confirmation.trim() || releaseCall.isPending}
        >
          Release: re-enable the app
        </PermissionButton>
      </Stack>
      <CippApiResults apiObject={releaseCall} />
    </Section>
  )
}

/**
 * A completed NHI (app or managed identity) compromise case: the triage header with the level, the
 * evidence behind it and the actions, then every finding set the run collected.
 */
export const CippNhiCaseReport = ({
  caseData,
  tenantFilter,
  onStartNew,
  startPending = false,
  relatedQueryKeys = [],
}) => {
  const { download, busy, lastError } = useBecEvidenceDownload({
    url: '/api/ExecNHIEvidenceExport',
    prefix: 'NHI',
  })
  const score = caseData?.Score || {}
  const subject = caseData?.Subject || {}
  const exposure = caseData?.Exposure || {}
  const applied = list(score.Breakdown).filter((signal) => signal.Applied)
  const appliedCount = (...signals) =>
    applied.filter((signal) => signals.includes(signal.Signal)).length
  const completeness = Object.entries(caseData?.Completeness || {})
  const skipped = completeness.filter(([, marker]) => marker?.Skipped)
  const failed = completeness.filter(
    ([, marker]) => marker && marker.Complete === false && !marker.Skipped
  )
  const flaggedKeys = new Set(caseData?.FlaggedKeyIds || [])

  const credentials = list(exposure.CredentialDetails).map((c) => ({
    ...c,
    Flagged: flaggedKeys.has(c.KeyId),
    Flags: join(c.Flags),
  }))
  const verdicts = list(caseData?.IPVerdicts).map((v) => ({
    ...v,
    Reasons: list(v.Reasons)
      .map(
        (r) =>
          `${r.Text}${r.Weight ? ` (${r.Weight > 0 ? '+' : ''}${r.Weight})` : ''}`
      )
      .join('; '),
    Resources: join(v.Resources),
    KeyIds: join(v.KeyIds),
  }))
  const byCredential = list(caseData?.SignInsByCredential).map((c) => ({
    ...c,
    Flagged: flaggedKeys.has(c.KeyId),
    IPs: join(c.IPs),
  }))
  const changes = list(caseData?.Changes)
  const allActions = list(caseData?.DirectoryActions).map((a) => ({
    ...a,
    Targets: list(a.Targets)
      .map((t) => t.UserPrincipalName || t.DisplayName || t.Id)
      .join(', '),
  }))
  // apps it created, and credentials or owners it put on other apps: a foothold that outlives this app
  const persistence = allActions.filter((a) => a.Kind === 'AppPersistence')
  // permissions and directory roles it gave itself, other apps or users
  const elevation = allActions.filter((a) => a.Kind === 'Elevation')
  const actions = allActions.filter(
    (a) => a.Kind !== 'AppPersistence' && a.Kind !== 'Elevation'
  )
  const workload = caseData?.WorkloadActivity || {}
  const workloadSummary = caseData?.WorkloadSummary || {}
  const mailboxes = list(workload.Mailboxes).map((m) => ({
    ...m,
    Operations: join(m.Operations),
    IPs: join(m.IPs),
  }))
  const sites = list(workload.Sites).map((s) => ({
    ...s,
    Operations: join(s.Operations),
  }))
  const delegated = list(caseData?.DelegatedSignIns).map((u) => ({
    ...u,
    IPs: join(u.IPs),
    Countries: join(u.Countries),
  }))
  const summary = caseData?.SignInSummary || {}
  const baseline = caseData?.Baseline || {}
  const attackerCount = verdicts.filter((v) =>
    ['Compromised', 'LikelyAttacker'].includes(v.Verdict)
  ).length

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={1}>
                <Typography variant="overline" color="text.secondary">
                  Case level
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{ alignItems: 'center' }}
                >
                  <Chip
                    color={NHI_LEVEL_COLOR[score.Level] || 'default'}
                    label={score.Level || 'Unknown'}
                  />
                  <Typography variant="body2" color="text.secondary">
                    evidence {score.EvidenceLevel} ({score.Value}) x impact{' '}
                    {score.Impact}
                    {!score.ImpactKnown &&
                      ' (unknown: the exposure check failed)'}
                  </Typography>
                </Stack>
                <Typography variant="h6">{caseData?.DisplayName}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {subject.IsManagedIdentity
                    ? 'Managed identity'
                    : subject.Ownership || 'App'}{' '}
                  · app id {caseData?.AppId}
                  {subject.VerifiedPublisher
                    ? ` · verified publisher ${subject.VerifiedPublisher}`
                    : ''}
                  {subject.AccountEnabled === false ? ' · disabled' : ''}
                </Typography>
                {subject.AzureResourceId && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ wordBreak: 'break-all' }}
                  >
                    {subject.AzureResourceId}
                  </Typography>
                )}
                <Typography variant="body2">
                  {summary.Total ?? 0} sign-ins in the{' '}
                  {caseData?.AnalysisWindowDays}-day window from{' '}
                  {list(summary.ASNs).length} network(s); {baseline.Total ?? 0}{' '}
                  in the {caseData?.BaselineDays} days before.{' '}
                  {attackerCount > 0 && (
                    <strong>{attackerCount} attacker address(es).</strong>
                  )}
                </Typography>
                <Link
                  component={NextLink}
                  href={`/tenant/administration/applications/enterprise-app?spId=${caseData?.ServicePrincipalId}&tenantFilter=${tenantFilter}`}
                  variant="body2"
                >
                  Open the enterprise app
                </Link>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Typography variant="overline" color="text.secondary">
                Why
              </Typography>
              {applied.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No compromise signal fired.
                </Typography>
              ) : (
                <Stack spacing={0.5}>
                  {applied.map((signal) => (
                    <Typography key={signal.Signal} variant="body2">
                      +{signal.Weight} · {signal.Description}
                      {signal.Count > 1 ? ` (${signal.Count})` : ''}
                    </Typography>
                  ))}
                </Stack>
              )}
              {exposure.Risk && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{ mt: 1 }}
                >
                  Exposure: {exposure.Risk} risk, highest impact{' '}
                  {exposure.HighestImpact || 'Low'} (
                  {exposure.PermissionCount ?? 0} catalogued permissions)
                </Typography>
              )}
              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', mt: 2 }}
                useFlexGap
              >
                <CippNhiContainmentDrawer
                  caseData={caseData}
                  tenantFilter={tenantFilter}
                  relatedQueryKeys={relatedQueryKeys}
                />
                <Button
                  size="small"
                  variant="outlined"
                  onClick={onStartNew}
                  disabled={startPending}
                  startIcon={<CippIcons.Sync />}
                >
                  {startPending ? 'Starting...' : 'Run new investigation'}
                </Button>
                <Button
                  size="small"
                  variant="outlined"
                  onClick={() =>
                    download({
                      CaseId: caseData?.CaseId,
                      Tenant: tenantFilter,
                      DisplayName: caseData?.DisplayName,
                    })
                  }
                  disabled={busy}
                  startIcon={<CippIcons.Archive />}
                >
                  {busy ? 'Exporting...' : 'Download evidence'}
                </Button>
              </Stack>
              {lastError && (
                <Alert severity="error" sx={{ mt: 1 }}>
                  Evidence export: {String(lastError)}
                </Alert>
              )}
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {skipped.length > 0 && (
        <Alert severity="info">
          Not checked:{' '}
          {skipped
            .map(([name, marker]) => `${name} (${marker.Requirement})`)
            .join('; ')}
          .
        </Alert>
      )}
      {failed.length > 0 && (
        <Alert severity="warning">
          Some checks are partial or failed: treat an empty section as
          unconfirmed, not clean:{' '}
          {failed
            .map(
              ([name, marker]) =>
                `${name}: ${marker.Error || `capped at ${marker.Cap}`}`
            )
            .join(' | ')}
        </Alert>
      )}

      <Section
        title="Addresses"
        count={verdicts.length}
        flagged={
          verdicts.filter((v) =>
            ['Compromised', 'LikelyAttacker', 'Suspicious'].includes(v.Verdict)
          ).length
        }
        note="Every address the app signed in or acted from, judged against where it signed in from before the window."
      >
        <Table
          title="Addresses"
          rows={verdicts}
          columns={[
            'IP',
            'Verdict',
            'Score',
            'SuccessfulSignIns',
            'FailedSignIns',
            'Activities',
            'Country',
            'ASName',
            'Reasons',
            'KeyIds',
            'Resources',
          ]}
        />
      </Section>

      <Section
        title="Credentials"
        count={credentials.length}
        flagged={credentials.filter((c) => c.Flagged).length}
        note="Flagged: added in the window, by another app, backdated, or trusting an unrecognised issuer."
      >
        <Table
          title="Credentials"
          rows={credentials}
          columns={[
            'Flagged',
            'Location',
            'Type',
            'DisplayName',
            'KeyId',
            'AddedDateTime',
            'AddedBy',
            'StartDateTime',
            'EndDateTime',
            'LastSignInDateTime',
            'Flags',
            'Issuer',
            'Subject',
          ]}
        />
        <Box sx={{ mt: 2 }}>
          <Table
            title="Sign-ins by credential"
            rows={byCredential}
            columns={[
              'Flagged',
              'KeyId',
              'CredentialType',
              'Count',
              'Success',
              'Failed',
              'First',
              'Last',
              'IPs',
            ]}
          />
        </Box>
      </Section>

      <Section
        title="Changes to the app"
        count={changes.length}
        flagged={changes.filter((c) => c.Flagged && c.InWindow).length}
        note="Every change to the enterprise app and app registration since the baseline began."
      >
        <Table
          title="Changes to the app"
          rows={changes}
          columns={[
            'ActivityDateTime',
            'Activity',
            'Kind',
            'InitiatedBy',
            'InitiatedByType',
            'ByApp',
            'InWindow',
            'Detail',
            'ClientIP',
          ]}
        />
      </Section>

      <Section
        title="Elevation"
        count={elevation.length}
        flagged={
          elevation.filter(
            (a) => a.InWindow && ['High', 'Critical'].includes(a.Impact)
          ).length
        }
        note="Permissions and directory roles this app gave itself, other apps or users, rated by what they allow. Investigate who received them: that access stays after this app is disabled."
      >
        <Table
          title="Elevation"
          rows={elevation}
          columns={[
            'ActivityDateTime',
            'ElevationType',
            'Permission',
            'Impact',
            'Recipient',
            'RecipientName',
            'Result',
            'InWindow',
          ]}
          actions={[
            {
              label: 'Investigate this app',
              icon: <CippIcons.TravelExplore />,
              link: `/tenant/administration/nhi/case?servicePrincipalId=[RecipientId]&tenantFilter=${tenantFilter}&start=true`,
              multiPost: false,
              condition: (row) => row.Recipient === 'App' && !!row.RecipientId,
            },
            {
              label: 'Investigate this user (BEC)',
              icon: <CippIcons.TravelExplore />,
              link: `/identity/administration/bec/case?userId=[RecipientId]&tenantFilter=${tenantFilter}&start=true`,
              multiPost: false,
              condition: (row) => row.Recipient === 'User' && !!row.RecipientId,
            },
          ]}
        />
      </Section>

      <Section
        title="App persistence"
        count={persistence.length}
        flagged={persistence.filter((a) => a.InWindow).length}
        note="Apps this app created, and credentials or owners it added to other apps. Each one can keep access after this app is disabled: investigate those apps too."
      >
        <Table
          title="App persistence"
          rows={persistence}
          columns={[
            'ActivityDateTime',
            'Activity',
            'TargetDisplayName',
            'CreatedApp',
            'Lateral',
            'TargetProtected',
            'Result',
            'InWindow',
          ]}
          actions={[
            {
              label: 'Investigate this app',
              icon: <CippIcons.TravelExplore />,
              link: `/tenant/administration/nhi/case?servicePrincipalId=[TargetServicePrincipalId]&tenantFilter=${tenantFilter}&start=true`,
              multiPost: false,
              condition: (row) => !!row.TargetServicePrincipalId,
            },
          ]}
        />
      </Section>

      <Section
        title="What the app changed in the directory"
        count={actions.length}
        flagged={
          actions.filter((a) => a.InWindow && a.Severity !== 'Info').length
        }
        note="Other directory changes the app itself made."
      >
        <Table
          title="Directory actions"
          rows={actions}
          columns={[
            'ActivityDateTime',
            'Activity',
            'Severity',
            'Targets',
            'Result',
            'InWindow',
          ]}
        />
      </Section>

      <Section
        title="Mail and files the app reached"
        count={mailboxes.length + sites.length}
        flagged={appliedCount(
          'MassMailboxAccess',
          'MassFileAccess',
          'InboxRulesByApp',
          'AttackerWorkload'
        )}
        note={`${workloadSummary.MailboxCount ?? 0} mailbox(es), ${workloadSummary.MailItemCount ?? 0} mail item(s) accessed, ${workloadSummary.SendCount ?? 0} sent, ${workloadSummary.AnonymousLinkCount ?? 0} anonymous link(s) created, ${workloadSummary.FileCount ?? 0} file(s) on ${workloadSummary.SiteCount ?? 0} site(s), ${workloadSummary.RuleCount ?? 0} inbox rule change(s), from the unified audit log. ${caseData?.WorkloadBaseline ? `In the ${caseData?.BaselineDays} days before: ${list(caseData.WorkloadBaseline.Mailboxes).length} mailbox(es) and ${list(caseData.WorkloadBaseline.Sites).length} site(s); only reach beyond those counts as mass access.` : 'What it reached before the window could not be read, so all of it counts.'}`}
      >
        <Stack spacing={2}>
          <Table
            title="Mailboxes"
            rows={mailboxes}
            columns={['Mailbox', 'Count', 'Operations', 'IPs', 'First', 'Last']}
          />
          {sites.length > 0 && (
            <Table
              title="Sites"
              rows={sites}
              columns={['Site', 'Count', 'Operations']}
            />
          )}
          {list(workload.InboxRules).length > 0 && (
            <Table
              title="Inbox rules"
              rows={list(workload.InboxRules)}
              columns={[
                'CreationTime',
                'Operation',
                'Mailbox',
                'ClientIP',
                'Parameters',
              ]}
            />
          )}
        </Stack>
      </Section>

      <Section
        title="Users signing in to the app"
        count={delegated.length}
        flagged={appliedCount('ConsentBurst')}
      >
        <Stack spacing={2}>
          <Table
            title="Users"
            rows={delegated}
            columns={[
              'UserPrincipalName',
              'SignIns',
              'Successful',
              'Interactive',
              'IPs',
              'Countries',
              'First',
              'Last',
            ]}
          />
          {list(caseData?.Consents).length > 0 && (
            <Table
              title="Consents"
              rows={list(caseData?.Consents)}
              columns={['ActivityDateTime', 'User', 'ClientIP']}
            />
          )}
        </Stack>
      </Section>

      <Section
        title="Access and owners"
        count={
          list(caseData?.AppRoleAssignments).length +
          list(caseData?.DelegatedGrants).length +
          list(caseData?.DirectoryRoles).length
        }
        flagged={
          list(caseData?.AppRoleAssignments).filter((a) => a.InWindow).length
        }
        note="What a compromise of this app reaches, and who can add a credential to it."
      >
        <Stack spacing={2}>
          {list(exposure.RiskReasons).length > 0 && (
            <Box>
              {list(exposure.RiskReasons).map((reason) => (
                <Typography key={reason} variant="body2">
                  · {reason}
                </Typography>
              ))}
            </Box>
          )}
          <Table
            title="Application permissions"
            rows={list(caseData?.AppRoleAssignments)}
            columns={[
              'ResourceDisplayName',
              'Permission',
              'CreatedDateTime',
              'InWindow',
            ]}
          />
          {list(caseData?.DelegatedGrants).length > 0 && (
            <Table
              title="Delegated consents"
              rows={list(caseData?.DelegatedGrants)}
              columns={['ConsentType', 'Scope', 'PrincipalId']}
            />
          )}
          {list(caseData?.DirectoryRoles).length > 0 && (
            <Table
              title="Directory roles"
              rows={list(caseData?.DirectoryRoles)}
              columns={['RoleName', 'DirectoryScopeId']}
            />
          )}
          <Table
            title="Owners"
            rows={list(caseData?.Owners)}
            columns={[
              'DisplayName',
              'UserPrincipalName',
              'UserType',
              'IsApp',
              'OwnerOf',
            ]}
          />
        </Stack>
      </Section>

      <Section
        title="Recent sign-ins"
        count={list(caseData?.RecentSignIns).length}
      >
        <Table
          title="Recent sign-ins"
          rows={list(caseData?.RecentSignIns)}
          columns={[
            'CreatedDateTime',
            'IPAddress',
            'IPVerdict',
            'Status',
            'ErrorCode',
            'Resource',
            'KeyId',
            'CredentialType',
            'Country',
            'ASN',
            'AttachedResource',
          ]}
        />
      </Section>

      <ContainmentHistory
        caseData={caseData}
        tenantFilter={tenantFilter}
        relatedQueryKeys={relatedQueryKeys}
      />
    </Stack>
  )
}

export default CippNhiCaseReport
