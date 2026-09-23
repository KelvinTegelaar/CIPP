import { useMemo } from 'react'
import { Box, Stack, Grid } from '@mui/system'
import { Button, Chip, SvgIcon, Typography } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { CippIcons } from '../../utils/icon-registry'
import CippButtonCard from './CippButtonCard'
import { BECRemediationReportButton } from '../BECRemediationReportButton'
import { CippBecContainmentDrawer } from '../CippComponents/CippBecContainmentDrawer'
import { CippBecIPReviewDrawer } from '../CippComponents/CippBecIPReviewDrawer'
import { CippBecEvidenceExportButton } from '../CippComponents/CippBecEvidenceExportButton'
import {
  becLevelColor,
  becFindingFlags,
  BEC_SIGNAL_GROUP,
  becSkippedChecks,
} from '../../utils/bec-objectives'

// The completed-case triage header: the verdict, why it fired, and what to do — before any
// evidence. The score's own Breakdown is the spine: each applied signal is a row you can click
// to land on the objective group that produced it.
export const CippBecTriageHeader = ({
  userData,
  becData,
  tenantFilter,
  caseId,
  onStartNew,
  startPending = false,
  onJumpToGroup,
  // When the user has more than one run, the case page passes the case switcher here so it takes the
  // header's title spot (in place of the static name/case); otherwise the name and case id show.
  caseSelector,
}) => {
  const score = becData?.Score
  const applied = useMemo(
    () =>
      [...(score?.Breakdown || [])]
        .filter((s) => s.Applied)
        .sort((a, b) => (b.Weight || 0) - (a.Weight || 0)),
    [score]
  )

  // What the findings justify beyond the six default containment steps — shown so the analyst
  // knows the drawer will have targets waiting, not to replace the drawer's own selection.
  const extras = useMemo(() => {
    if (!becData) return []
    const flags = becFindingFlags(becData, becData.AnalysisWindowDays || 7)
    return [
      ['NewRules', 'suspicious inbox rule'],
      ['Delegations', 'flagged delegation'],
      ['UserGrants', 'risky consent'],
      ['TransportRuleChanges', 'risky transport-rule change'],
      ['MailboxAddIns', 'flagged add-in'],
      ['RegisteredDevices', 'new registered device'],
    ]
      .filter(([key]) => flags[key])
      .map(([key, label]) => ({ n: flags[key].count, label }))
  }, [becData])

  const upn = userData?.userPrincipalName
  // becLevelColor can return 'default' (no score); keep a real palette color for the tint/text.
  const lvl = becLevelColor(score?.Level)
  const lvlColor = ['error', 'warning', 'success'].includes(lvl)
    ? lvl
    : 'primary'
  // Checks that couldn't run (missing licence/permission) — surfaced so the score isn't read as a
  // clean bill of health when evidence was simply unavailable.
  const skipped = becData ? becSkippedChecks(becData) : []

  return (
    <CippButtonCard
      variant="outlined"
      title={
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          <Stack
            direction="row"
            spacing={1.5}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            sx={{ minWidth: 0 }}
          >
            {caseSelector ? (
              <Box sx={{ minWidth: 320 }}>{caseSelector}</Box>
            ) : (
              <>
                <Typography variant="h6" sx={{ wordBreak: 'break-all' }}>
                  {userData?.displayName || upn}
                </Typography>
                {caseId && (
                  <Chip
                    size="small"
                    variant="outlined"
                    label={`Case ${caseId}`}
                  />
                )}
              </>
            )}
            {score && (
              <Chip
                color={becLevelColor(score.Level)}
                label={`${score.Level} · ${score.Value}`}
              />
            )}
          </Stack>
        </Stack>
      }
      CardButton={
        // One row of same-size actions. The evidence-export button shows its result (and the ZIP SHA)
        // in a popover anchored to itself rather than an inline panel, so it sits here beside the others
        // without stretching the row.
        <Stack
          direction="row"
          spacing={1}
          flexWrap="wrap"
          useFlexGap
          alignItems="center"
        >
          <Button
            size="small"
            variant="contained"
            onClick={() => onStartNew()}
            disabled={startPending}
            startIcon={
              <SvgIcon fontSize="small">
                <CippIcons.TravelExplore />
              </SvgIcon>
            }
          >
            Run new investigation
          </Button>
          {becData && (
            <CippBecIPReviewDrawer
              tenantFilter={tenantFilter}
              caseId={caseId}
              becData={becData}
            />
          )}
          {becData && (
            <CippBecContainmentDrawer
              userPrincipalName={upn}
              userId={userData?.id}
              tenantFilter={tenantFilter}
              caseId={caseId}
              becData={becData}
              buttonText="Contain user"
            />
          )}
          {becData && (
            <BECRemediationReportButton
              userData={userData}
              becData={becData}
              tenantName={tenantFilter}
            />
          )}
          {becData && caseId && (
            <CippBecEvidenceExportButton
              tenantFilter={tenantFilter}
              caseId={caseId}
              userData={userData}
              becData={becData}
              tenantName={tenantFilter}
            />
          )}
        </Stack>
      }
    >
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 3, md: 2 }}>
          <Box
            sx={{
              borderRadius: 2,
              p: 1.5,
              textAlign: 'center',
              bgcolor: (theme) => alpha(theme.palette[lvlColor].main, 0.12),
            }}
          >
            <Typography variant="caption" color="text.secondary">
              threat score
            </Typography>
            <Typography
              variant="h3"
              color={`${lvlColor}.main`}
              lineHeight={1.1}
            >
              {score?.Value ?? '—'}
            </Typography>
            <Typography variant="subtitle2" color={`${lvlColor}.main`}>
              {score?.Level}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              display="block"
            >
              High ≥ {score?.Thresholds?.High} · Medium ≥{' '}
              {score?.Thresholds?.Medium}
            </Typography>
          </Box>
        </Grid>

        <Grid size={{ xs: 12, sm: 9, md: 6 }}>
          <Typography variant="caption" color="text.secondary">
            Why — {applied.length} of {score?.Breakdown?.length || 0} signals
            fired. A score is a prompt to look, not a verdict; click a signal
            for its evidence.
          </Typography>
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            {applied.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No scoring signals fired. Review the evidence below to confirm.
              </Typography>
            )}
            {applied.map((s) => (
              <Stack
                key={s.Signal}
                direction="row"
                spacing={1}
                alignItems="center"
                onClick={() => onJumpToGroup?.(BEC_SIGNAL_GROUP[s.Signal])}
                sx={{
                  cursor: BEC_SIGNAL_GROUP[s.Signal] ? 'pointer' : 'default',
                  borderRadius: 1,
                  px: 0.5,
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                <Chip
                  size="small"
                  color={s.Weight >= 4 ? 'error' : 'warning'}
                  label={`+${s.Weight}`}
                  sx={{ minWidth: 44 }}
                />
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {s.Description}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {s.Count}
                </Typography>
              </Stack>
            ))}
          </Stack>
          {skipped.length > 0 && (
            <Typography
              variant="caption"
              color="warning.main"
              sx={{ display: 'block', mt: 1 }}
            >
              {skipped.length} check{skipped.length > 1 ? 's' : ''} could not
              run (missing a licence, permission, mailbox or service) — the
              score may be understated.
            </Typography>
          )}
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Typography variant="caption" color="text.secondary">
            Recommended containment
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Reset password, revoke sessions, re-require MFA and disable inbox
            rules are pre-selected in the drawer.
          </Typography>
          {extras.length > 0 && (
            <Stack spacing={0.25} sx={{ mt: 1 }}>
              {extras.map((x) => (
                <Stack
                  key={x.label}
                  direction="row"
                  spacing={0.75}
                  alignItems="center"
                >
                  <SvgIcon fontSize="inherit" color="error">
                    <CippIcons.Add />
                  </SvgIcon>
                  <Typography variant="body2">
                    {x.n} {x.label}
                    {x.n > 1 ? 's' : ''}
                  </Typography>
                </Stack>
              ))}
            </Stack>
          )}
        </Grid>
      </Grid>
    </CippButtonCard>
  )
}

export default CippBecTriageHeader
