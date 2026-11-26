import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  Alert,
  Box,
  Chip,
  Container,
  Divider,
  Link,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import { CippIcons } from '../../../../utils/icon-registry'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import { CippImageCard } from '../../../../components/CippCards/CippImageCard'
import { CippQueryRefreshButton } from '../../../../components/CippComponents/CippQueryRefreshButton'
import { CyberInsuranceReportButton } from '../../../../components/CippPdf/CyberInsuranceReportButton'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { CippHtmlContent } from '../../../../components/CippComponents/CippHtmlContent'
import { markdownStyles } from '../../../../components/CippTestDetail/CippTestDetailOffCanvas'
import { useDialog } from '../../../../hooks/use-dialog'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'
import { PermissionButton } from '../../../../utils/permissions'
import { isMultiTenant, tenantScope } from '../../../../utils/tenant-selection'

const QuestionDetail = ({ row }) => {
  if (!row) return null

  return (
    <Stack spacing={2} sx={{ p: 2 }}>
      <Stack
        direction="row"
        spacing={1}
        useFlexGap
        sx={{
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Typography variant="h6">
          {row.number}. {row.question}
        </Typography>
        <Chip size="small" variant="outlined" label={row.answer} />
        <Chip size="small" variant="outlined" label={row.coverage} />
      </Stack>
      <Divider />
      <Box sx={markdownStyles}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{row.detail}</ReactMarkdown>
      </Box>
      {row.attestation && (
        <>
          <Divider />
          <Typography variant="h6">Customer attestation</Typography>
          <CippHtmlContent html={row.attestation} />
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            Entered by {row.attestedBy} on{' '}
            {new Date(row.attestedDate).toLocaleDateString()}
          </Typography>
        </>
      )}
    </Stack>
  )
}

const attestationDefaults = (row) => ({
  Attestation: (Array.isArray(row) ? row[0] : row)?.attestation ?? '',
})

// Stable empty fallback: CippDataTable syncs its `data` prop by reference.
const EMPTY_ROWS = []

const Page = () => {
  const currentTenant = useSettings().currentTenant
  const syncDialog = useDialog()
  const addQuestionDialog = useDialog()
  const queryKey = `ListCyberInsuranceReport-${currentTenant}`

  const report = ApiGetCall({
    url: '/api/ListCyberInsuranceReport',
    data: { tenantFilter: currentTenant },
    queryKey: queryKey,
    waiting: !!currentTenant && !isMultiTenant(currentTenant),
  })

  const data = report.data ?? {}
  const summary = data.summary ?? {}
  const needsSync = report.isSuccess && !summary.testsRun

  const questionFilters = [
    {
      filterName: 'Verified',
      value: [{ id: 'coverage', value: 'Verified' }],
      type: 'column',
    },
    {
      filterName: 'Partial',
      value: [{ id: 'coverage', value: 'Partial' }],
      type: 'column',
    },
    {
      filterName: 'Attestation',
      value: [{ id: 'coverage', value: 'Attestation' }],
      type: 'column',
    },
  ]

  const questionActions = [
    {
      label: 'Enter attestation',
      type: 'POST',
      url: '/api/ExecCyberInsuranceAttestation',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.PencilIcon />
        </SvgIcon>
      ),
      data: { Id: 'id' },
      fields: [{ type: 'richText', name: 'Attestation', label: 'Attestation' }],
      defaultvalues: attestationDefaults,
      confirmText:
        'Enter the attestation for question [number]: [question]. Name the tool or vendor, what it covers, and any date or value the application asks for. Leave it empty to remove the attestation.',
      relatedQueryKeys: [queryKey],
      multiPost: false,
    },
    {
      label: 'Set to Yes',
      type: 'POST',
      url: '/api/ExecCyberInsuranceAttestation',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.CheckCircleIcon />
        </SvgIcon>
      ),
      data: { Id: 'id', Answer: '!Yes' },
      confirmText: 'Set the answer for question [number]: [question] to Yes?',
      condition: (row) => row.coverage === 'Attestation',
      relatedQueryKeys: [queryKey],
      multiPost: false,
    },
    {
      label: 'Set to No',
      type: 'POST',
      url: '/api/ExecCyberInsuranceAttestation',
      icon: (
        <SvgIcon fontSize="small">
          <CippIcons.XCircleIcon />
        </SvgIcon>
      ),
      data: { Id: 'id', Answer: '!No' },
      confirmText: 'Set the answer for question [number]: [question] to No?',
      condition: (row) => row.coverage === 'Attestation',
      relatedQueryKeys: [queryKey],
      multiPost: false,
    },
  ]

  const questionDetailOffCanvas = {
    size: 'lg',
    children: (row) => <QuestionDetail row={row} />,
  }

  return (
    <Container maxWidth={false} sx={{ flexGrow: 1, py: 2 }}>
      <Grid container spacing={2}>
        {isMultiTenant(currentTenant) ? (
          <Grid size={{ md: 4, xs: 12 }}>
            <CippImageCard
              title="Not supported"
              imageUrl="/assets/illustrations/undraw_website_ij0l.svg"
              text="The Cyber Insurance Readiness report requires a single tenant. Please select a tenant from the dropdown above."
            />
          </Grid>
        ) : (
          <>
            <Grid size={{ md: 12, xs: 12 }}>
              <Stack
                direction="row"
                sx={{
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  mb: 1,
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: 'text.secondary',
                  }}
                >
                  {summary.lastDataRefresh
                    ? `Last data refresh: ${new Date(summary.lastDataRefresh).toLocaleString()}`
                    : ''}
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  sx={{
                    alignItems: 'center',
                  }}
                >
                  <CippQueryRefreshButton
                    queryKeys={[queryKey, `${queryKey}-table`]}
                    isFetching={report.isFetching}
                  />
                  <CyberInsuranceReportButton
                    reportData={data}
                    tenantName={currentTenant}
                  />
                  <PermissionButton
                    requiredPermissions={['Tenant.Reports.ReadWrite']}
                    size="small"
                    variant="outlined"
                    onClick={addQuestionDialog.handleOpen}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <CippIcons.PlusIcon />
                      </SvgIcon>
                    }
                  >
                    Add attestation question
                  </PermissionButton>
                  <PermissionButton
                    requiredPermissions={['Tenant.Tests.ReadWrite']}
                    size="small"
                    variant="outlined"
                    onClick={syncDialog.handleOpen}
                    startIcon={
                      <SvgIcon fontSize="small">
                        <CippIcons.CloudArrowDownIcon />
                      </SvgIcon>
                    }
                  >
                    Sync data
                  </PermissionButton>
                </Stack>
              </Stack>
              {needsSync && (
                <Alert severity="info" sx={{ mb: 1 }}>
                  No report data found for this tenant yet. Click "Sync data" to
                  collect the tenant's data and answer the questions; the report
                  fills in once the sync completes.
                </Alert>
              )}
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippInfoBar
                isFetching={report.isFetching}
                data={[
                  {
                    icon: <CippIcons.CheckCircleIcon />,
                    name: 'Verified: Yes',
                    data: `${summary.yes ?? 0}`,
                    color: 'success',
                  },
                  {
                    icon: <CippIcons.XCircleIcon />,
                    name: 'Verified: No',
                    data: `${summary.no ?? 0}`,
                    color: 'error',
                  },
                  {
                    icon: <CippIcons.ExclamationTriangleIcon />,
                    name: 'Partial',
                    data: `${summary.partial ?? 0}`,
                    color: 'warning',
                  },
                  {
                    icon: <CippIcons.PencilIcon />,
                    name: 'MSP Attestation',
                    data: `${summary.attestation ?? 0}`,
                  },
                ]}
              />
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                This report has been made available to you by{' '}
                <Link
                  href="https://www.beltexins.com/"
                  target="_blank"
                  rel="noreferrer"
                >
                  Beltex Insurance
                </Link>
                .
              </Typography>
            </Grid>
            <Grid size={{ md: 12, xs: 12 }}>
              <CippDataTable
                title="Application Questions"
                queryKey={`${queryKey}-table`}
                isFetching={report.isFetching}
                data={data.questions ?? EMPTY_ROWS}
                refreshFunction={report}
                actions={questionActions}
                filters={questionFilters}
                offCanvas={questionDetailOffCanvas}
                offCanvasOnRowClick={true}
                simpleColumns={[
                  'number',
                  'question',
                  'coverage',
                  'answer',
                  'attestedBy',
                ]}
              />
            </Grid>

            <CippApiDialog
              createDialog={addQuestionDialog}
              title="Add attestation question"
              fields={[
                {
                  type: 'textField',
                  name: 'Question',
                  label: 'Question',
                  validators: { required: 'Enter the question' },
                },
                { type: 'richText', name: 'Attestation', label: 'Attestation' },
              ]}
              api={{
                url: '/api/ExecCyberInsuranceAttestation',
                type: 'POST',
                data: { ...tenantScope(currentTenant) },
                confirmText:
                  "Add a question of your own to this tenant's report and attest to it. It is listed after the application questions and printed in the PDF.",
                relatedQueryKeys: [queryKey],
              }}
            />

            <CippApiDialog
              createDialog={syncDialog}
              title="Sync report data"
              fields={[
                {
                  type: 'radio',
                  name: 'mode',
                  label: 'What would you like to refresh?',
                  defaultValue: 'both',
                  options: [
                    { label: 'Cache & Tests (full refresh)', value: 'both' },
                    {
                      label: 'Cache only (collect tenant data)',
                      value: 'cache',
                    },
                    {
                      label: 'Tests only (re-run against existing cache)',
                      value: 'tests',
                    },
                  ],
                  validators: { required: 'Please select a refresh mode' },
                },
              ]}
              api={{
                url: '/api/ExecTestRun',
                type: 'POST',
                data: { ...tenantScope(currentTenant) },
                confirmText: `Choose what to refresh for ${currentTenant}. A full refresh can take up to 2 hours; tests-only is much faster when the cache is already populated.`,
                relatedQueryKeys: [queryKey],
              }}
            />
          </>
        )}
      </Grid>
    </Container>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
