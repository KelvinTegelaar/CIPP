import {
  Box,
  Button,
  Chip,
  Divider,
  LinearProgress,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { AddBox, CopyAll, Delete, Edit, PlayArrow } from '@mui/icons-material'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from '../tabOptions.json'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { parseCippDate } from '../../../../utils/parse-cipp-date'

const Page = () => {
  const pageTitle = 'Baselines'

  const actions = [
    {
      label: 'Edit Baseline',
      link: '/tenant/baselines/template?id=[GUID]',
      icon: <Edit />,
      color: 'success',
      target: '_self',
    },
    {
      label: 'Clone & Edit Baseline',
      link: '/tenant/baselines/template?id=[GUID]&clone=true',
      icon: <CopyAll />,
      color: 'success',
      target: '_self',
    },
    {
      label: 'Run Baseline Now',
      type: 'POST',
      url: '/api/ExecBaselineRun',
      icon: <PlayArrow />,
      color: 'info',
      data: { mode: '!run', templateId: 'GUID' },
      confirmText:
        'Force a run of [templateName] against its assigned tenants? Standards in report-only stages are compared without changes.',
      multiPost: false,
      relatedQueryKeys: ['ListBaseline*'],
    },
    {
      label: 'Delete Baseline',
      type: 'POST',
      url: '/api/RemoveBaseline',
      icon: <Delete />,
      color: 'error',
      data: { ID: 'GUID' },
      confirmText:
        'Delete [templateName]? Its standards stop being resolved for the assigned tenants on the next run.',
      multiPost: false,
      relatedQueryKeys: ['ListBaseline*'],
    },
  ]

  const offCanvas = {
    size: 'md',
    title: 'Baseline Details',
    contentPadding: 0,
    children: (row) => {
      const occupancy = row.occupancy ?? []
      const totalTenantsInRollout = occupancy.reduce(
        (acc, stage) => acc + stage.tenants.length,
        0
      )
      return (
        <Stack spacing={0}>
          <Stack
            spacing={0}
            divider={<Divider />}
            sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
          >
            {[
              { label: 'Baseline', value: row.templateName },
              { label: 'Description', value: row.description },
              { label: 'Standards', value: row.standardsCount },
              { label: 'Remediation', value: row.remediationPosture },
              {
                label: 'Last Updated',
                value: row.updatedAt
                  ? parseCippDate(row.updatedAt).toLocaleString()
                  : 'N/A',
              },
              { label: 'Updated By', value: row.updatedBy },
            ].map(({ label, value }) => (
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
                  color="text.secondary"
                  sx={{ minWidth: 90 }}
                >
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ textAlign: 'right' }}>
                  {value ?? 'N/A'}
                </Typography>
              </Box>
            ))}
          </Stack>
          <Stack spacing={1.5} sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Stage Progress
            </Typography>
            {/* The offcanvas renders with an empty row until one is selected. */}
            {occupancy.map((stage) => (
              <Box
                key={stage.stage}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Chip
                    variant="outlined"
                    size="small"
                    color={
                      stage.stage === occupancy.length ? 'success' : 'info'
                    }
                    label={`Stage ${stage.stage}: ${stage.name}`}
                  />
                  <Typography variant="caption" color="text.secondary">
                    {stage.tenants.length} tenant
                    {stage.tenants.length === 1 ? '' : 's'} -{' '}
                    {stage.standardsCount} standard
                    {stage.standardsCount === 1 ? '' : 's'}
                  </Typography>
                </Stack>
                <LinearProgress
                  variant="determinate"
                  value={
                    totalTenantsInRollout
                      ? (stage.tenants.length / totalTenantsInRollout) * 100
                      : 0
                  }
                  sx={{ my: 1, borderRadius: 1 }}
                />
                {stage.tenants.length > 0 && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    {stage.tenants.join(', ')}
                  </Typography>
                )}
                {stage.nextAdvanceAt && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    Next time-based advance out of this stage:{' '}
                    {parseCippDate(stage.nextAdvanceAt).toLocaleDateString()}
                  </Typography>
                )}
              </Box>
            ))}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Assigned Tenants
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {(row.assignedTenants ?? []).map((assigned) => (
                <Chip
                  key={assigned}
                  variant="outlined"
                  size="small"
                  label={assigned}
                />
              ))}
            </Stack>
          </Stack>
        </Stack>
      )
    },
  }

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListBaselines"
      tenantInTitle={false}
      actions={actions}
      offCanvas={offCanvas}
      offCanvasOnRowClick={true}
      cardButton={
        <Button
          component={Link}
          href="/tenant/baselines/template"
          startIcon={
            <SvgIcon fontSize="small">
              <AddBox />
            </SvgIcon>
          }
        >
          Add Baseline
        </Button>
      }
      simpleColumns={[
        'baselineName',
        'description',
        'standardsCount',
        'stageNames',
        'assignedTenants',
        'remediationPosture',
        'updatedAt',
        'updatedBy',
      ]}
      queryKey="ListBaselines-table"
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
