import { Fragment, useMemo, useState } from 'react'
import { Box, Stack } from '@mui/system'
import { Alert, Button, Chip, Link, Typography } from '@mui/material'
import CippButtonCard from '../CippCards/CippButtonCard'
import { CippDataTable } from '../CippTable/CippDataTable'
import { PropertyList } from '../property-list'
import { PropertyListItem } from '../property-list-item'
import { getIconByName } from '../../utils/icon-registry'
import { getBecIntuneDeviceActions } from './CippIntuneDeviceActions.jsx'
import { CippBecPhishingSpreadDialog } from './CippBecPhishingSpreadDialog'
import { CippApiDialog } from './CippApiDialog'
import { useDialog } from '../../hooks/use-dialog'
import {
  BEC_GROUPS,
  becGroupFlagged,
  becFindingFlags,
  becCoverage,
  becWindowStart,
  joinList,
  BEC_FINDING_MARKERS,
} from '../../utils/bec-objectives'

const arr = (value) => (Array.isArray(value) ? value : [])

// The evidence half of the case workspace: every finding, grouped by attacker objective, flagged
// first. A check that could not run (missing licence/permission) is shown as "not checked", never as
// a clean pass. A group with flagged findings opens by default; the triage spine can open and scroll
// to any group. Tables are metadata only, exactly what the collectors returned. What each finding
// shows is data on BEC_GROUPS; only three findings need a renderer of their own (below).
export const CippBecObjectiveGroups = ({
  becData,
  windowDays,
  tenantFilter,
  userData,
  openGroups,
  onToggleGroup,
  groupRefs,
}) => {
  const [spreadOpen, setSpreadOpen] = useState(false)
  const [spread, setSpread] = useState({ sender: '', subject: '' })
  const dismissRiskDialog = useDialog()
  const rowActions = useMemo(
    () => ({
      intune: getBecIntuneDeviceActions({ tenantFilter }),
      // The blast radius: queue a case for each other account an attacker address reached (bulk too).
      investigate: [
        {
          label: 'Investigate',
          type: 'POST',
          url: '/api/ExecBECBulkCheck',
          icon: getIconByName('TravelExplore'),
          data: { UserIds: 'UserId', tenantFilter: `!${tenantFilter}` },
          multiPost: true,
          confirmText:
            'Queue a Business Email Compromise investigation for the selected account(s)? Each case appears on the Business Email Compromise page as it finishes.',
          condition: (row) => !!row.UserId,
        },
      ],
      // Blocking a sender now lives in the containment drawer (tenant-wide, catalog-driven). The one
      // row action left scopes the phishing wave: it pre-fills the spread search with this message's
      // sender and subject and runs it, so "who else got this" is one click.
      received: [
        {
          label: 'Who else got this email?',
          noConfirm: true,
          customFunction: (row) => {
            setSpread({
              sender: row.SenderAddress || '',
              subject: row.Subject || '',
            })
            setSpreadOpen(true)
          },
        },
      ],
    }),
    [tenantFilter]
  )

  const ctx = useMemo(
    () => ({ windowDays, windowStart: becWindowStart(becData, windowDays) }),
    [becData, windowDays]
  )
  const counts = useMemo(
    () => becGroupFlagged(becData, windowDays),
    [becData, windowDays]
  )
  const flags = useMemo(
    () => becFindingFlags(becData, windowDays),
    [becData, windowDays]
  )

  if (!becData) return null

  const completeness = becData.Completeness || {}
  const table = (data, columns, actions) => {
    if (!data || data.length === 0) return null
    // "More Info" per row: the offcanvas renders every field of the record as a full-value property
    // list, so the detail — a rule's whole description, a sign-in's device/app/IP — is one click away
    // instead of a resized column. A row click opens it too. Fields are the union of keys across the rows.
    const extendedInfoFields = [
      ...new Set(data.flatMap((row) => Object.keys(row || {}))),
    ]
    return (
      <Box sx={{ mt: 1 }}>
        <CippDataTable
          noCard
          hideTitle
          data={data}
          simpleColumns={columns}
          actions={actions}
          offCanvas={{ extendedInfoFields }}
          offCanvasOnRowClick
          // On a phone every row is a card and a case page holds many of these lists, so each
          // starts at ten cards and grows on demand instead of the desktop page size.
          mobileCard={{ pageSize: 10 }}
        />
      </Box>
    )
  }
  const muted = (text, sx) => (
    <Typography variant="body2" color="text.secondary" sx={sx}>
      {text}
    </Typography>
  )
  const subHeader = (title) => (
    <Typography variant="subtitle2" sx={{ mt: 2 }}>
      {title}
    </Typography>
  )

  // The three findings whose shape is not tables. Header and coverage note are owned by
  // renderFinding, so these render nothing when the check was skipped or failed.
  const custom = {
    risk: () => {
      const rs = becData.RiskState
      return (
        <>
          {muted(
            rs?.Listed
              ? `Listed as ${rs.RiskState} at ${rs.RiskLevel} risk (${rs.RiskDetail || 'no detail'}).`
              : 'Not listed as risky.'
          )}
          {table(arr(rs?.Detections), [
            'DetectedDateTime',
            'RiskEventType',
            'RiskLevel',
            'RiskState',
            'IPAddress',
            'Country',
            'City',
            'Activity',
          ])}
          {rs?.Listed && userData && (
            <Box sx={{ mt: 1 }}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => dismissRiskDialog.handleOpen()}
              >
                Dismiss risk in Identity Protection
              </Button>
              <CippApiDialog
                title="Dismiss user risk"
                createDialog={dismissRiskDialog}
                api={{
                  url: '/api/ExecDismissRiskyUser',
                  type: 'POST',
                  data: {
                    tenantFilter: `!${tenantFilter}`,
                    userId: 'id',
                    userDisplayName: 'displayName',
                  },
                  confirmText:
                    'Dismiss the Identity Protection risk for [userPrincipalName]? Do this only once the account is contained and the activity explained.',
                }}
                row={userData}
              />
            </Box>
          )}
        </>
      )
    },
    mailboxState: () => {
      const ms = becData.MailboxState
      if (!ms) return null
      const protocols = ['OWA', 'EWS', 'IMAP', 'POP', 'MAPI', 'ActiveSync']
        .filter((p) => ms[`${p}Enabled`] === true)
        .join(', ')
      return (
        <PropertyList>
          <PropertyListItem
            align="horizontal"
            label="Forwarding"
            value={
              ms.HasForwarding
                ? ms.ForwardingSmtpAddress || ms.ForwardingAddress || 'set'
                : 'None'
            }
          />
          <PropertyListItem
            align="horizontal"
            label="Automatic reply"
            value={`${ms.AutoReplyState || 'Unknown'}${
              ms.AutoReplyExternalAudience
                ? ` / ${ms.AutoReplyExternalAudience}`
                : ''
            }`}
          />
          <PropertyListItem
            align="horizontal"
            label="Protocols enabled"
            value={protocols || 'None'}
          />
          <PropertyListItem
            align="horizontal"
            label="SMTP AUTH disabled"
            value={String(ms.SmtpClientAuthenticationDisabled ?? 'Unknown')}
          />
          <PropertyListItem
            align="horizontal"
            label="Mailbox auditing"
            value={String(ms.AuditEnabled ?? 'Unknown')}
          />
        </PropertyList>
      )
    },
    received: () => {
      const findings = arr(becData.ReceivedMailFindings)
      const defender = arr(becData.DefenderDetections).map((r) => ({
        ...r,
        ThreatTypes: joinList(r.ThreatTypes),
      }))
      return (
        <>
          <Box sx={{ mt: 1 }}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => {
                setSpread({ sender: '', subject: '' })
                setSpreadOpen(true)
              }}
            >
              Trace a sender&apos;s spread
            </Button>
          </Box>
          {findings.length === 0 &&
            muted('No phishing-shaped or look-alike senders found.', { mt: 1 })}
          {table(
            findings,
            [
              'Received',
              'FindingType',
              'Severity',
              'SenderAddress',
              'Subject',
              'Reason',
              'Status',
            ],
            rowActions.received
          )}
          {defender.length > 0 &&
            subHeader('Defender for Office 365 detections')}
          {table(defender, [
            'ReceivedDateTime',
            'SenderAddress',
            'Subject',
            'ThreatTypes',
            'DeliveryAction',
            'LatestDeliveryLocation',
            'Delivered',
          ])}
        </>
      )
    },
  }

  // Everything else is data on the finding: a summary line, a warning, the main table, titled
  // sections below it, and the prose for an empty result.
  const generic = (finding) => {
    const rows = finding.rows
      ? arr(finding.rows(becData, ctx))
      : arr(becData[finding.key])
    const sections = arr(finding.sections)
      .map((s) => ({
        ...s,
        title: typeof s.title === 'function' ? s.title(ctx) : s.title,
        rows: arr(s.rows(becData, ctx)),
      }))
      .filter((s) => s.rows.length > 0)
    const summary = finding.summary?.(becData, ctx)
    const alert = finding.alert?.(becData, ctx)
    const nothing = rows.length === 0 && sections.length === 0
    return (
      <>
        {summary && muted(summary)}
        {alert && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {alert}
          </Alert>
        )}
        {nothing && !summary && muted(finding.empty || 'Nothing found.')}
        {table(rows, finding.columns, rowActions[finding.actions])}
        {sections.map((s) => (
          <Fragment key={s.title}>
            {subHeader(s.title)}
            {table(s.rows, s.columns)}
          </Fragment>
        ))}
      </>
    )
  }

  // One coverage note per finding: skipped (missing entitlement) reads as "not checked", a hard
  // failure as "couldn't check", a cap as "partial". A skipped/failed check renders no content, so an
  // empty section is never mistaken for a clean one.
  const coverageOf = (finding) =>
    becCoverage(completeness, BEC_FINDING_MARKERS[finding.key] || [])

  const renderFinding = (finding) => {
    const cov = coverageOf(finding)
    const fl = flags[finding.key]
    // Only suppress content when every check behind the finding was blocked; a finding with some
    // checks still complete (phishing ran, Defender skipped) keeps its content and adds the note.
    const blocked = cov.allBlocked
    return (
      <Box key={finding.key} sx={{ mt: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="subtitle2">{finding.title}</Typography>
          {fl ? (
            <Chip size="small" color="warning" label={`${fl.count} flagged`} />
          ) : cov.allBlocked ? (
            <Chip size="small" variant="outlined" label="not checked" />
          ) : cov.state !== 'ok' ? (
            <Chip size="small" variant="outlined" label="partial" />
          ) : finding.count?.(becData, ctx) > 0 ? (
            <Chip
              size="small"
              variant="outlined"
              label={`${finding.count(becData, ctx)} recorded`}
            />
          ) : (
            <Chip size="small" color="success" label="clear" />
          )}
        </Stack>
        {fl && (
          <Typography
            variant="caption"
            color="warning.main"
            sx={{ display: 'block' }}
          >
            Flagged: {fl.reason}.
          </Typography>
        )}
        {finding.note && (
          <Typography
            variant="caption"
            color="text.secondary"
            sx={{ display: 'block' }}
          >
            {finding.note}
          </Typography>
        )}
        {fl && finding.remediation && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            {finding.remediation.text}
            {finding.remediation.links?.map((link) => (
              <Fragment key={link.label}>
                {' '}
                <Link
                  href={link.href(tenantFilter)}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {link.label}
                </Link>
              </Fragment>
            ))}
          </Alert>
        )}
        {cov.state === 'skipped' &&
          (cov.allBlocked ? (
            <Alert severity="info" sx={{ mt: 1 }}>
              Not checked —{' '}
              {cov.requirement ||
                'a licence, permission, mailbox or service that is not present'}
              . This is not a pass; the result is unknown.
            </Alert>
          ) : (
            <Alert severity="info" sx={{ mt: 1 }}>
              Some checks here could not run (
              {cov.requirement || 'missing a licence, permission or service'});
              the rest is shown below.
            </Alert>
          ))}
        {cov.state === 'failed' && (
          <Alert severity="warning" sx={{ mt: 1 }}>
            Couldn&apos;t check: {cov.error}
          </Alert>
        )}
        {cov.state === 'partial' && (
          <Typography variant="caption" color="text.secondary">
            Partial results — {cov.cap}.
          </Typography>
        )}
        {!blocked &&
          (finding.custom ? custom[finding.custom]?.() : generic(finding))}
      </Box>
    )
  }

  const la = becData.LocationAnalysis

  return (
    <Stack spacing={2}>
      {BEC_GROUPS.map((group) => {
        const flagged = counts[group.id] || 0
        const notChecked = group.findings.filter((f) => {
          const s = coverageOf(f).state
          return s === 'skipped' || s === 'failed'
        }).length
        const GroupIcon = getIconByName(group.icon, { fontSize: 'small' })
        return (
          <Box key={group.id} ref={(el) => (groupRefs.current[group.id] = el)}>
            <CippButtonCard
              variant="outlined"
              component="accordion"
              accordionExpanded={!!openGroups[group.id]}
              onAccordionChange={(exp) => onToggleGroup(group.id, exp)}
              title={
                <Stack
                  direction="row"
                  spacing={2}
                  alignItems="center"
                  justifyContent="space-between"
                  sx={{ width: '100%' }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    {GroupIcon}
                    <Box>{group.title}</Box>
                  </Stack>
                  <Stack direction="row" spacing={0.5} alignItems="center">
                    {flagged > 0 && (
                      <Chip
                        size="small"
                        color="warning"
                        label={`${flagged} flagged`}
                      />
                    )}
                    {notChecked > 0 && (
                      <Chip
                        size="small"
                        variant="outlined"
                        label={`${notChecked} not checked`}
                      />
                    )}
                    {flagged === 0 && notChecked === 0 && (
                      <Chip size="small" color="success" label="clear" />
                    )}
                  </Stack>
                </Stack>
              }
            >
              <Typography variant="body2" color="text.secondary">
                {group.blurb}
              </Typography>
              {group.id === 'access' && la && (
                <Box sx={{ mt: 1 }}>
                  <PropertyList>
                    <PropertyListItem
                      align="horizontal"
                      label="Usage location"
                      value={la.UsageLocation || 'not set'}
                    />
                    <PropertyListItem
                      align="horizontal"
                      label="Sign-in countries"
                      value={
                        arr(la.SignInCountries)
                          .map((c) => `${c.Country} (${c.Count})`)
                          .join(', ') || 'none recorded'
                      }
                    />
                    <PropertyListItem
                      align="horizontal"
                      label="Activity outside usage location"
                      value={`${la.ForeignSuccessfulSignInCount || 0} sign-in(s), ${
                        (la.ForeignRuleChangeCount || 0) +
                        (la.ForeignSafelistChangeCount || 0) +
                        (la.ForeignSharingChangeCount || 0) +
                        (la.ForeignSentMessageCount || 0)
                      } change(s)/send(s)`}
                    />
                  </PropertyList>
                </Box>
              )}
              {group.findings.map(renderFinding)}
            </CippButtonCard>
          </Box>
        )
      })}

      <CippBecPhishingSpreadDialog
        open={spreadOpen}
        onClose={() => setSpreadOpen(false)}
        tenantFilter={tenantFilter}
        defaultSender={spread.sender}
        defaultSubject={spread.subject}
        key={`${spread.sender}|${spread.subject}`}
      />
    </Stack>
  )
}

export default CippBecObjectiveGroups
