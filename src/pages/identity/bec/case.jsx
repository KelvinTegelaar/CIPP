import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { Alert, Box, Link, Stack, Typography } from '@mui/material'
import { CippAutoComplete } from '../../../components/CippComponents/CippAutocomplete'
import { Layout as DashboardLayout } from '../../../layouts/index'
import { useSettings } from '../../../hooks/use-settings'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { CippHead } from '../../../components/CippComponents/CippHead'
import { CippBecRunStatusCard } from '../../../components/CippCards/CippBecRunStatusCard'
import { CippBecTriageHeader } from '../../../components/CippCards/CippBecTriageHeader'
import { CippBecObjectiveGroups } from '../../../components/CippComponents/CippBecObjectiveGroups'
import { CippBecTimelineEvaluator } from '../../../components/CippComponents/CippBecTimelineEvaluator'
import { CippBecRemediationHistory } from '../../../components/CippComponents/CippBecRemediationHistory'
import { CippApiResults } from '../../../components/CippComponents/CippApiResults'
import CippButtonCard from '../../../components/CippCards/CippButtonCard'
import { becGroupFlagged, BEC_GROUPS } from '../../../utils/bec-objectives'

// The purpose-built case/remediation workspace. Data contract is unchanged: it polls execBECCheck
// by GUID, shows the async run progress while it runs, and renders the completed results grouped by
// attacker objective with the score as the triage spine. Nothing starts on load.
const Page = () => {
  const settings = useSettings()
  const router = useRouter()
  const { userId, caseId: caseIdParam } = router.query
  const tenant = router.query.tenantFilter || settings.currentTenant

  const ready = !!userId
  const [selectedCaseId, setSelectedCaseId] = useState(caseIdParam || null)
  const [startedCaseId, setStartedCaseId] = useState(null)
  const [pollActive, setPollActive] = useState(false)
  const [openGroups, setOpenGroups] = useState({})
  const groupRefs = useRef({})
  const defaultedFor = useRef(null)
  const lastFinishedRef = useRef(null)
  const autoStartedRef = useRef(false)

  useEffect(() => {
    if (caseIdParam) setSelectedCaseId(caseIdParam)
  }, [caseIdParam])

  const userRequest = ApiGetCall({
    url: '/api/ListUsers',
    data: { UserId: userId, tenantFilter: tenant },
    queryKey: `ListUsers-${userId}`,
    waiting: ready,
  })

  const runsCall = ApiGetCall({
    url: '/api/ListBECReports',
    data: { tenantFilter: tenant, userId: userId },
    queryKey: `ListBECReports-${tenant}-${userId}`,
    waiting: ready,
  })
  const runRows = useMemo(
    () => (Array.isArray(runsCall.data) ? runsCall.data : []),
    [runsCall.data]
  )
  const latestRun = useMemo(
    () => runRows.find((row) => row.Status !== 'Error') ?? runRows[0] ?? null,
    [runRows]
  )
  const activeCaseId =
    selectedCaseId ?? startedCaseId ?? latestRun?.CaseId ?? null

  const becPollingCall = ApiGetCall({
    url: `/api/execBECCheck`,
    data: { GUID: activeCaseId, tenantFilter: tenant },
    queryKey: `execBECCheck-polling-${activeCaseId}`,
    waiting: !!activeCaseId,
    refetchInterval: pollActive ? 5000 : false,
    staleTime: 0,
  })

  useEffect(() => {
    if (activeCaseId) setPollActive(true)
  }, [activeCaseId])
  // A failed poll (a deleted or corrupted case answers 500 with { Error }) is a finished state:
  // show its message and stop polling instead of refetching into a permanent "loading".
  const poll = useMemo(
    () =>
      becPollingCall.data ??
      (becPollingCall.isError
        ? {
            Waiting: false,
            Error:
              becPollingCall.error?.response?.data?.Error ||
              becPollingCall.error?.message ||
              'The case could not be loaded.',
          }
        : undefined),
    [becPollingCall.data, becPollingCall.isError, becPollingCall.error]
  )
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

  const startRunCall = ApiPostCall({
    relatedQueryKeys: [`ListBECReports-${tenant}-${userId}`],
  })
  const startRun = () => {
    startRunCall.mutate(
      {
        url: '/api/execBECCheck',
        data: {
          tenantFilter: tenant,
          userid: userId,
          userName: userRequest.data?.[0]?.userPrincipalName,
        },
      },
      {
        onSuccess: (result) => {
          const guid = result?.data?.GUID
          if (!guid) return
          setSelectedCaseId(null)
          setStartedCaseId(guid)
        },
      }
    )
  }

  // Arriving from the hub's "Start investigation" for a single user: kick the run off once the
  // user (and their UPN) has loaded, then drop the flag so a refresh does not start another.
  useEffect(() => {
    if (
      router.query.start === 'true' &&
      userRequest.data?.[0]?.userPrincipalName &&
      !autoStartedRef.current &&
      !startRunCall.isPending
    ) {
      autoStartedRef.current = true
      startRun()
      const { start, ...rest } = router.query
      router.replace({ pathname: router.pathname, query: rest }, undefined, {
        shallow: true,
      })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router.query.start, userRequest.data])

  const selectRun = useCallback(
    (caseId) => {
      setSelectedCaseId(caseId)
      setStartedCaseId(null)
      router.replace(
        { pathname: router.pathname, query: { ...router.query, caseId } },
        undefined,
        { shallow: true }
      )
    },
    [router]
  )

  const becData = poll && !poll.Waiting && !poll.Error ? poll : null
  const runState =
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
  const windowDays = becData?.AnalysisWindowDays || 7

  // Open the objective groups that have flagged findings once a case's results land.
  useEffect(() => {
    if (!becData || defaultedFor.current === becData.CaseId) return
    defaultedFor.current = becData.CaseId
    const counts = becGroupFlagged(becData, becData.AnalysisWindowDays || 7)
    setOpenGroups(
      BEC_GROUPS.reduce(
        (acc, g) => ({ ...acc, [g.id]: (counts[g.id] || 0) > 0 }),
        {}
      )
    )
  }, [becData])

  const toggleGroup = useCallback((id, exp) => {
    setOpenGroups((o) => (o[id] === exp ? o : { ...o, [id]: exp }))
  }, [])
  const jumpToGroup = useCallback((id) => {
    if (!id) return
    setOpenGroups((o) => ({ ...o, [id]: true }))
    setTimeout(
      () =>
        groupRefs.current[id]?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        }),
      60
    )
  }, [])

  // Genuine data-quality problems (failed or capped) only — skipped-for-entitlement checks are
  // surfaced in the triage caveat and per-finding "not checked" notes, not counted as failures here.
  const incomplete = useMemo(() => {
    const c = becData?.Completeness || {}
    return Object.entries(c).filter(
      ([, m]) => m && m.Complete === false && !m.Skipped
    )
  }, [becData])

  const userData = userRequest.data?.[0]

  // The case switcher, shown only when the user has more than one run. Lives in the triage header's
  // title spot; each option carries the date, level and the case id so it is unambiguous.
  const caseLabel = (row) =>
    [
      row.ExtractedAt ? new Date(row.ExtractedAt).toLocaleString() : row.Status,
      row.Level,
      row.CaseId,
    ]
      .filter(Boolean)
      .join(' · ')
  const caseSelector =
    runRows.length > 1 ? (
      <CippAutoComplete
        fullWidth
        multiple={false}
        creatable={false}
        disableClearable
        label="Case"
        placeholder="Switch case"
        options={runRows.map((row) => ({
          label: caseLabel(row),
          value: row.CaseId,
        }))}
        value={
          runRows
            .filter((row) => row.CaseId === activeCaseId)
            .map((row) => ({ label: caseLabel(row), value: row.CaseId }))[0] ??
          null
        }
        onChange={(newValue) => newValue?.value && selectRun(newValue.value)}
      />
    ) : null

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <CippHead title="BEC case" />
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
            href="/identity/bec"
            underline="hover"
            variant="body2"
          >
            ← All BEC cases
          </Link>
          {userData && (
            <Typography variant="body2" color="text.secondary">
              {userData.userPrincipalName}
            </Typography>
          )}
        </Stack>

        {runState === 'completed' && becData ? (
          <CippBecTriageHeader
            userData={userData}
            becData={becData}
            tenantFilter={tenant}
            caseId={becData?.CaseId || activeCaseId}
            onStartNew={startRun}
            startPending={startRunCall.isPending}
            onJumpToGroup={jumpToGroup}
            caseSelector={caseSelector}
          />
        ) : (
          <CippBecRunStatusCard
            userPrincipalName={userData?.userPrincipalName}
            userId={userData?.id}
            tenantFilter={tenant}
            state={runState}
            caseId={activeCaseId}
            poll={poll}
            becData={becData}
            onStart={startRun}
            startPending={startRunCall.isPending}
            windowDays={windowDays}
          />
        )}
        <CippApiResults apiObject={startRunCall} errorsOnly={true} />

        {becData && incomplete.length > 0 && (
          <Alert severity="warning">
            Some checks are partial or failed — treat an empty section here as
            unconfirmed, not clean:{' '}
            {incomplete
              .map(([name, m]) => `${name}: ${m.Error || `capped at ${m.Cap}`}`)
              .join(' | ')}
          </Alert>
        )}

        {becData && (
          <CippBecObjectiveGroups
            becData={becData}
            windowDays={windowDays}
            tenantFilter={tenant}
            userData={userData}
            openGroups={openGroups}
            onToggleGroup={toggleGroup}
            groupRefs={groupRefs}
          />
        )}

        {becData && <CippBecRemediationHistory becData={becData} />}

        {becData && (
          <CippButtonCard
            variant="outlined"
            component="accordion"
            accordionExpanded={true}
            title="Attack timeline"
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              The correlated events of this case over time, with the likely
              start of compromise marked.
            </Typography>
            <CippBecTimelineEvaluator
              becData={becData}
              windowDays={windowDays}
              userData={userData}
            />
          </CippButtonCard>
        )}
      </Stack>
    </Box>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
