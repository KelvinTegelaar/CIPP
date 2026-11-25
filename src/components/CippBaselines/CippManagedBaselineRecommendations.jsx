import { useCallback, useEffect, useMemo } from 'react'
import { Alert, Box, Button, Chip, Stack, Typography } from '@mui/material'
import { useRouter } from 'next/router'
import { ApiGetCall, ApiPostCall } from '../../api/ApiCall'
import { CippApiResults } from '../CippComponents/CippApiResults'
import { CippDataTable } from '../CippTable/CippDataTable'
import { CippIcons } from '../../utils/icon-registry'
import { getCippError } from '../../utils/get-cipp-error'
import { parseCippDate } from '../../utils/parse-cipp-date'
import { isMultiTenant } from '../../utils/tenant-selection'
import { useSettings } from '../../hooks/use-settings'

// The API serializes single-element arrays as a bare object; lists need real arrays.
const asArray = (value) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(
    (entry) => entry !== null && entry !== undefined && entry !== ''
  )

const formatDate = (value) =>
  value ? parseCippDate(value).toLocaleString() : 'N/A'

const showValue = (value) =>
  value === null || value === undefined
    ? 'Not set'
    : typeof value === 'object'
      ? JSON.stringify(value, null, 2)
      : String(value)

const statusFilters = ['Recommended', 'Covered by a baseline'].map(
  (status) => ({
    filterName: status,
    value: [{ id: 'status', value: status }],
    type: 'column',
  })
)

const boxSx = {
  p: 1.5,
  borderRadius: '12px',
  border: '1px solid',
  borderColor: 'divider',
  bgcolor: 'background.paper',
}

const SectionTitle = ({ children }) => (
  <Typography
    variant="caption"
    sx={{
      fontWeight: 600,
      color: 'text.secondary',
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    }}
  >
    {children}
  </Typography>
)

const TextSection = ({ title, text }) =>
  text ? (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {text}
      </Typography>
    </>
  ) : null

const ChipSection = ({ title, values }) =>
  asArray(values).length > 0 ? (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap' }}>
        {asArray(values).map((value) => (
          <Chip key={value} variant="outlined" size="small" label={value} />
        ))}
      </Stack>
    </>
  ) : null

// The table renders this with an empty row until one is selected.
const RecommendationDetails = ({ row }) => (
  <Stack spacing={1.5} sx={{ p: 2 }}>
    <Typography variant="h6">{row.recommendation}</Typography>
    <TextSection title="What It Does" text={row.helpText} />
    <TextSection title="Why We Recommend It" text={row.reason} />
    {asArray(row.differences).length > 0 && (
      <>
        <SectionTitle>Settings That Differ</SectionTitle>
        {asArray(row.differences).map((difference, index) => (
          <Box key={`${difference.Property}-${index}`} sx={boxSx}>
            <Typography variant="subtitle2">{difference.Property}</Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              Recommended: {showValue(difference.ExpectedValue)}
            </Typography>
            <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              Current: {showValue(difference.ReceivedValue)}
            </Typography>
          </Box>
        ))}
      </>
    )}
    <ChipSection title="Frameworks" values={row.frameworks} />
  </Stack>
)

export const CippManagedBaselineRecommendations = () => {
  const router = useRouter()
  // The tenant comes from the tenant selector at the top of the page.
  const currentTenant = useSettings().currentTenant
  const tenant =
    currentTenant && !isMultiTenant(currentTenant) ? currentTenant : null

  const list = ApiGetCall({
    url: '/api/ListManagedBaselineRecommendations',
    data: { tenantFilter: tenant },
    queryKey: `ListManagedBaselineRecommendations-${tenant}`,
    waiting: !!tenant,
    // Follow a running scan until it finishes.
    refetchInterval: (query) =>
      query?.state?.data?.Metadata?.scan?.status === 'Running' ? 10000 : false,
  })
  const related = { relatedQueryKeys: ['ListManagedBaselineRecommendations*'] }
  const scanCall = ApiPostCall(related)
  const generateCall = ApiPostCall(related)

  const post = (call, data) =>
    call.mutate({
      url: '/api/ExecManagedBaselineRecommendation',
      data: { tenantFilter: tenant, ...data },
    })

  const editorLink = `/tenant/baselines/template?recommendation=${encodeURIComponent(tenant ?? '')}`
  useEffect(() => {
    if (generateCall.isSuccess) router.push(editorLink)
  }, [generateCall.isSuccess, editorLink, router])

  const scan = list.data?.Metadata?.scan
  const running = scan?.status === 'Running'
  const finished = formatDate(scan?.finishedDateTime)
  const listError = list.isError ? getCippError(list.error) : null
  // The table re-syncs whenever its data or actions are new objects, so both keep their identity.
  const results = list.data?.Results
  const rows = useMemo(() => asArray(results), [results])
  const recommended = rows.filter((row) => row.status === 'Recommended')
  const generateMutate = generateCall.mutate
  // No rows means every recommended row.
  const generate = useCallback(
    (chosen) =>
      generateMutate({
        url: '/api/ExecManagedBaselineRecommendation',
        data: {
          tenantFilter: tenant,
          Action: 'Generate',
          rows: asArray(chosen).map((row) => row.rowKey),
        },
      }),
    [generateMutate, tenant]
  )
  // On a row it takes that row, as a bulk action it takes the ticked rows.
  const actions = useMemo(
    () => [
      {
        label: 'Generate Baseline for Selection',
        icon: <CippIcons.AddBox />,
        noConfirm: true,
        multiPost: true,
        customFunction: generate,
      },
    ],
    [generate]
  )

  return (
    <Stack spacing={2}>
      {!tenant && (
        <Alert severity="info">
          Choose one tenant in the tenant selector to see its recommendations.
        </Alert>
      )}
      {tenant && (
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            startIcon={<CippIcons.Search />}
            disabled={!tenant || running || scanCall.isPending}
            onClick={() => post(scanCall, { Action: 'Scan' })}
          >
            {running ? `Scanning ${tenant}...` : `Scan ${tenant}`}
          </Button>
        </Stack>
      )}
      <CippApiResults apiObject={scanCall} />
      {listError && <Alert severity="error">{listError}</Alert>}
      {tenant && list.isSuccess && !scan && (
        <Alert severity="info">This tenant has not been scanned yet.</Alert>
      )}
      {running && (
        <Alert severity="info">
          {scan.compared ?? 0} of {scan.total ?? 0} recommendations compared.
        </Alert>
      )}
      {scan?.status === 'Failed' && (
        <Alert severity="error">{scan.error}</Alert>
      )}
      {scan?.status === 'Finished' && (
        <Alert severity="info">
          Last scan {finished}. {scan.newFindings ?? 0} new and{' '}
          {scan.resolvedFindings ?? 0} resolved since the scan before.
        </Alert>
      )}
      {scan && (
        <>
          <CippApiResults apiObject={generateCall} />
          <CippDataTable
            queryKey={`ListManagedBaselineRecommendations-table-${tenant}`}
            title="Recommendations"
            data={rows}
            isFetching={list.isFetching}
            refreshFunction={list}
            filters={statusFilters}
            actions={actions}
            offCanvas={{
              size: 'md',
              title: 'Recommendation',
              contentPadding: 0,
              children: (row) => <RecommendationDetails row={row} />,
            }}
            offCanvasOnRowClick={true}
            cardButton={
              <Button
                startIcon={<CippIcons.AddBox />}
                disabled={recommended.length === 0 || generateCall.isPending}
                onClick={() => generate([])}
              >
                Generate Baseline for All Recommendations ({recommended.length})
              </Button>
            }
            simpleColumns={[
              'recommendation',
              'category',
              'impact',
              'frameworks',
              'status',
              'differsOn',
              'firstSeenDateTime',
            ]}
          />
        </>
      )}
    </Stack>
  )
}
