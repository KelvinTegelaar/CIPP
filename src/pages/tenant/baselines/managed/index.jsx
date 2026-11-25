import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Divider,
  Skeleton,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import Link from 'next/link'
import { useState } from 'react'
import { useRouter } from 'next/router'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from '../tabOptions.json'
import { ApiGetCall } from '../../../../api/ApiCall'
import { CippHead } from '../../../../components/CippComponents/CippHead'
import { CippCodeBlock } from '../../../../components/CippComponents/CippCodeBlock'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { CippManagedBaselinesUpgrade } from '../../../../components/CippBaselines/CippManagedBaselinesUpgrade'
import { CippManagedBaselineRequestDrawer } from '../../../../components/CippBaselines/CippManagedBaselineRequestDrawer'
import { CippManagedBaselineGuideTabs } from '../../../../components/CippBaselines/CippManagedBaselineGuide'
import { CippManagedBaselineRecommendations } from '../../../../components/CippBaselines/CippManagedBaselineRecommendations'
import { CippIcons } from '../../../../utils/icon-registry'
import { getCippError } from '../../../../utils/get-cipp-error'
import { parseCippDate } from '../../../../utils/parse-cipp-date'

// The API serializes single-element arrays as a bare object; lists need real arrays.
const asArray = (value) => (Array.isArray(value) ? value : value ? [value] : [])

const formatDate = (value) =>
  value ? parseCippDate(value).toLocaleString() : 'N/A'

const integrationPage =
  '/cipp/integrations/configure?id=CyberDrainManagedBaselines'

const viewOptions = [
  {
    value: 'templates',
    label: 'Managed Baseline Template',
    description:
      'Use a baseline that CyberDrain publishes and keeps up to date.',
    icon: <CippIcons.Description />,
  },
  {
    value: 'custom',
    label: 'Custom Managed Baseline',
    description: 'Have CyberDrain build a custom baseline for your MSP.',
    icon: <CippIcons.Tune />,
  },
  {
    value: 'recommendations',
    label: 'Recommendations',
    description:
      'Scan a tenant against our recommendations and build a baseline from them.',
    icon: <CippIcons.ManageSearch />,
  },
]

const DetailRows = ({ items }) => (
  <Stack
    spacing={0}
    divider={<Divider />}
    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
  >
    {items.map(({ label, value }) => (
      <Box
        key={label}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 2,
          py: 1,
        }}
      >
        <Typography
          variant="body2"
          sx={{ color: 'text.secondary', minWidth: 90 }}
        >
          {label}
        </Typography>
        <Typography variant="body2" sx={{ textAlign: 'right' }}>
          {value ?? 'N/A'}
        </Typography>
      </Box>
    ))}
  </Stack>
)

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

const TextSection = ({ title, text, color }) =>
  text ? (
    <>
      <SectionTitle>{title}</SectionTitle>
      <Typography
        variant="body2"
        sx={{ whiteSpace: 'pre-wrap', color: color ?? 'text.primary' }}
      >
        {text}
      </Typography>
    </>
  ) : null

// The table renders this with an empty row until one is selected.
const TemplateDetails = ({ row }) => (
  <Stack spacing={0}>
    <DetailRows
      items={[
        { label: 'Baseline', value: row.name },
        { label: 'Description', value: row.description },
        { label: 'Standards', value: row.standardsCount },
        { label: 'CyberDrain Version', value: row.version },
        ...(row.imported
          ? [{ label: 'Your Version', value: row.importedVersion }]
          : []),
        {
          label: 'Last Updated',
          value: formatDate(row.updatedAt),
        },
      ]}
    />
    <Stack spacing={1.5} sx={{ p: 2 }}>
      <SectionTitle>Stages</SectionTitle>
      {asArray(row.stages).map((stage, index) => (
        <Box
          key={`${stage.name}-${index}`}
          sx={{
            p: 1.5,
            borderRadius: '12px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Chip
            variant="outlined"
            size="small"
            color="info"
            label={`Stage ${index + 1}: ${stage.name}`}
          />
          <Typography
            variant="caption"
            sx={{ color: 'text.secondary', display: 'block', mt: 1 }}
          >
            {asArray(stage.standards).join(', ')}
          </Typography>
        </Box>
      ))}
    </Stack>
  </Stack>
)

// Shows what was typed, where the request stands, and exactly what was sent to CyberDrain.
const RequestDetails = ({ row }) => {
  const sent = ApiGetCall({
    url: '/api/ListManagedBaselineRequests',
    data: { requestId: row.requestId },
    queryKey: `ManagedBaselineRequest-${row.requestId}`,
    waiting: !!row.requestId,
  })
  const collecting = asArray(row.status).includes('Waiting on data collection')

  return (
    <Stack spacing={0}>
      <DetailRows
        items={[
          { label: 'Snapshot Tenant', value: row.tenantFilter },
          { label: 'Status', value: asArray(row.status).join(', ') },
          ...(collecting
            ? [
                {
                  label: 'Standards Compared',
                  value: `${row.collected ?? 0} of ${row.total ?? 0}`,
                },
              ]
            : []),
          { label: 'Industry', value: row.industry },
          { label: 'Typical Client Size', value: row.clientSize },
          {
            label: 'Frameworks',
            value: asArray(row.frameworks).join(', ') || 'N/A',
          },
          { label: 'Requested', value: formatDate(row.requestedDateTime) },
          { label: 'Requested By', value: row.requestedBy },
          { label: 'Sent to CyberDrain', value: formatDate(row.sentDateTime) },
          {
            label: 'Last Checked',
            value: formatDate(row.lastCheckedDateTime),
          },
          { label: 'Baseline', value: row.baselineName },
        ]}
      />
      <Stack spacing={1.5} sx={{ p: 2 }}>
        <TextSection title="Error" text={row.error} color="error.main" />
        <TextSection title="Notes from CyberDrain" text={row.engineerNotes} />
        <TextSection title="What You Expect" text={row.wants} />
        <TextSection title="Exceptions That Must Exist" text={row.exceptions} />
        <TextSection title="Comments" text={row.comments} />
        <SectionTitle>
          {row.sentDateTime ? 'Sent to CyberDrain' : 'Collected So Far'}
        </SectionTitle>
        {sent.isSuccess ? (
          <CippCodeBlock
            code={JSON.stringify(sent.data?.Results ?? {}, null, 2)}
            language="json"
          />
        ) : (
          <Skeleton variant="rounded" height={120} />
        )}
      </Stack>
    </Stack>
  )
}

const templateActions = [
  {
    label: 'Add to My Baselines',
    type: 'POST',
    url: '/api/ExecManagedBaseline',
    icon: <CippIcons.AddBox />,
    color: 'success',
    data: { Action: '!Import', id: 'id' },
    confirmText:
      'Add [name] to your baselines? It arrives assigned to a placeholder, so nothing runs until you assign tenants in the editor.',
    multiPost: false,
    relatedQueryKeys: ['ListManagedBaseline*', 'ListBaseline*'],
    condition: (row) => row?.imported !== true,
  },
  {
    label: 'Edit Baseline',
    link: '/tenant/baselines/template?id=[baselineGuid]',
    icon: <CippIcons.Edit />,
    color: 'success',
    target: '_self',
    condition: (row) => row?.imported === true,
  },
]

const requestActions = [
  {
    label: 'Review and Confirm',
    link: '/tenant/baselines/template?managedRequest=[requestId]',
    icon: <CippIcons.TaskAlt />,
    color: 'success',
    target: '_self',
    condition: (row) => row?.ready === true,
  },
  {
    label: 'Refresh Status',
    type: 'POST',
    url: '/api/ExecManagedBaselineRequest',
    icon: <CippIcons.Refresh />,
    color: 'info',
    data: { Action: '!Refresh', requestId: 'requestId' },
    confirmText: 'Ask CyberDrain where the request for [tenantFilter] stands?',
    multiPost: false,
    relatedQueryKeys: ['ListManagedBaseline*'],
  },
  {
    label: 'Retry',
    type: 'POST',
    url: '/api/ExecManagedBaselineRequest',
    icon: <CippIcons.Replay />,
    color: 'info',
    data: { Action: '!Retry', requestId: 'requestId' },
    confirmText:
      'Compare [tenantFilter] against every standard again and send the result to CyberDrain?',
    multiPost: false,
    relatedQueryKeys: ['ListManagedBaseline*'],
    condition: (row) => asArray(row?.status).includes('Failed'),
  },
  {
    label: 'Cancel Request',
    type: 'POST',
    url: '/api/ExecManagedBaselineRequest',
    icon: <CippIcons.Cancel />,
    color: 'error',
    data: { Action: '!Cancel', requestId: 'requestId' },
    confirmText:
      'Cancel the request for [tenantFilter]? CyberDrain stops working on it and it is removed from this list.',
    multiPost: false,
    relatedQueryKeys: ['ListManagedBaseline*'],
    condition: (row) => !asArray(row?.status).includes('Implemented'),
  },
]

const Page = () => {
  const pageTitle = 'Managed Baselines'
  const router = useRouter()
  const [chosenView, setView] = useState(null)
  // Deep link: ?view=custom or ?view=recommendations (query is empty until the router is ready).
  const linkedView =
    router.isReady && ['custom', 'recommendations'].includes(router.query.view)
      ? router.query.view
      : 'templates'
  const view = chosenView ?? linkedView

  const integrations = ApiGetCall({
    url: '/api/ListExtensionsConfig',
    queryKey: 'Integrations',
  })
  const loading = !integrations.isSuccess && !integrations.isError
  const extensionOff =
    integrations.isSuccess &&
    integrations.data?.CyberDrainManagedBaselines?.Enabled !== true
  const working = !loading && !extensionOff

  const templates = ApiGetCall({
    url: '/api/ListManagedBaselineTemplates',
    queryKey: 'ListManagedBaselineTemplates',
    waiting: working && view === 'templates',
  })
  const requests = ApiGetCall({
    url: '/api/ListManagedBaselineRequests',
    queryKey: 'ListManagedBaselineRequests',
    waiting: working && view === 'custom',
  })

  if (loading) {
    return (
      <>
        <CippHead title={pageTitle} />
        <Container maxWidth={false}>
          <Skeleton variant="rounded" height={320} />
        </Container>
      </>
    )
  }

  if (extensionOff) {
    return (
      <>
        <CippHead title={pageTitle} />
        <Container maxWidth="xl">
          <CippManagedBaselinesUpgrade />
        </Container>
      </>
    )
  }

  const current =
    view === 'templates' ? templates : view === 'custom' ? requests : {}

  return (
    <>
      <CippHead title={pageTitle} />
      <Container maxWidth={false}>
        <Stack spacing={2}>
          {current.isError && (
            <Alert
              severity="error"
              action={
                <Button
                  component={Link}
                  href={integrationPage}
                  color="inherit"
                  size="small"
                >
                  Open Integration
                </Button>
              }
            >
              {getCippError(current.error)}
            </Alert>
          )}
          <Grid container spacing={2}>
            {viewOptions.map((option) => {
              const isSelected = view === option.value
              return (
                <Grid key={option.value} size={{ xs: 12, md: 4 }}>
                  <Card
                    onClick={() => setView(option.value)}
                    variant="outlined"
                    sx={{
                      cursor: 'pointer',
                      height: '100%',
                      ...(isSelected && {
                        boxShadow: (theme) =>
                          `0px 0px 0px 2px ${theme.palette.primary.main}`,
                      }),
                      '&:hover': {
                        ...(isSelected ? {} : { boxShadow: 8 }),
                      },
                    }}
                  >
                    <CardContent>
                      <Stack
                        direction="row"
                        spacing={2}
                        sx={{ alignItems: 'center' }}
                      >
                        <Avatar
                          variant="rounded"
                          sx={{
                            backgroundColor: 'background.default',
                            borderColor: 'divider',
                            borderStyle: 'solid',
                            borderWidth: 1,
                          }}
                        >
                          <SvgIcon fontSize="small">{option.icon}</SvgIcon>
                        </Avatar>
                        <Stack spacing={1}>
                          <Typography variant="h6">{option.label}</Typography>
                          <Typography sx={{ color: 'text.secondary' }}>
                            {option.description}
                          </Typography>
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              )
            })}
          </Grid>
          {view === 'recommendations' ? (
            <CippManagedBaselineRecommendations />
          ) : view === 'templates' ? (
            <CippDataTable
              queryKey="ListManagedBaselineTemplates-table"
              title="Managed Baseline Templates"
              data={asArray(templates.data?.Results)}
              isFetching={templates.isFetching}
              refreshFunction={templates}
              actions={templateActions}
              offCanvas={{
                size: 'md',
                title: 'Managed Baseline Details',
                contentPadding: 0,
                children: (row) => (
                  <CippManagedBaselineGuideTabs key={row.id} id={row.id}>
                    <TemplateDetails row={row} />
                  </CippManagedBaselineGuideTabs>
                ),
              }}
              offCanvasOnRowClick={true}
              simpleColumns={[
                'name',
                'description',
                'tags',
                'standardsCount',
                'version',
                'updatedAt',
                'status',
              ]}
            />
          ) : (
            <CippDataTable
              queryKey="ListManagedBaselineRequests-table"
              title="Custom Managed Baselines"
              data={asArray(requests.data?.Results)}
              isFetching={requests.isFetching}
              refreshFunction={requests}
              actions={requestActions}
              offCanvas={{
                size: 'md',
                title: 'Custom Baseline Request',
                contentPadding: 0,
                // The guide arrives with the baseline, so there is none before delivery.
                children: (row) =>
                  row.ready === true ||
                  asArray(row.status).includes('Implemented') ? (
                    <CippManagedBaselineGuideTabs
                      key={row.requestId}
                      requestId={row.requestId}
                    >
                      <RequestDetails row={row} />
                    </CippManagedBaselineGuideTabs>
                  ) : (
                    <RequestDetails row={row} />
                  ),
              }}
              offCanvasOnRowClick={true}
              cardButton={<CippManagedBaselineRequestDrawer />}
              simpleColumns={[
                'requestedDateTime',
                'tenantFilter',
                'industry',
                'clientSize',
                'status',
                'lastCheckedDateTime',
                'baselineName',
              ]}
            />
          )}
        </Stack>
      </Container>
    </>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
