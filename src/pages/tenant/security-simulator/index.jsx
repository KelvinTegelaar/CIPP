import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import { useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Collapse,
  Container,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import {
  Timeline,
  TimelineConnector,
  TimelineContent,
  TimelineDot,
  TimelineItem,
  TimelineOppositeContent,
  TimelineSeparator,
} from '@mui/lab'
import { Grid } from '@mui/system'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { TabbedLayout } from '../../../layouts/TabbedLayout'
import tabOptions from './tabOptions.json'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippTimeAgo } from '../../../components/CippComponents/CippTimeAgo'
import CippFormSkeleton from '../../../components/CippFormPages/CippFormSkeleton'
import { CippBaselineAddStandardDialog } from '../../../components/CippBaselines/CippBaselineAddStandardDialog'
import { CippAlertPresetDialog } from '../../../components/CippComponents/CippAlertPresetDialog'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { getCippError } from '../../../utils/get-cipp-error'
import { useSettings } from '../../../hooks/use-settings'
import { useDialog } from '../../../hooks/use-dialog'
import { CippIcons } from '../../../utils/icon-registry'
import { useCraftJobEvents } from '../../../hooks/use-craft-events'
import { fromCraftRun } from '../../../utils/craft-run'

// Scenarios are tests in the Security Simulations suite. The list comes from ListAvailableTests, the
// results from ListTests, and a run is the test engine's own per-test refresh.
const REPORT_ID = 'securitysimulations'
const TEST_PREFIX = 'SecuritySimulation_'
const NAME_PREFIX = 'Security Simulation - '
const asArray = (value) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(
    (entry) => entry !== null && entry !== undefined
  )
const testsQueryKey = (tenant) => `${tenant}-ListTests-${REPORT_ID}`
const parseData = (row) => {
  if (!row?.ResultDataJson) return null
  try {
    return JSON.parse(row.ResultDataJson)
  } catch {
    return null
  }
}

const CATEGORY_ORDER = [
  'Identity & Conditional Access',
  'Audit & Detection',
  'Exchange & Email',
  'SharePoint & Data',
]
const NOT_CHECKED = 'Not checked yet'

const outcomeOf = (row, data) => {
  if (!row) return 'NotRun'
  if (row.Status === 'Passed')
    return data?.summary?.detectionOnly ? 'DetectedOnly' : 'Prevented'
  if (row.Status === 'Failed')
    return data?.summary?.detected ? 'Detected' : 'NotPrevented'
  if (row.Status === 'Skipped') return 'Unlicensed'
  return 'Unknown'
}
const outcomeStyle = {
  Prevented: { text: 'Prevented', color: 'success.main' },
  Detected: { text: 'Alerted, not prevented', color: 'warning.main' },
  DetectedOnly: { text: 'Detected', color: 'success.main' },
  NotPrevented: { text: 'Not prevented', color: 'error.main' },
  Unlicensed: { text: 'Not licensed', color: 'text.disabled' },
  Unknown: { text: 'Could not be evaluated', color: 'warning.main' },
  NotRun: { text: 'Not checked yet', color: 'text.disabled' },
}
const verdictColor = {
  blocked: 'success.main',
  pass: 'success.main',
  partial: 'warning.main',
  allowed: 'error.main',
  fail: 'error.main',
}
const timelineDot = {
  blocked: 'success',
  pass: 'success',
  partial: 'warning',
  allowed: 'error',
  fail: 'error',
}
const fixTypeLabel = {
  standard: 'Standard',
  caTemplate: 'Conditional Access policy',
  alertPreset: 'Alert',
}

const CheckLine = ({ ok, warn, text, note }) => {
  const color = warn ? 'warning.main' : ok ? 'success.main' : 'error.main'
  const mark = warn ? '!' : ok ? '✓' : '✕'
  return (
    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
      <Typography
        variant="body2"
        sx={{ color, fontWeight: 700, width: 14, flexShrink: 0 }}
      >
        {mark}
      </Typography>
      <Typography variant="body2">
        {text}
        {note && (
          <Typography
            component="span"
            variant="body2"
            sx={{ color: 'text.secondary' }}
          >
            {' '}
            · {note}
          </Typography>
        )}
      </Typography>
    </Box>
  )
}

const stepStatus = (step, fixed) => {
  const verdict = fixed ? step.verdictWhenFixed : step.verdict
  if (fixed) {
    if (verdict === 'blocked') return { text: 'Blocked', color: 'success.main' }
    if (verdict === 'pass') return { text: 'Protected', color: 'success.main' }
    if (verdict === 'allowed')
      return { text: 'Still allowed', color: 'error.main' }
    return null
  }
  if (!step.verdictLabel) return null
  return {
    text: step.verdictLabel,
    color: verdictColor[verdict] ?? 'text.secondary',
  }
}

const standardNote = (standard) => {
  if (standard.compliant === true) return null
  if (standard.status === 'Not in a baseline') return 'not in a baseline'
  if (standard.status === 'Drift') return 'drifted'
  return standard.status?.toLowerCase() ?? 'not checked'
}

const PolicyResults = ({ policies }) => {
  const [open, setOpen] = useState(false)
  if (policies.length === 0) return null
  return (
    <Box>
      <Button
        size="small"
        sx={{ px: 0, minWidth: 0 }}
        onClick={() => setOpen((value) => !value)}
      >
        {open ? 'Hide' : 'Show'} the {policies.length} policies evaluated
      </Button>
      <Collapse in={open}>
        <Stack spacing={0.5} sx={{ mt: 0.5 }}>
          {policies.map((policy) => (
            <Typography
              key={policy.displayName}
              variant="body2"
              sx={{
                color: policy.policyApplies ? 'text.primary' : 'text.secondary',
              }}
            >
              {policy.displayName}
              <Typography
                component="span"
                variant="body2"
                sx={{ color: 'text.secondary' }}
              >
                {' '}
                · {policy.result}
              </Typography>
            </Typography>
          ))}
        </Stack>
      </Collapse>
    </Box>
  )
}

const FixAction = ({ fix, onAddStandard, onEnableAlert }) => {
  const router = useRouter()
  const button = (label, onClick) => (
    <Button
      size="small"
      variant="outlined"
      sx={{ whiteSpace: 'nowrap', flexShrink: 0 }}
      onClick={onClick}
    >
      {label}
    </Button>
  )
  if (fix.type === 'standard' && fix.assigned)
    return button('Review', () => router.push('/tenant/baselines/alignment'))
  if (fix.type === 'standard')
    return button('Add to baseline', () => onAddStandard(fix))
  if (fix.type === 'caTemplate')
    return button('Deploy', () =>
      router.push('/tenant/conditional/list-template')
    )
  if (fix.type === 'alertPreset')
    return button('Enable', () => onEnableAlert(fix))
  return null
}

const QUEUE_DONE = ['Completed', 'Failed', 'Completed (with errors)']

// Tests run as a queued background job: poll the queue, then read ListTests past Craft's response cache.
const useTestRefresh = (tenant) => {
  const queryClient = useQueryClient()
  const [queueId, setQueueId] = useState(null)
  const queue = ApiPostCall({})
  const queueConnected = useCraftJobEvents(queueId, (frame) => {
    if (!frame.data) {
      progress.refetch()
      return
    }
    queryClient.setQueryData([`CippQueue-${queueId}`], (old) => [
      { ...(Array.isArray(old) ? old[0] : old), ...fromCraftRun(frame.data) },
    ])
  })
  const progress = ApiGetCall({
    url: '/api/ListCippQueue',
    data: { QueueId: queueId },
    queryKey: `CippQueue-${queueId}`,
    waiting: Boolean(queueId),
    refetchInterval: (query) =>
      QUEUE_DONE.includes(query?.state?.data?.[0]?.Status) || queueConnected
        ? false
        : 10000,
  })
  const status = queueId ? progress.data?.[0] : undefined
  const results = ApiGetCall({
    url: '/api/ListTests',
    data: {
      tenantFilter: tenant,
      reportId: REPORT_ID,
      InvalidateCIPPCache: true,
    },
    queryKey: `${testsQueryKey(tenant)}-${queueId}`,
    waiting: QUEUE_DONE.includes(status?.Status),
  })
  useEffect(() => {
    if (results.isSuccess) {
      queryClient.setQueryData([testsQueryKey(tenant)], results.data)
    }
  }, [results.isSuccess, results.data, tenant, queryClient])

  return {
    start: (testName) =>
      queue
        .mutateAsync({
          url: '/api/ExecTestRefresh',
          data: { tenantFilter: tenant, testName },
        })
        .then((response) =>
          setQueueId(response?.data?.Metadata?.QueueId ?? null)
        )
        .catch(() => {}),
    reset: () => {
      setQueueId(null)
      queue.reset()
    },
    running:
      queue.isPending ||
      (Boolean(queueId) && !results.isSuccess && !results.isError),
    status,
    error: queue.error ?? results.error,
  }
}

const ScenarioRun = ({ tenant, scenario, loadingList, onBack }) => {
  const [mode, setMode] = useState('current')
  const [standardToAdd, setStandardToAdd] = useState(null)
  const [alertToEnable, setAlertToEnable] = useState(null)
  const addStandardDialog = useDialog()
  const alertDialog = useDialog()
  const testId = `${TEST_PREFIX}${scenario.id}`

  const refresh = useTestRefresh(tenant)
  const startRun = () => refresh.start(testId)

  const autoRanRef = useRef(null)
  useEffect(() => {
    setMode('current')
    refresh.reset()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenant, scenario.id])
  useEffect(() => {
    if (loadingList || scenario.row || autoRanRef.current === testId) return
    autoRanRef.current = testId
    startRun()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingList, scenario.row, testId])

  const row = scenario.row
  const data = parseData(row)
  const loading = refresh.running || (loadingList && !row)
  const runFailed = !refresh.running && refresh.status?.FailedTasks > 0
  const steps = asArray(data?.steps)
  const summary = data?.summary
  const fixes = asArray(summary?.fixes)
  const fixed = mode === 'fixed'
  const prevented = fixed ? summary?.preventedWhenFixed : summary?.prevented
  const preventedStep = steps.find(
    (step) =>
      step.id ===
      (fixed ? summary?.preventedWhenFixedAtStep : summary?.preventedAtStep)
  )
  const evaluationFailed = steps.some(
    (step) => step.reached && step.whatIf?.error
  )
  const detectedOnly = summary?.detectionOnly && summary?.detected
  const headline = prevented
    ? `Blocked at "${preventedStep?.title}"`
    : !fixed && detectedOnly
      ? 'Detected: nothing can block this, and an alert fires when it happens'
      : fixed
        ? 'No mapped control stops this chain'
        : evaluationFailed
          ? 'The sign-in could not be evaluated'
          : summary?.detected
            ? 'The attack succeeds, but an alert would fire'
            : 'The attack succeeds, undetected'
  const headlineColor =
    prevented || (!fixed && detectedOnly)
      ? 'success.main'
      : !fixed && evaluationFailed
        ? 'warning.main'
        : 'error.main'
  const subline = data?.scenario?.outcome
    ? prevented
      ? data.scenario.outcome.prevented
      : data.scenario.outcome.notPrevented
    : ''

  const openAddStandard = (fix) => {
    setStandardToAdd(fix.name)
    addStandardDialog.handleOpen()
  }
  const openEnableAlert = (fix) => {
    setAlertToEnable(fix)
    alertDialog.handleOpen()
  }

  return (
    <Stack spacing={3}>
      <Box>
        <Button
          size="small"
          startIcon={<CippIcons.ArrowBack />}
          onClick={onBack}
          sx={{ ml: -1 }}
        >
          All scenarios
        </Button>
      </Box>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography variant="h4">
            {data?.scenario?.title ?? scenario.title}
          </Typography>
          {data?.scenario?.summary && (
            <Typography
              variant="body1"
              sx={{ color: 'text.secondary', mt: 1, maxWidth: 760 }}
            >
              {data.scenario.summary}
            </Typography>
          )}
          {data?.lastRun && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
            >
              {data.identity
                ? `Evaluated as ${data.identity.userPrincipalName} · `
                : ''}
              checked <CippTimeAgo data={data.lastRun} />
              {fixed
                ? ' · assumes every control on the right is in place; sign-in outcomes are the expected results, not a live evaluation'
                : ''}
            </Typography>
          )}
        </Box>
        <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
          {data && (
            <ToggleButtonGroup
              value={mode}
              exclusive
              size="small"
              onChange={(event, newMode) => {
                if (newMode !== null) setMode(newMode)
              }}
              sx={{
                '& .MuiToggleButton-root': {
                  py: 0.5,
                  px: 1.5,
                  fontSize: '0.8125rem',
                },
              }}
            >
              <ToggleButton value="current" aria-label="current state">
                Today
              </ToggleButton>
              <ToggleButton value="fixed" aria-label="with the fixes in place">
                With fixes
              </ToggleButton>
            </ToggleButtonGroup>
          )}
          <Button
            size="small"
            variant="outlined"
            disabled={loading}
            startIcon={
              refresh.running ? (
                <CircularProgress size={14} color="inherit" />
              ) : undefined
            }
            onClick={startRun}
          >
            {refresh.running
              ? refresh.status?.Status === 'Running'
                ? 'Checking'
                : 'Queued'
              : 'Run again'}
          </Button>
        </Stack>
      </Box>

      {refresh.error && (
        <Alert severity="error">{getCippError(refresh.error)}</Alert>
      )}
      {runFailed && (
        <Alert severity="error">
          The check failed on the background worker. See the logbook for the
          error.
        </Alert>
      )}
      {loading && !data && <CippFormSkeleton layout={[1, 3, 1, 1, 1]} />}
      {row && !data && !loading && (
        <Alert severity="warning">
          This scenario has a result without step detail. Run it again.
        </Alert>
      )}
      {data && data.licensed === false && (
        <Alert severity="warning">
          This tenant is not licensed for the capabilities this scenario needs,
          so the live sign-in evaluation was skipped. The standards were still
          checked.
        </Alert>
      )}

      {data && (
        <>
          <Box>
            <Typography
              variant="h5"
              sx={{ color: headlineColor, fontWeight: 700 }}
            >
              {headline}
            </Typography>
            <Typography
              variant="body2"
              sx={{ color: 'text.secondary', maxWidth: 760, mt: 0.5 }}
            >
              {subline}
            </Typography>
          </Box>

          <Grid container spacing={4}>
            <Grid size={{ md: 8, xs: 12 }}>
              <Timeline
                sx={{
                  p: 0,
                  m: 0,
                  [`& .MuiTimelineOppositeContent-root`]: {
                    flex: 0.06,
                    minWidth: 48,
                    pl: 0,
                    pr: 1.5,
                  },
                  [`& .MuiTimelineContent-root`]: { flex: 0.94 },
                }}
              >
                {steps.map((step, index) => {
                  const reached = fixed ? step.reachedWhenFixed : step.reached
                  const verdict = fixed ? step.verdictWhenFixed : step.verdict
                  const status = stepStatus(step, fixed)
                  const whatIf = step.whatIf
                  const triggeredGaps = asArray(whatIf?.gaps).filter(
                    (gap) => gap.triggered
                  )
                  const reportOnly = asArray(whatIf?.reportOnlyWouldStop)
                  const hasChecks =
                    triggeredGaps.length > 0 ||
                    reportOnly.length > 0 ||
                    asArray(step.standards).length > 0 ||
                    asArray(step.alerts).length > 0
                  return (
                    <TimelineItem
                      key={step.id}
                      sx={{ opacity: reached ? 1 : 0.4 }}
                    >
                      <TimelineOppositeContent sx={{ pt: 0.75 }}>
                        <Typography
                          variant="caption"
                          sx={{ color: 'text.secondary' }}
                        >
                          {step.index}
                        </Typography>
                      </TimelineOppositeContent>
                      <TimelineSeparator>
                        <TimelineDot
                          color={timelineDot[verdict] ?? 'grey'}
                          variant={reached ? 'filled' : 'outlined'}
                          sx={{ my: 0.75 }}
                        />
                        {index < steps.length - 1 && <TimelineConnector />}
                      </TimelineSeparator>
                      <TimelineContent sx={{ pt: 0.25, pb: 3.5, pr: 0 }}>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 1.5,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ fontWeight: 600 }}
                          >
                            {step.title}
                          </Typography>
                          {status && (
                            <Typography
                              variant="caption"
                              sx={{ color: status.color, fontWeight: 600 }}
                            >
                              {status.text}
                            </Typography>
                          )}
                          {!reached && (
                            <Typography
                              variant="caption"
                              sx={{ color: 'text.secondary' }}
                            >
                              not reached
                            </Typography>
                          )}
                        </Box>
                        <Typography
                          variant="body2"
                          sx={{
                            color: 'text.secondary',
                            maxWidth: 720,
                            mt: 0.5,
                          }}
                        >
                          {fixed && step.whenFixed ? step.whenFixed : step.text}
                        </Typography>

                        {!fixed && whatIf?.error && (
                          <Typography
                            variant="body2"
                            sx={{ color: 'warning.main', mt: 1 }}
                          >
                            {whatIf.error}
                          </Typography>
                        )}
                        {!fixed && hasChecks && (
                          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                            {triggeredGaps.map((gap) => (
                              <CheckLine
                                key={gap.text}
                                ok={false}
                                text={gap.text}
                              />
                            ))}
                            {reportOnly.length > 0 && (
                              <CheckLine
                                warn
                                text={`A report-only policy would have stopped this sign-in: ${reportOnly.join(', ')}`}
                              />
                            )}
                            {asArray(step.standards).map((standard) => (
                              <CheckLine
                                key={standard.name}
                                ok={standard.compliant === true}
                                warn={standard.compliant === null}
                                text={standard.label}
                                note={standardNote(standard)}
                              />
                            ))}
                            {asArray(step.alerts).map((alert) => (
                              <CheckLine
                                key={alert.operation}
                                ok={alert.configured}
                                text={
                                  alert.configured
                                    ? `An alert watches "${alert.operation}"`
                                    : `Nothing alerts on "${alert.operation}"`
                                }
                              />
                            ))}
                          </Stack>
                        )}
                        {fixed && asArray(step.fixes).length > 0 && (
                          <Stack spacing={0.5} sx={{ mt: 1.5 }}>
                            {asArray(step.fixes).map((fix) => (
                              <CheckLine
                                key={`${fix.type}-${fix.name}`}
                                ok
                                text={
                                  fix.type === 'caTemplate'
                                    ? fix.name
                                    : fix.label
                                }
                              />
                            ))}
                          </Stack>
                        )}
                        {!fixed && whatIf && (
                          <Box sx={{ mt: 1 }}>
                            <PolicyResults
                              policies={asArray(whatIf.policies)}
                            />
                          </Box>
                        )}
                      </TimelineContent>
                    </TimelineItem>
                  )
                })}
              </Timeline>
            </Grid>

            <Grid size={{ md: 4, xs: 12 }}>
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    What closes the gaps
                  </Typography>
                  {fixes.length === 0 && (
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', mt: 1 }}
                    >
                      Every mapped control is already in place.
                    </Typography>
                  )}
                  <Stack divider={<Divider flexItem />} sx={{ mt: 1 }}>
                    {fixes.map((fix) => (
                      <Box
                        key={`${fix.type}-${fix.name}`}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1.5,
                          py: 1.25,
                        }}
                      >
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {fix.type === 'caTemplate' ? fix.name : fix.label}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{ color: 'text.secondary' }}
                          >
                            {fixTypeLabel[fix.type] ?? fix.type} · step{' '}
                            {steps.find((step) => step.id === fix.step)
                              ?.index ?? ''}
                          </Typography>
                        </Box>
                        <FixAction
                          fix={fix}
                          onAddStandard={openAddStandard}
                          onEnableAlert={openEnableAlert}
                        />
                      </Box>
                    ))}
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </>
      )}

      {standardToAdd && (
        <CippBaselineAddStandardDialog
          createDialog={addStandardDialog}
          standardName={standardToAdd}
          relatedQueryKeys={[testsQueryKey(tenant)]}
        />
      )}
      {alertToEnable && (
        <CippAlertPresetDialog
          createDialog={alertDialog}
          tenant={tenant}
          preset={alertToEnable.name}
          operation={alertToEnable.operation}
          logbook={alertToEnable.logbook}
          relatedQueryKeys={[testsQueryKey(tenant)]}
        />
      )}
    </Stack>
  )
}

const ScenarioList = ({
  tenant,
  scenarios,
  loading,
  error,
  onRetry,
  onOpen,
  refreshList,
}) => {
  const [total, setTotal] = useState(0)
  const refresh = useTestRefresh(tenant)
  // Refresh the test list first so a scenario removed since the page loaded is not requested.
  const startAll = async () => {
    const latest = await refreshList()
    const fresh = asArray(latest?.data?.IdentityTests)
      .map((test) => `${test?.id ?? ''}`)
      .filter((id) => id.startsWith(TEST_PREFIX))
    const testIds =
      fresh.length > 0
        ? fresh
        : scenarios.map((scenario) => `${TEST_PREFIX}${scenario.id}`)
    setTotal(testIds.length)
    refresh.start(testIds)
  }
  const done = refresh.status?.CompletedTasks ?? 0
  const failed = refresh.running ? 0 : (refresh.status?.FailedTasks ?? 0)

  const categories = [
    ...CATEGORY_ORDER.filter((category) =>
      scenarios.some((s) => s.category === category)
    ),
    ...[...new Set(scenarios.map((s) => s.category))].filter(
      (c) => !CATEGORY_ORDER.includes(c) && c !== NOT_CHECKED
    ),
    ...(scenarios.some((s) => s.category === NOT_CHECKED) ? [NOT_CHECKED] : []),
  ]
  const checked = scenarios.filter((s) => s.lastRun)
  const lastRun = checked.reduce(
    (max, s) => Math.max(max, Number(s.lastRun) || 0),
    0
  )
  const preventedCount = scenarios.filter(
    (s) => s.outcome === 'Prevented'
  ).length
  const notPreventedCount = scenarios.filter(
    (s) => s.outcome === 'NotPrevented' || s.outcome === 'Detected'
  ).length

  return (
    <Stack spacing={4}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: 2,
          flexWrap: 'wrap',
        }}
      >
        <Box sx={{ flex: 1, minWidth: 280 }}>
          <Typography
            variant="body1"
            sx={{ color: 'text.secondary', maxWidth: 720 }}
          >
            Each scenario is an event that could happen to this tenant. Open one
            to see how it plays out today and what closes each gap. The
            scenarios run with the nightly tests and can be checked again here
            at any time.
          </Typography>
          {scenarios.length > 0 && (
            <Typography
              variant="caption"
              sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
            >
              {checked.length === 0 ? (
                'No scenario has been checked yet.'
              ) : (
                <>
                  Last checked <CippTimeAgo data={lastRun} /> · {preventedCount}{' '}
                  prevented · {notPreventedCount} not prevented
                  {checked.length < scenarios.length
                    ? ` · ${scenarios.length - checked.length} not checked yet`
                    : ''}
                </>
              )}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          size="small"
          disabled={refresh.running || scenarios.length === 0}
          startIcon={
            refresh.running ? (
              <CircularProgress size={14} color="inherit" />
            ) : undefined
          }
          onClick={startAll}
        >
          {refresh.running
            ? `Checked ${done} of ${refresh.status?.TotalTasks ?? total}`
            : 'Run all checks'}
        </Button>
      </Box>
      {refresh.error && (
        <Alert severity="error">{getCippError(refresh.error)}</Alert>
      )}
      {failed > 0 && (
        <Alert severity="warning">
          {failed} of {refresh.status?.TotalTasks ?? total} scenarios could not
          be checked. See the logbook for the errors.
        </Alert>
      )}
      {loading && scenarios.length === 0 && (
        <CippFormSkeleton layout={[1, 1, 1, 1]} />
      )}
      {!loading && scenarios.length === 0 && (
        <Alert
          severity={error ? 'error' : 'info'}
          action={
            <Button color="inherit" size="small" onClick={onRetry}>
              Retry
            </Button>
          }
        >
          {error
            ? 'The scenarios could not be loaded from the API.'
            : 'No scenarios are available.'}
        </Alert>
      )}
      {categories.map((category) => {
        const rows = scenarios.filter((s) => s.category === category)
        return (
          <Box key={category}>
            <Typography
              variant="caption"
              sx={{
                color: 'text.secondary',
                fontWeight: 600,
                letterSpacing: 1,
                textTransform: 'uppercase',
                display: 'block',
                mb: 1,
              }}
            >
              {category}
            </Typography>
            <Card>
              {rows.map((scenario, index) => {
                const style =
                  outcomeStyle[scenario.outcome] ?? outcomeStyle.NotRun
                const detail =
                  scenario.outcome === 'NotPrevented' ||
                  scenario.outcome === 'Detected' ||
                  scenario.outcome === 'Prevented'
                    ? `${style.text}${scenario.fixCount > 0 ? ` · ${scenario.fixCount} gap${scenario.fixCount === 1 ? '' : 's'}` : ''}`
                    : style.text
                return (
                  <Box
                    key={scenario.id}
                    onClick={() => onOpen(scenario.id)}
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1.5,
                      px: 2.25,
                      py: 1.25,
                      cursor: 'pointer',
                      borderBottom: index < rows.length - 1 ? 1 : 0,
                      borderColor: 'divider',
                      '&:hover': { bgcolor: 'action.hover' },
                    }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        flexShrink: 0,
                        bgcolor: style.color,
                      }}
                    />
                    <Typography
                      variant="body1"
                      noWrap
                      sx={{ flex: 1, minWidth: 0 }}
                    >
                      {scenario.title}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: style.color, whiteSpace: 'nowrap' }}
                    >
                      {detail}
                    </Typography>
                  </Box>
                )
              })}
            </Card>
          </Box>
        )
      })}
    </Stack>
  )
}

const Page = () => {
  const pageTitle = 'Security Simulations'
  const router = useRouter()
  const tenant = useSettings().currentTenant
  const scenarioId = router.query.scenario
  const tenantSelected = Boolean(tenant) && tenant !== 'AllTenants'

  const tests = ApiGetCall({
    url: '/api/ListTests',
    data: { tenantFilter: tenant, reportId: REPORT_ID },
    queryKey: testsQueryKey(tenant),
    waiting: tenantSelected,
  })
  const available = ApiGetCall({
    url: '/api/ListAvailableTests',
    queryKey: 'ListAvailableTests',
    waiting: tenantSelected,
  })

  const rows = asArray(tests.data?.TestResults).filter((row) =>
    `${row?.RowKey ?? ''}`.startsWith(TEST_PREFIX)
  )
  const known = asArray(available.data?.IdentityTests).filter((test) =>
    `${test?.id ?? ''}`.startsWith(TEST_PREFIX)
  )
  const ids = [
    ...new Set([
      ...known.map((test) => test.id),
      ...rows.map((row) => row.RowKey),
    ]),
  ]
  const scenarios = ids.map((testId) => {
    const row = rows.find((entry) => entry.RowKey === testId)
    const data = parseData(row)
    const listed = known.find((test) => test.id === testId)
    const title =
      data?.scenario?.title ??
      row?.Name ??
      `${listed?.name ?? testId}`.replace(NAME_PREFIX, '')
    return {
      id: testId.slice(TEST_PREFIX.length),
      title,
      row,
      category: row
        ? row.Category || data?.scenario?.category || NOT_CHECKED
        : NOT_CHECKED,
      outcome: outcomeOf(row, data),
      fixCount: data?.summary?.fixCount ?? 0,
      lastRun: data?.lastRun ?? null,
    }
  })
  const loading =
    (tests.isFetching && rows.length === 0) ||
    (available.isFetching && known.length === 0)
  const selected = scenarioId
    ? (scenarios.find((scenario) => scenario.id === scenarioId) ?? {
        id: scenarioId,
        title: scenarioId,
        row: null,
      })
    : null

  return (
    <>
      <CippHead title={pageTitle} />
      <Container maxWidth={false}>
        <Stack spacing={2}>
          {!tenantSelected && (
            <Alert severity="info">
              Select a tenant to see what an attacker would experience there
              today.
            </Alert>
          )}
          {tenantSelected && selected && (
            <ScenarioRun
              tenant={tenant}
              scenario={selected}
              loadingList={tests.isFetching && !tests.data}
              onBack={() => router.push('/tenant/security-simulator')}
            />
          )}
          {tenantSelected && !selected && (
            <ScenarioList
              tenant={tenant}
              scenarios={scenarios}
              loading={loading}
              error={tests.isError || available.isError}
              onRetry={() => {
                tests.refetch()
                available.refetch()
              }}
              refreshList={() => available.refetch()}
              onOpen={(id) =>
                router.push(
                  `/tenant/security-simulator?scenario=${encodeURIComponent(id)}`
                )
              }
            />
          )}
        </Stack>
      </Container>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
