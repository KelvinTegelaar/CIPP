import { memo, useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Pagination,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { ApiPostCall } from '../../api/ApiCall'
import { usePermissions } from '../../hooks/use-permissions'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippApiResults } from './CippApiResults'

export const BEC_VERDICT_COLOR = {
  Compromised: 'error',
  LikelyAttacker: 'error',
  Suspicious: 'warning',
  Unknown: 'default',
  LikelyUser: 'success',
  Safe: 'success',
  Service: 'info',
}
export const BEC_VERDICT_LABEL = {
  Compromised: 'Compromised',
  LikelyAttacker: 'Likely attacker',
  Suspicious: 'Suspicious',
  Unknown: 'Unknown',
  LikelyUser: 'Likely user',
  Safe: 'Safe',
  Service: 'Service',
}
const option = (value) => ({ label: value, value })
const OVERRIDE_OPTIONS = ['Auto', 'Safe', 'Suspicious', 'Compromised'].map(
  option
)
const valueOf = (field) => field?.value ?? field
const PAGE_SIZE = 25
const SEARCH_FIELDS = ['IP', 'ASN', 'ASName', 'Org', 'Country', 'City']
const isTrue = (value) => value === true || value === 'True'

// One address: who it is judged to be, and each reason behind the score with its signed weight -
// red pushes towards the attacker, green towards the user.
const VerdictCard = memo(({ verdict, index, formControl, showNote }) => {
  const where = [
    [verdict.City, verdict.Country].filter(Boolean).join(', '),
    verdict.ASN ? `AS${verdict.ASN}` : null,
    verdict.ASName,
    verdict.Org !== verdict.ASName ? verdict.Org : null,
  ]
    .filter(Boolean)
    .join(' · ')
  return (
    <Card variant="outlined">
      <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1}
          alignItems={{ xs: 'stretch', sm: 'flex-start' }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              flexWrap="wrap"
              useFlexGap
            >
              <Typography
                variant="subtitle1"
                sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
              >
                {verdict.IP}
              </Typography>
              <Chip
                size="small"
                color={BEC_VERDICT_COLOR[verdict.Verdict] || 'default'}
                label={BEC_VERDICT_LABEL[verdict.Verdict] || verdict.Verdict}
              />
              <Chip
                size="small"
                variant="outlined"
                label={`Score ${verdict.Score}`}
              />
              {isTrue(verdict.Hosting) && (
                <Chip size="small" variant="outlined" label="Hosting" />
              )}
              {isTrue(verdict.Proxy) && (
                <Chip size="small" variant="outlined" label="Proxy / VPN" />
              )}
            </Stack>
            <Typography
              variant="body2"
              color="text.secondary"
              noWrap
              title={where}
            >
              {where}
            </Typography>
            <Typography variant="caption" color="text.secondary" component="p">
              {verdict.SuccessfulSignIns ?? 0} successful,{' '}
              {verdict.FailedSignIns ?? 0} failed sign-in(s),{' '}
              {verdict.Activities ?? 0} activit(ies)
              {verdict.FirstSeen
                ? ` · ${new Date(verdict.FirstSeen).toLocaleString()} to ${new Date(verdict.LastSeen).toLocaleString()}`
                : ''}
            </Typography>
          </Box>
          <Box sx={{ width: { xs: '100%', sm: 200 }, flexShrink: 0 }}>
            <CippFormComponent
              type="autoComplete"
              name={`Choices.${index}.Verdict`}
              label="Verdict"
              formControl={formControl}
              options={OVERRIDE_OPTIONS}
              multiple={false}
              creatable={false}
              disableClearable
            />
          </Box>
        </Stack>
        {verdict.Source && verdict.Source !== 'Heuristics' && (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            Decided by {verdict.Source}
          </Typography>
        )}
        <Stack spacing={0.5} sx={{ mt: 1 }}>
          {(Array.isArray(verdict.Reasons) ? verdict.Reasons : []).map(
            (reason) => (
              <Stack
                key={`${reason.Code}-${reason.Text}`}
                direction="row"
                spacing={1}
                alignItems="flex-start"
              >
                <Chip
                  size="small"
                  variant="outlined"
                  color={reason.Weight > 0 ? 'error' : 'success'}
                  label={
                    reason.Weight > 0 ? `+${reason.Weight}` : reason.Weight
                  }
                  sx={{ minWidth: 44, height: 20 }}
                />
                <Typography variant="body2">{reason.Text}</Typography>
              </Stack>
            )
          )}
        </Stack>
        {showNote && (
          <Box sx={{ mt: 1 }}>
            <CippFormComponent
              type="textField"
              name={`Choices.${index}.Note`}
              label="Note"
              formControl={formControl}
            />
          </Box>
        )}
      </CardContent>
    </Card>
  )
})
VerdictCard.displayName = 'VerdictCard'

/**
 * Review the IP verdicts of a BEC case: override any address as Safe, Suspicious or Compromised and
 * re-run everything that depends on the verdicts in the background (ExecBECIPReview), with live
 * progress like containment. Optionally the Safe and Compromised choices are also saved to CIPP's IP
 * list for the tenant, so later cases start from them. Rows are form fields keyed by index - an address has dots, which
 * react-hook-form would read as nesting.
 */
export const CippBecIPReviewDrawer = ({
  tenantFilter,
  caseId,
  becData,
  relatedQueryKeys = [],
}) => {
  const [visible, setVisible] = useState(false)
  const verdicts = useMemo(
    () => (Array.isArray(becData?.IPVerdicts) ? becData.IPVerdicts : []),
    [becData]
  )
  const formControl = useForm({ mode: 'onChange' })
  const watched = useWatch({ control: formControl.control })
  const { checkPermissions } = usePermissions()
  const canSaveToList = checkPermissions(['CIPP.AppSettings.ReadWrite'])
  const [search, setSearch] = useState('')
  const [verdictFilter, setVerdictFilter] = useState([])
  const [page, setPage] = useState(1)

  // Rows keep their index in the case's list, which is what the form fields are keyed by.
  const shown = useMemo(() => {
    const term = search.trim().toLowerCase()
    return verdicts
      .map((verdict, index) => ({ verdict, index }))
      .filter(
        ({ verdict }) =>
          (verdictFilter.length === 0 ||
            verdictFilter.includes(verdict.Verdict)) &&
          (!term ||
            SEARCH_FIELDS.some((field) =>
              String(verdict[field] ?? '')
                .toLowerCase()
                .includes(term)
            ))
      )
  }, [verdicts, search, verdictFilter])
  const pageCount = Math.max(1, Math.ceil(shown.length / PAGE_SIZE))
  const currentPage = Math.min(page, pageCount)
  const verdictsPresent = useMemo(
    () => [...new Set(verdicts.map((v) => v.Verdict))],
    [verdicts]
  )
  const filtering = search.trim() !== '' || verdictFilter.length > 0
  const setShown = (value) =>
    shown.forEach(({ index }) =>
      formControl.setValue(`Choices.${index}.Verdict`, option(value))
    )

  // Every open starts from the case's current overrides.
  useEffect(() => {
    if (!visible) return
    const overrides = Array.isArray(becData?.IPOverrides)
      ? becData.IPOverrides
      : []
    const byRange = new Map(overrides.map((o) => [o.Range, o]))
    formControl.reset({
      Choices: verdicts.map((v) => {
        const current = byRange.get(v.IP)
        return {
          Verdict: option(current?.Verdict || 'Auto'),
          Note: current?.Note || '',
        }
      }),
      SaveToList: false,
    })
  }, [visible, becData, verdicts, formControl])

  const choices = useMemo(() => watched?.Choices || [], [watched?.Choices])
  const stored = useMemo(
    () => (Array.isArray(becData?.IPOverrides) ? becData.IPOverrides : []),
    [becData]
  )
  const overrides = useMemo(() => {
    const listed = new Set(verdicts.map((v) => v.IP))
    return [
      ...verdicts
        .map((v, index) => ({
          IP: v.IP,
          Verdict: valueOf(choices[index]?.Verdict) || 'Auto',
          Note: choices[index]?.Note || '',
        }))
        .filter((o) => o.Verdict !== 'Auto'),
      // overrides for ranges the list does not show are kept as they are
      ...stored
        .filter((o) => !listed.has(o.Range))
        .map((o) => ({ IP: o.Range, Verdict: o.Verdict, Note: o.Note || '' })),
    ]
  }, [verdicts, choices, stored])
  // Only a changed verdict is worth a re-run: the same set again would recompute the same case.
  const signature = (list) =>
    list
      .map((o) => `${o.IP ?? o.Range}|${o.Verdict}`)
      .sort()
      .join(';')
  const changed = signature(overrides) !== signature(stored)
  // Auto is what the case already ran with, so a re-run needs at least one address set away from it,
  // and a set that differs from the one already applied.
  const anyDecided = verdicts.some(
    (v, index) => (valueOf(choices[index]?.Verdict) || 'Auto') !== 'Auto'
  )
  const runBlockedReason = !anyDecided
    ? 'Set at least one address to Safe, Suspicious or Compromised to re-run.'
    : !changed
      ? 'These verdicts are already applied to this case.'
      : null

  const reviewCall = ApiPostCall({})
  const trustCall = ApiPostCall({ relatedQueryKeys: ['ListIPWhitelist'] })
  const blockCall = ApiPostCall({ relatedQueryKeys: ['ListIPWhitelist'] })
  const queryClient = useQueryClient()
  const relatedKeysJoined = relatedQueryKeys.join('|')
  const jobProgress = useMemo(
    () => ({
      idField: 'DeploymentId',
      title: 'Review progress',
      url: (id) => `/api/ListOffboardingProgress?DeploymentId=${id}`,
      onComplete: () =>
        [`execBECCheck-polling-${caseId}`, ...relatedKeysJoined.split('|')]
          .filter(Boolean)
          .forEach((key) => queryClient.invalidateQueries({ queryKey: [key] })),
    }),
    [caseId, relatedKeysJoined, queryClient]
  )

  const handleRun = () => {
    reviewCall.mutate({
      url: '/api/ExecBECIPReview',
      data: { tenantFilter, CaseId: caseId, Overrides: overrides },
    })
    if (canSaveToList && watched?.SaveToList) {
      const note = `BEC case ${caseId}`
      const safe = overrides
        .filter((o) => o.Verdict === 'Safe')
        .map((o) => o.IP)
      const bad = overrides
        .filter((o) => o.Verdict === 'Compromised')
        .map((o) => o.IP)
      if (safe.length)
        trustCall.mutate({
          url: `/api/ExecAddTrustedIP?tenantFilter=${tenantFilter}`,
          data: { IP: safe, State: 'Trusted', Note: note },
        })
      if (bad.length)
        blockCall.mutate({
          url: `/api/ExecAddTrustedIP?tenantFilter=${tenantFilter}`,
          data: { IP: bad, State: 'Blocked', Note: note },
        })
    }
  }

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        onClick={() => setVisible(true)}
        startIcon={<CippIcons.GppBad width={20} />}
      >
        Review IPs
      </Button>
      <CippOffCanvas
        title="Review IP addresses"
        visible={visible}
        onClose={() => setVisible(false)}
        size="xl"
        footer={
          <Stack spacing={2}>
            <CippApiResults apiObject={reviewCall} jobProgress={jobProgress} />
            <CippApiResults apiObject={trustCall} errorsOnly />
            <CippApiResults apiObject={blockCall} errorsOnly />
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={1}
              justifyContent="space-between"
              alignItems={{ xs: 'stretch', sm: 'center' }}
            >
              <Box>
                {canSaveToList && (
                  <CippFormComponent
                    type="switch"
                    name="SaveToList"
                    label="Remember for this tenant (CIPP IP list)"
                    formControl={formControl}
                  />
                )}
              </Box>
              <Stack
                alignItems={{ xs: 'stretch', sm: 'flex-end' }}
                spacing={0.5}
              >
                <Button
                  variant="contained"
                  startIcon={<CippIcons.PlayArrow />}
                  onClick={handleRun}
                  disabled={reviewCall.isPending || !!runBlockedReason}
                >
                  Re-run with these verdicts
                </Button>
                {runBlockedReason && (
                  <Typography variant="caption" color="text.secondary">
                    {runBlockedReason}
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Stack>
        }
      >
        <Stack spacing={1.5}>
          <Alert severity="info">
            Set an address to Safe, Suspicious or Compromised to decide it for
            this case; Suspicious keeps it under review without counting it as
            the attacker&apos;s. Auto keeps the calculated verdict the case
            already ran with. The re-run replaces the verdicts, the attacker
            activity, the delegated mailboxes and the score.
          </Alert>
          {verdicts.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              This case has no IP verdicts yet - run a new investigation to
              collect them.
            </Typography>
          )}
          {verdicts.length > 0 && (
            <Stack spacing={1}>
              <TextField
                size="small"
                label="Search address, network, organisation or location"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value)
                  setPage(1)
                }}
              />
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {verdictsPresent.map((value) => {
                  const active = verdictFilter.includes(value)
                  return (
                    <Chip
                      key={value}
                      size="small"
                      clickable
                      color={BEC_VERDICT_COLOR[value] || 'default'}
                      variant={active ? 'filled' : 'outlined'}
                      label={`${BEC_VERDICT_LABEL[value] || value} (${verdicts.filter((v) => v.Verdict === value).length})`}
                      onClick={() => {
                        setVerdictFilter(
                          active
                            ? verdictFilter.filter((v) => v !== value)
                            : [...verdictFilter, value]
                        )
                        setPage(1)
                      }}
                    />
                  )
                })}
              </Stack>
              {filtering && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                >
                  <Typography variant="body2" color="text.secondary">
                    Set all {shown.length} shown to
                  </Typography>
                  {OVERRIDE_OPTIONS.map(({ value }) => (
                    <Button
                      key={value}
                      size="small"
                      variant="outlined"
                      disabled={shown.length === 0}
                      onClick={() => setShown(value)}
                    >
                      {value}
                    </Button>
                  ))}
                </Stack>
              )}
            </Stack>
          )}
          {filtering && shown.length === 0 && (
            <Typography variant="body2" color="text.secondary">
              No address matches the search.
            </Typography>
          )}
          {shown
            .slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE)
            .map(({ verdict, index }) => (
              <VerdictCard
                key={verdict.IP}
                verdict={verdict}
                index={index}
                formControl={formControl}
                showNote={valueOf(choices[index]?.Verdict) !== 'Auto'}
              />
            ))}
          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={currentPage}
              onChange={(_, value) => setPage(value)}
              sx={{ alignSelf: 'center' }}
            />
          )}
        </Stack>
      </CippOffCanvas>
    </>
  )
}

export default CippBecIPReviewDrawer
