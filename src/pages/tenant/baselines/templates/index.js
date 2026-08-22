import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Divider,
  FormControlLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  SvgIcon,
  Switch,
  Typography,
} from '@mui/material'
import Link from 'next/link'
import { useState } from 'react'
import {
  AddBox,
  CloudDownload,
  CopyAll,
  Delete,
  Edit,
  GitHub,
  PlayArrow,
  Upgrade,
} from '@mui/icons-material'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from '../tabOptions.json'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippFormTemplateTenantSelector } from '../../../../components/CippComponents/CippFormTemplateTenantSelector'
import { CippOffCanvas } from '../../../../components/CippComponents/CippOffCanvas'
import { CippTemplateCatalog } from '../../../../components/CippComponents/CippTemplateCatalog'
import { describeStageConditions } from '../../../../components/CippBaselines/CippBaselineWhatIfReport'
import { parseCippDate } from '../../../../utils/parse-cipp-date'
import { ApiGetCall, ApiPostCall } from '../../../../api/ApiCall'
import { CippApiResults } from '../../../../components/CippComponents/CippApiResults'

// The API serializes single-element arrays as a bare object; the selector needs a real array.
const asOptionArray = (value) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(
    (entry) => entry && typeof entry === 'object' && entry.value
  )

const Page = () => {
  const pageTitle = 'Baselines'
  const [catalogVisible, setCatalogVisible] = useState(false)
  const [migrateVisible, setMigrateVisible] = useState(false)
  const [migrateSelected, setMigrateSelected] = useState([])
  const [migrateReportOnly, setMigrateReportOnly] = useState(true)
  const [migrateAddDetect, setMigrateAddDetect] = useState(false)
  const integrations = ApiGetCall({
    url: '/api/ListExtensionsConfig',
    queryKey: 'Integrations',
  })
  const migratePreview = ApiPostCall({
    onResult: (result) => {
      // Pre-select everything migratable; skipped/up-to-date rows stay untouched.
      setMigrateSelected(
        (result?.Metadata?.templates ?? [])
          .filter((template) =>
            ['Ready', 'WillUpdate'].includes(template.status)
          )
          .map((template) => template.v2Guid)
      )
    },
  })
  const migrateCommit = ApiPostCall({
    relatedQueryKeys: ['ListBaseline*'],
  })
  const openMigrate = () => {
    setMigrateVisible(true)
    migratePreview.mutate({
      url: '/api/ExecBaselineMigrate',
      data: { action: 'preview' },
    })
  }
  // A finished commit replaces the preview as the list's source, so each row shows
  // what actually happened to it.
  const migrationReport =
    migrateCommit.data?.data?.Metadata ?? migratePreview.data?.data?.Metadata
  const migrationTemplates = Array.isArray(migrationReport?.templates)
    ? migrationReport.templates
    : []
  const migrateStatusChip = {
    Ready: { color: 'info', label: 'Ready' },
    WillUpdate: { color: 'info', label: 'Will update' },
    Migrated: { color: 'success', label: 'Migrated' },
    Updated: { color: 'success', label: 'Updated' },
    UpToDate: { color: 'default', label: 'Up to date' },
    Skipped: { color: 'default', label: 'Skipped' },
    Failed: { color: 'error', label: 'Failed' },
  }

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
      children: ({ formHook, row }) => (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <CippFormTemplateTenantSelector
            formControl={formHook}
            templateTenants={asOptionArray(row.assignments)}
            excludedTenants={asOptionArray(
              row.exclusions ?? row.excludedTenants
            )}
          />
        </Stack>
      ),
      confirmText:
        'Run [templateName] now? Pick a single covered tenant, or All Tenants in Template for the whole assignment. Standards in report-only stages are compared without changes.',
      multiPost: false,
      relatedQueryKeys: ['ListBaseline*'],
    },
    {
      label: 'Save to GitHub',
      type: 'POST',
      url: '/api/ExecCommunityRepo',
      icon: <GitHub />,
      data: { Action: 'UploadBaseline', GUID: 'GUID' },
      fields: [
        {
          label: 'Repository',
          name: 'FullName',
          type: 'select',
          api: {
            url: '/api/ListCommunityRepos',
            data: { WriteAccess: true },
            queryKey: 'CommunityRepos-Write',
            dataKey: 'Results',
            valueField: 'FullName',
            labelField: 'FullName',
          },
          multiple: false,
          creatable: false,
          required: true,
        },
        {
          label: 'Commit Message',
          name: 'Message',
          type: 'textField',
          multiline: true,
          required: true,
          rows: 4,
        },
      ],
      confirmText:
        'Save [templateName] to the selected repository? This uploads the baseline AND every CA/Intune template it references as separate files. Template packages are expanded to their current members, and tenant assignments are replaced with a placeholder.',
      condition: () =>
        integrations.isSuccess && integrations?.data?.GitHub?.Enabled,
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
                label: 'Scheduled Runs',
                value: row.disableScheduledRuns ? 'Disabled' : 'Enabled',
              },
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
                {/* Why tenants in this stage have not advanced: the NEXT stage's
                    graduation conditions. */}
                {stage.stage < occupancy.length &&
                  (row.stages ?? [])[stage.stage] && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block' }}
                    >
                      Tenants advance when{' '}
                      {describeStageConditions(row.stages[stage.stage])}.
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
        <>
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
          <Button
            onClick={() => setCatalogVisible(true)}
            startIcon={
              <SvgIcon fontSize="small">
                <CloudDownload />
              </SvgIcon>
            }
          >
            Browse Catalog
          </Button>
          <Button
            onClick={openMigrate}
            startIcon={
              <SvgIcon fontSize="small">
                <Upgrade />
              </SvgIcon>
            }
          >
            Migrate from Standards
          </Button>
          <CippOffCanvas
            title="Migrate from Standards"
            visible={migrateVisible}
            onClose={() => setMigrateVisible(false)}
            size="lg"
            footer={
              <Stack direction="row" justifyContent="flex-start" spacing={2}>
                <Button
                  variant="contained"
                  disabled={
                    migrateSelected.length === 0 || migrateCommit.isPending
                  }
                  onClick={() =>
                    migrateCommit.mutate({
                      url: '/api/ExecBaselineMigrate',
                      data: {
                        action: 'commit',
                        templateIds: migrateSelected,
                        reportOnly: migrateReportOnly,
                        addDetectStandards: migrateAddDetect,
                      },
                    })
                  }
                >
                  Migrate {migrateSelected.length} template
                  {migrateSelected.length === 1 ? '' : 's'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setMigrateVisible(false)}
                >
                  Close
                </Button>
              </Stack>
            }
          >
            <Stack spacing={2}>
              <Typography variant="body2" color="text.secondary">
                Converts your classic Standards templates (including drift
                templates) into baselines. The originals are never modified -
                both systems keep running until you retire the old one.
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={migrateReportOnly}
                    onChange={(event) =>
                      setMigrateReportOnly(event.target.checked)
                    }
                  />
                }
                label="Import everything as report-only (recommended) - re-enable auto-remediation per standard once you have reviewed the results"
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={migrateAddDetect}
                    onChange={(event) =>
                      setMigrateAddDetect(event.target.checked)
                    }
                  />
                }
                label="Migrated drift templates should also alert on Intune and Conditional Access policies that were not created from a template"
              />
              <CippApiResults apiObject={migrateCommit} />
              {migratePreview.isPending && (
                <Box display="flex" justifyContent="center" py={4}>
                  <CircularProgress />
                </Box>
              )}
              {!migratePreview.isPending && migrationTemplates.length === 0 && (
                <Alert severity="info">
                  No classic Standards templates were found to migrate.
                </Alert>
              )}
              <List sx={{ pt: 0 }}>
                {migrationTemplates.map((template) => {
                  const selectable = ['Ready', 'WillUpdate'].includes(
                    template.status
                  )
                  const chip =
                    migrateStatusChip[template.status] ??
                    migrateStatusChip.Ready
                  return (
                    <ListItem
                      key={template.v2Guid}
                      sx={{
                        border: '1px solid',
                        borderColor: 'divider',
                        borderRadius: 1,
                        mb: 1,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Checkbox
                        checked={migrateSelected.includes(template.v2Guid)}
                        disabled={!selectable}
                        onChange={() =>
                          setMigrateSelected((prev) =>
                            prev.includes(template.v2Guid)
                              ? prev.filter((id) => id !== template.v2Guid)
                              : [...prev, template.v2Guid]
                          )
                        }
                        sx={{ mt: 0.5 }}
                      />
                      <ListItemText
                        disableTypography
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              sx={{ fontWeight: 600 }}
                            >
                              {template.templateName || '(unnamed template)'}
                            </Typography>
                            {template.type === 'drift' && (
                              <Chip
                                label="Drift"
                                size="small"
                                color="warning"
                                variant="outlined"
                              />
                            )}
                            <Chip
                              label={chip.label}
                              size="small"
                              color={chip.color}
                              variant="outlined"
                            />
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {template.standardsCount} standard
                              {template.standardsCount === 1 ? '' : 's'}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box>
                            {(template.tenants ?? []).length > 0 && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                Tenants: {(template.tenants ?? []).join(', ')}
                              </Typography>
                            )}
                            {template.detail && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ display: 'block' }}
                              >
                                {template.detail}
                              </Typography>
                            )}
                            {(template.warnings ?? []).map((warning) => (
                              <Typography
                                key={warning}
                                variant="caption"
                                color="warning.main"
                                sx={{ display: 'block' }}
                              >
                                {warning}
                              </Typography>
                            ))}
                          </Box>
                        }
                      />
                    </ListItem>
                  )
                })}
              </List>
            </Stack>
          </CippOffCanvas>
          <CippOffCanvas
            title="Browse Baseline Catalog"
            visible={catalogVisible}
            onClose={() => setCatalogVisible(false)}
            size="xl"
            footer={
              <Stack direction="row" justifyContent="flex-start" spacing={2}>
                <Button
                  variant="outlined"
                  onClick={() => setCatalogVisible(false)}
                >
                  Close
                </Button>
              </Stack>
            }
          >
            <Box
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                flexGrow: 1,
              }}
            >
              <CippTemplateCatalog
                variant="drawer"
                typeFilter={['BaselineTemplate']}
                relatedQueryKeys={['ListBaseline*']}
              />
            </Box>
          </CippOffCanvas>
        </>
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
