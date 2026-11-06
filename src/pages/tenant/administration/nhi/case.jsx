import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import {
  Alert,
  Box,
  Button,
  Chip,
  Link,
  Stack,
  Typography,
} from '@mui/material'
import { useQueryClient } from '@tanstack/react-query'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall, ApiPostCall } from '../../../../api/ApiCall'
import { useCraftJobEvents } from '../../../../hooks/use-craft-events'
import { CippHead } from '../../../../components/CippComponents/CippHead'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'
import { CippAutoComplete } from '../../../../components/CippComponents/CippAutocomplete'
import { CippJobProgress } from '../../../../components/CippComponents/CippJobProgress'
import {
  CippNhiCaseReport,
  NHI_LEVEL_COLOR,
} from '../../../../components/CippComponents/CippNhiCaseReport'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import { CippIcons } from '../../../../utils/icon-registry'

// The NHI case workspace: the app's runs, the live progress of a running one, and the completed case.
// Polls ExecNHICheck by case id; nothing starts on load unless the hub sent start=true.
const Page = () => {
  const settings = useSettings()
  const router = useRouter()
  const { servicePrincipalId, caseId: caseIdParam } = router.query
  const tenant = router.query.tenantFilter || settings.currentTenant
  const ready = !!servicePrincipalId
  const [selectedCaseId, setSelectedCaseId] = useState(caseIdParam || null)
  const [startedCaseId, setStartedCaseId] = useState(null)
  const [pollActive, setPollActive] = useState(false)
  const autoStartedRef = useRef(false)
  const lastFinishedRef = useRef(null)
  const runsKey = `ListNHIReports-${tenant}-${servicePrincipalId}`

  useEffect(() => {
    if (caseIdParam) setSelectedCaseId(caseIdParam)
  }, [caseIdParam])

  const runsCall = ApiGetCall({
    url: '/api/ListNHIReports',
    data: { tenantFilter: tenant, servicePrincipalId },
    queryKey: runsKey,
    waiting: ready,
  })
  const runRows = useMemo(
    () => (Array.isArray(runsCall.data) ? runsCall.data : []),
    [runsCall.data]
  )
  const latestRun =
    runRows.find((row) => row.Status !== 'Error') ?? runRows[0] ?? null
  const activeCaseId =
    selectedCaseId ?? startedCaseId ?? latestRun?.CaseId ?? null

  const queryClient = useQueryClient()
  const connected = useCraftJobEvents(
    pollActive ? activeCaseId : null,
    (frame) => {
      const row = frame.data
      if (!row || ['succeeded', 'failed'].includes(row.Status)) {
        pollCall.refetch()
        return
      }
      queryClient.setQueryData([`ExecNHICheck-${activeCaseId}`], (old) =>
        old?.Waiting ? { ...old, Progress: row } : old
      )
    }
  )
  const pollCall = ApiGetCall({
    url: '/api/ExecNHICheck',
    data: { caseId: activeCaseId, tenantFilter: tenant },
    queryKey: `ExecNHICheck-${activeCaseId}`,
    waiting: !!activeCaseId,
    refetchInterval: pollActive ? (connected ? 300000 : 5000) : false,
    staleTime: 0,
  })
  const poll =
    pollCall.data ??
    (pollCall.isError
      ? {
          Waiting: false,
          Error:
            pollCall.error?.response?.data?.Error ||
            pollCall.error?.message ||
            'The case could not be loaded.',
        }
      : undefined)

  useEffect(() => {
    if (activeCaseId) setPollActive(true)
  }, [activeCaseId])
  useEffect(() => {
    if (!poll || !activeCaseId) return
    if (poll.Waiting) {
      setPollActive(true)
      return
    }
    setPollActive(false)
    if (lastFinishedRef.current !== activeCaseId) {
      lastFinishedRef.current = activeCaseId
      runsCall.refetch()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [poll, activeCaseId])

  const startCall = ApiPostCall({ relatedQueryKeys: [runsKey] })
  const startRun = () =>
    startCall.mutate(
      {
        url: '/api/ExecNHICheck',
        data: { tenantFilter: tenant, servicePrincipalId },
      },
      {
        onSuccess: (result) => {
          const caseId = result?.data?.CaseId
          if (!caseId) return
          setSelectedCaseId(null)
          setStartedCaseId(caseId)
        },
      }
    )

  // Arriving from the hub or an app page with start=true: start once, then drop the flag so a refresh does not start another.
  useEffect(() => {
    if (
      router.query.start === 'true' &&
      ready &&
      !autoStartedRef.current &&
      !startCall.isPending
    ) {
      autoStartedRef.current = true
      startRun()
      const { start, ...rest } = router.query
      router.replace({ pathname: router.pathname, query: rest }, undefined, {
        shallow: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.start, ready])

  const caseData = poll && !poll.Waiting && !poll.Error ? poll : null
  const state =
    !ready || runsCall.isLoading
      ? 'loading'
      : !activeCaseId
        ? 'none'
        : !poll
          ? 'loading'
          : poll.Waiting
            ? 'waiting'
            : poll.Error
              ? 'error'
              : 'completed'
  const name =
    caseData?.DisplayName ||
    poll?.DisplayName ||
    latestRun?.DisplayName ||
    servicePrincipalId

  const caseLabel = (row) =>
    [
      row.ExtractedAt ? new Date(row.ExtractedAt).toLocaleString() : row.Status,
      row.Level,
      row.CaseId,
    ]
      .filter(Boolean)
      .join(' · ')

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <CippHead title="NHI case" />
      <Stack spacing={2}>
        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          useFlexGap
        >
          <Link
            component={NextLink}
            href="/tenant/administration/nhi"
            underline="hover"
            variant="body2"
          >
            ← All NHI cases
          </Link>
          {runRows.length > 1 && (
            <Box sx={{ minWidth: 360 }}>
              <CippAutoComplete
                fullWidth
                multiple={false}
                creatable={false}
                disableClearable
                label="Case"
                options={runRows.map((row) => ({
                  label: caseLabel(row),
                  value: row.CaseId,
                }))}
                value={
                  runRows
                    .filter((row) => row.CaseId === activeCaseId)
                    .map((row) => ({
                      label: caseLabel(row),
                      value: row.CaseId,
                    }))[0] ?? null
                }
                onChange={(option) => {
                  if (!option?.value) return
                  setSelectedCaseId(option.value)
                  setStartedCaseId(null)
                  router.replace(
                    {
                      pathname: router.pathname,
                      query: { ...router.query, caseId: option.value },
                    },
                    undefined,
                    { shallow: true }
                  )
                }}
              />
            </Box>
          )}
        </Stack>

        {state === 'completed' && caseData ? (
          <CippNhiCaseReport
            caseData={caseData}
            tenantFilter={tenant}
            onStartNew={startRun}
            startPending={startCall.isPending}
            relatedQueryKeys={[runsKey]}
          />
        ) : (
          <CippButtonCard
            title={
              <Stack direction="row" spacing={1} alignItems="center">
                <span>NHI compromise investigation: {name}</span>
                {state === 'waiting' && (
                  <Chip
                    size="small"
                    color="info"
                    label={
                      poll?.Progress?.Status === 'queued' || !poll?.Progress
                        ? 'Queued'
                        : 'Running'
                    }
                  />
                )}
                {state === 'error' && (
                  <Chip size="small" color="error" label="Failed" />
                )}
                {latestRun?.Level && state === 'none' && (
                  <Chip
                    size="small"
                    color={NHI_LEVEL_COLOR[latestRun.Level]}
                    label={latestRun.Level}
                  />
                )}
              </Stack>
            }
            CardButton={
              <Button
                variant="contained"
                onClick={startRun}
                disabled={
                  state === 'waiting' ||
                  state === 'loading' ||
                  startCall.isPending
                }
                startIcon={<CippIcons.TravelExplore />}
              >
                {startCall.isPending
                  ? 'Starting...'
                  : state === 'error'
                    ? 'Run again'
                    : 'Start investigation'}
              </Button>
            }
          >
            {state === 'loading' && (
              <Typography variant="body2">Loading...</Typography>
            )}
            {state === 'none' && (
              <Typography variant="body2" color="text.secondary">
                This app has not been investigated yet. A run reads its sign-ins
                over the last 7 days against the 23 before, its credentials and
                owners, every change made to it, what it changed in the
                directory and the mail and files it reached. Nothing starts
                until you press the button.
              </Typography>
            )}
            {state === 'waiting' &&
              (poll?.Progress ? (
                <CippJobProgress rows={[poll.Progress]} />
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Waiting for the first status update...
                </Typography>
              ))}
            {state === 'error' && (
              <Stack spacing={1}>
                <Alert severity="error">{poll?.Error}</Alert>
                {poll?.Progress && <CippJobProgress rows={[poll.Progress]} />}
              </Stack>
            )}
          </CippButtonCard>
        )}
        <CippApiResults apiObject={startCall} errorsOnly={true} />
      </Stack>
    </Box>
  )
}

Page.getLayout = (page) => <DashboardLayout usesTenant={false}>{page}</DashboardLayout>

export default Page
