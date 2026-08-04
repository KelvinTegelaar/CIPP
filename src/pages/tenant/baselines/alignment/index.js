import {
  Box,
  Button,
  Chip,
  Container,
  Divider,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import {
  BuildingOfficeIcon,
  CheckBadgeIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import {
  ArrowForward,
  CheckCircle,
  Compare,
  Edit,
  LayersClear,
  PlayArrow,
  RemoveCircle,
  TaskAlt,
  Tune,
  VolumeOff,
} from '@mui/icons-material'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from '../tabOptions.json'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { CippHead } from '../../../../components/CippComponents/CippHead'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import CippBaselineWhatIfReport, {
  describeStageConditions,
} from '../../../../components/CippBaselines/CippBaselineWhatIfReport'
import CippBaselineStandardSettings, {
  variableValuesFromExpected,
} from '../../../../components/CippBaselines/CippBaselineStandardSettings'
import { useDialog } from '../../../../hooks/use-dialog'
import { useSettings } from '../../../../hooks/use-settings'
import { ApiGetCall } from '../../../../api/ApiCall'
import { parseCippDate } from '../../../../utils/parse-cipp-date'

const deviationColors = {
  Compliant: 'success',
  Accepted: 'info',
  Detected: 'error',
  Suppressed: 'warning',
  'License Missing': 'default',
  'No Data': 'default',
}

const propertyList = (properties) => (
  <Stack
    spacing={0}
    divider={<Divider />}
    sx={{ borderBottom: '1px solid', borderColor: 'divider' }}
  >
    {properties.map(({ label, value, color }) => (
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
        {color ? (
          <Chip
            variant="outlined"
            label={value ?? 'N/A'}
            size="small"
            color={color}
          />
        ) : (
          <Typography variant="body2" sx={{ textAlign: 'right' }}>
            {value ?? 'N/A'}
          </Typography>
        )}
      </Box>
    ))}
  </Stack>
)

const jsonBox = (value, isCompliant) => (
  <Box
    sx={{
      p: 1.5,
      bgcolor: isCompliant ? 'success.lighter' : 'error.lighter',
      borderRadius: '12px',
      border: '2px solid',
      borderColor: isCompliant ? 'success.main' : 'error.main',
    }}
  >
    <Typography
      variant="body2"
      sx={{
        fontFamily: 'monospace',
        fontSize: '0.8125rem',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
        color: isCompliant ? 'success.dark' : 'error.dark',
      }}
    >
      {JSON.stringify(value, null, 2)}
    </Typography>
  </Box>
)

const Page = () => {
  const pageTitle = 'Baseline Alignment'
  const currentTenant = useSettings().currentTenant
  const [viewMode, setViewMode] = useState('tenant')
  const [advanceTarget, setAdvanceTarget] = useState(null)
  const advanceDialog = useDialog()
  const [triageTarget, setTriageTarget] = useState(null)
  const triageDialog = useDialog()
  const [overrideTarget, setOverrideTarget] = useState(null)
  const overrideDialog = useDialog()
  const [acceptPathTarget, setAcceptPathTarget] = useState(null)
  const acceptPathDialog = useDialog()
  const [removeOverrideTarget, setRemoveOverrideTarget] = useState(null)
  const removeOverrideDialog = useDialog()
  const isTenantView = viewMode === 'tenant'
  const isTemplateView = viewMode === 'template'

  // Refetch everything baseline-related after any triage/run/override action:
  // the wildcard invalidates every ListBaseline* query, including the '-table'
  // keys the table instances register.
  const relatedQueryKeys = ['ListBaseline*']

  const resolvedApi = ApiGetCall({
    url: '/api/ListBaselineAlignment',
    data: { tenantFilter: currentTenant },
    queryKey: `ListBaselineAlignment-${currentTenant}`,
    waiting: isTenantView && !!currentTenant,
  })
  const aggregateApi = ApiGetCall({
    url: '/api/ListBaselineAlignment',
    data: { byStandard: true },
    queryKey: 'ListBaselineAlignment-byStandard',
    waiting: !isTenantView && !isTemplateView,
  })
  const baselinesApi = ApiGetCall({
    url: '/api/ListBaselines',
    queryKey: 'ListBaselines',
  })
  const definitionsApi = ApiGetCall({
    url: '/api/ListBaselineStandards',
    queryKey: 'ListBaselineStandards',
  })

  const catalog = definitionsApi.data ?? []
  const baselines = baselinesApi.data ?? []
  const standardAggregates = aggregateApi.data?.standards ?? []
  const tenant = {
    displayName: currentTenant,
    tenantFilter: currentTenant,
    tenantId: currentTenant,
    total: 0,
    applicable: 0,
    licenseMissing: 0,
    compliant: 0,
    accepted: 0,
    detected: 0,
    suppressed: 0,
    verifiedPercentage: 0,
    alignedPercentage: 0,
    acceptedPercentage: 0,
    ...(resolvedApi.data?.summary ?? {}),
    rows: resolvedApi.data?.rows ?? [],
  }
  const stageStates = resolvedApi.data?.stageStates ?? []

  const triageFormFields = ({ formHook }) => (
    <Stack spacing={2} sx={{ mt: 2 }}>
      <CippFormComponent
        type="textField"
        name="reason"
        label="Reason"
        formControl={formHook}
        required
      />
      <CippFormComponent
        type="datePicker"
        name="expires"
        label="Expires (optional)"
        dateTimeType="date"
        formControl={formHook}
      />
      <CippFormComponent
        type="switch"
        name="remediateOnExpire"
        label="Remediate automatically when the acceptance expires"
        formControl={formHook}
      />
    </Stack>
  )

  const tenantActions = [
    {
      label: 'Remediate Now',
      type: 'POST',
      url: '/api/ExecBaselineRun',
      icon: <PlayArrow />,
      color: 'success',
      data: {
        mode: '!oneoff',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      confirmText:
        'Deploy the expected value of [standardLabel] to [tenantFilter]? This runs a one-off remediation from the configured expected value.',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) =>
        ['Detected', 'Suppressed'].includes(row.deviationState),
    },
    {
      label: 'Compare Now',
      type: 'POST',
      url: '/api/ExecBaselineRun',
      icon: <Compare />,
      color: 'info',
      data: {
        mode: '!compare',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      confirmText:
        'Run a compare-only pass of [standardLabel] against [tenantFilter]? No changes will be made.',
      multiPost: false,
      relatedQueryKeys,
    },
    {
      label: 'Accept Deviation',
      type: 'POST',
      url: '/api/ExecUpdateBaselineDeviation',
      icon: <CheckCircle />,
      color: 'info',
      data: {
        action: '!Accept',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      children: triageFormFields,
      confirmText:
        'Accept the current deviation on [standardLabel]? The tenant counts as aligned, and alerts are silenced until the acceptance expires.',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) => row.deviationState === 'Detected',
    },
    {
      label: 'Suppress Alerts',
      type: 'POST',
      url: '/api/ExecUpdateBaselineDeviation',
      icon: <VolumeOff />,
      color: 'warning',
      data: {
        action: '!Suppress',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      children: triageFormFields,
      confirmText:
        'Suppress alerts for [standardLabel]? The tenant keeps counting as non-compliant, but alerts are muted.',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) => row.deviationState === 'Detected',
    },
    {
      label: 'Clear Deviation Status',
      type: 'POST',
      url: '/api/ExecUpdateBaselineDeviation',
      icon: <RemoveCircle />,
      color: 'error',
      data: {
        action: '!Clear',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      confirmText:
        'Clear the Accept/Suppress status on [standardLabel]? The deviation re-surfaces as Detected on the next run.',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) =>
        ['Accepted', 'Suppressed'].includes(row.deviationState),
    },
    {
      label: 'Mark Task Complete',
      type: 'POST',
      url: '/api/ExecUpdateBaselineDeviation',
      icon: <TaskAlt />,
      color: 'success',
      data: {
        action: '!CompleteTask',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      confirmText:
        'Mark the manual task [standardLabel] as completed for [tenantFilter]? A new deviation is raised again on the configured recurrence.',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) =>
        row.standardName === 'ManualTask' && row.deviationState === 'Detected',
    },
    {
      label: 'Create Tenant Override',
      type: 'POST',
      url: '/api/ExecBaselineOverride',
      icon: <Tune />,
      color: 'info',
      data: {
        action: '!createOverride',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      children: ({ formHook, row }) => {
        const standard = catalog.find(
          (entry) => entry.name === row.standardName
        )
        if (!standard) return null
        return (
          <Stack spacing={2} sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              The settings below are pre-filled with what {row.sourceTemplate}{' '}
              currently applies to this tenant. Saving creates a tenant-specific
              override that replaces them.
            </Typography>
            <CippBaselineStandardSettings
              standard={standard}
              formControl={formHook}
              namePrefix="variables"
              initialValues={variableValuesFromExpected(
                standard,
                row.expectedValue
              )}
            />
          </Stack>
        )
      },
      confirmText:
        'Create a tenant-specific override of [standardLabel] for [tenantFilter]?',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) => {
        const standard = catalog.find(
          (entry) => entry.name === row.standardName
        )
        // An existing override is removed, not re-created.
        return (
          row.sourceTemplate !== 'Tenant Override' &&
          Object.keys(standard?.variables ?? {}).length > 0
        )
      },
    },
    {
      label: 'Remove Tenant Override',
      type: 'POST',
      url: '/api/ExecBaselineOverride',
      icon: <LayersClear />,
      color: 'error',
      data: {
        action: '!deleteOverride',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      confirmText:
        'Remove the tenant override on [standardLabel] for [tenantFilter]? The tenant falls back to the configuration inherited from the wider baseline on the next run.',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) => row.sourceTemplate === 'Tenant Override',
    },
  ]

  const standardActions = [
    {
      label: 'Deploy To All Tenants',
      type: 'POST',
      url: '/api/ExecBaselineRun',
      icon: <PlayArrow />,
      color: 'success',
      data: {
        mode: '!oneoff',
        tenantFilter: '!AllTenants',
        standard: 'standardName',
      },
      confirmText:
        'Deploy [standardLabel] to every applicable tenant from its configured expected value? Accepted and suppressed deviations are left untouched.',
      multiPost: false,
      relatedQueryKeys,
    },
    {
      label: 'Compare All Tenants',
      type: 'POST',
      url: '/api/ExecBaselineRun',
      icon: <Compare />,
      color: 'info',
      data: {
        mode: '!compare',
        tenantFilter: '!AllTenants',
        standard: 'standardName',
      },
      confirmText:
        'Run a compare-only pass of [standardLabel] on every tenant? No changes will be made.',
      multiPost: false,
      relatedQueryKeys,
    },
    {
      label: 'Edit Baseline',
      link: '/tenant/baselines/template?id=[templateId]',
      icon: <Edit />,
      color: 'success',
      target: '_self',
    },
  ]

  const tenantOffCanvas = {
    size: 'md',
    title: 'Standard Details',
    contentPadding: 0,
    children: (row) => {
      // The offcanvas renders with an empty row until one is selected. Rows without
      // collected data (No Data) have nothing to diff against.
      const differences = row.currentValue
        ? Object.keys(row.expectedValue ?? {}).filter(
            (key) =>
              JSON.stringify(row.expectedValue[key]) !==
              JSON.stringify(row.currentValue?.[key])
          )
        : []
      const properties = [
        { label: 'Standard', value: row.standardLabel },
        {
          label: 'State',
          value: row.deviationState,
          color: deviationColors[row.deviationState],
        },
        { label: 'Impact', value: row.impact },
        { label: 'Configured By', value: row.sourceTemplate },
        {
          label: 'Last Run',
          value: row.lastRun
            ? parseCippDate(row.lastRun).toLocaleString()
            : 'N/A',
        },
        { label: 'Last Outcome', value: row.lastOutcome },
      ]
      if (row.deviationReason) {
        properties.push({
          label: 'Deviation Reason',
          value: row.deviationReason,
        })
        properties.push({ label: 'Set By', value: row.deviationBy })
        properties.push({
          label: 'Expires',
          value: row.deviationExpires
            ? parseCippDate(row.deviationExpires).toLocaleDateString()
            : 'Never',
        })
      }
      if (row.pendingVerification) {
        properties.push({
          label: 'Verification',
          value: 'Remediated - awaiting next run',
          color: 'info',
        })
      }

      return (
        <Stack spacing={0}>
          {propertyList(properties)}
          <Stack spacing={2} sx={{ p: 2 }}>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Effective Configuration
            </Typography>
            {(row.inheritance ?? []).map((tier) => (
              <Box
                key={tier.templateName}
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: tier.effective ? 'primary.main' : 'divider',
                  bgcolor: 'background.paper',
                }}
              >
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  justifyContent="space-between"
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600 }}
                      noWrap
                    >
                      {tier.templateName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Assigned to: {tier.assignedTo}
                    </Typography>
                  </Box>
                  {tier.effective && (
                    <Chip size="small" color="primary" label="Effective" />
                  )}
                </Stack>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    display: 'block',
                    mt: 0.5,
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(tier.value)}
                </Typography>
                {tier.effective && tier.templateName === 'Tenant Override' && (
                  <Button
                    size="small"
                    variant="outlined"
                    color="error"
                    startIcon={<LayersClear />}
                    sx={{ mt: 1 }}
                    onClick={() => {
                      setRemoveOverrideTarget(row)
                      removeOverrideDialog.handleOpen()
                    }}
                  >
                    Remove Override
                  </Button>
                )}
              </Box>
            ))}
            <Typography variant="caption" color="text.secondary">
              When multiple baselines configure the same standard, the baseline
              with the most specific assignment wins.
            </Typography>
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Expected vs Current
            </Typography>
            {differences.length > 0 ? (
              <>
                {Object.keys(row.expectedValue ?? {}).map((key) => {
                  const drifted = differences.includes(key)
                  const acceptedPath = row.acceptedPaths?.[key]
                  return (
                    <Box
                      key={key}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor:
                          drifted && !acceptedPath ? 'error.main' : 'divider',
                        bgcolor: 'background.paper',
                      }}
                    >
                      <Stack
                        direction="row"
                        spacing={1}
                        alignItems="center"
                        justifyContent="space-between"
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, fontFamily: 'monospace' }}
                          noWrap
                        >
                          {key}
                        </Typography>
                        {acceptedPath ? (
                          <Tooltip
                            title={`${acceptedPath.reason} (${acceptedPath.by})`}
                          >
                            <Chip
                              variant="outlined"
                              size="small"
                              color="info"
                              label="Accepted"
                            />
                          </Tooltip>
                        ) : drifted ? (
                          <Chip
                            variant="outlined"
                            size="small"
                            color="error"
                            label="Drift"
                          />
                        ) : (
                          <Chip
                            variant="outlined"
                            size="small"
                            color="success"
                            label="OK"
                          />
                        )}
                      </Stack>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          display: 'block',
                          mt: 0.5,
                          wordBreak: 'break-word',
                        }}
                      >
                        Expected: {JSON.stringify(row.expectedValue[key])}
                        {drifted &&
                          ` - Current: ${JSON.stringify(row.currentValue?.[key])}`}
                      </Typography>
                      {drifted && !acceptedPath && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<CheckCircle />}
                          sx={{ mt: 1 }}
                          onClick={() => {
                            setAcceptPathTarget({ ...row, path: key })
                            acceptPathDialog.handleOpen()
                          }}
                        >
                          Accept this property only
                        </Button>
                      )}
                    </Box>
                  )
                })}
                <Typography variant="caption" color="text.secondary">
                  Accepting a single property tolerates only that value - drift
                  on any other property still raises a deviation.
                </Typography>
              </>
            ) : (
              <>
                {jsonBox(row.expectedValue, true)}
                {row.currentValue ? (
                  jsonBox(row.currentValue, true)
                ) : (
                  <Typography variant="caption" color="text.secondary">
                    No data has been collected for this standard yet.
                  </Typography>
                )}
              </>
            )}
            <Typography
              variant="caption"
              sx={{
                fontWeight: 600,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: 0.5,
              }}
            >
              Last Runs
            </Typography>
            {(row.history ?? []).map((run) => (
              <Box
                key={run.runId}
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
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    {parseCippDate(run.timestamp).toLocaleString()}
                  </Typography>
                  <Chip
                    variant="outlined"
                    size="small"
                    label={run.outcome}
                    color={
                      run.outcome === 'Compliant'
                        ? 'success'
                        : run.outcome === 'Remediated'
                          ? 'info'
                          : 'error'
                    }
                  />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {run.mode} run, triggered by {run.triggeredBy}
                  {run.remediated ? ', remediated' : ''}
                </Typography>
                {run.diff && (
                  <Typography
                    variant="caption"
                    sx={{ fontFamily: 'monospace', display: 'block', mt: 0.5 }}
                  >
                    {JSON.stringify(run.diff)}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Stack>
      )
    },
  }

  const standardOffCanvas = {
    size: 'md',
    title: 'Standard Tenant Summary',
    contentPadding: 0,
    children: (row) => (
      <Stack spacing={0}>
        {propertyList([
          { label: 'Standard', value: row.standardLabel },
          { label: 'Category', value: row.category },
          { label: 'Impact', value: row.impact },
          { label: 'Aligned', value: `${row.alignedPercentage}%` },
          { label: 'Verified', value: `${row.verifiedPercentage}%` },
          { label: 'Accepted Deviations', value: row.accepted },
          { label: 'License Missing', value: row.licenseMissing },
          {
            label: 'Secure Score Impact',
            value: row.secureScoreImpact
              ? `+${row.secureScoreImpact} points`
              : 'None',
          },
        ])}
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
            Tenant States
          </Typography>
          {/* The offcanvas renders with an empty row until one is selected. */}
          {(row.rows ?? []).map((tenantRow) => (
            <Box
              key={tenantRow.tenantFilter}
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
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600 }}
                    noWrap
                  >
                    {tenantRow.tenantName}
                  </Typography>
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block' }}
                  >
                    {tenantRow.tenantFilter}
                  </Typography>
                </Box>
                <Chip
                  variant="outlined"
                  label={tenantRow.deviationState}
                  size="small"
                  color={deviationColors[tenantRow.deviationState] ?? 'default'}
                />
              </Stack>
              {tenantRow.deviationReason && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 1 }}
                >
                  {tenantRow.deviationReason}
                </Typography>
              )}
              {(['Detected', 'Suppressed'].includes(tenantRow.deviationState) ||
                tenantRow.sourceTemplate === 'Tenant Override') && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {['Detected', 'Suppressed'].includes(
                    tenantRow.deviationState
                  ) && (
                    <>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<CheckCircle />}
                        onClick={() => {
                          setTriageTarget(tenantRow)
                          triageDialog.handleOpen()
                        }}
                      >
                        Accept Deviation
                      </Button>
                      {tenantRow.sourceTemplate !== 'Tenant Override' && (
                        <Button
                          size="small"
                          variant="outlined"
                          startIcon={<Tune />}
                          onClick={() => {
                            setOverrideTarget(tenantRow)
                            overrideDialog.handleOpen()
                          }}
                        >
                          Tenant Override
                        </Button>
                      )}
                    </>
                  )}
                  {tenantRow.sourceTemplate === 'Tenant Override' && (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      startIcon={<LayersClear />}
                      onClick={() => {
                        setRemoveOverrideTarget(tenantRow)
                        removeOverrideDialog.handleOpen()
                      }}
                    >
                      Remove Override
                    </Button>
                  )}
                </Stack>
              )}
            </Box>
          ))}
        </Stack>
      </Stack>
    ),
  }

  const templateActions = [
    {
      label: 'Edit Baseline',
      link: '/tenant/baselines/template?id=[GUID]',
      icon: <Edit />,
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
      relatedQueryKeys,
    },
  ]

  const templateOffCanvas = {
    size: 'md',
    title: 'Baseline Rollout',
    contentPadding: 0,
    children: (row) => {
      // The offcanvas renders with an empty row until one is selected.
      const tenantStates = row.tenantStates ?? []
      return (
        <Stack spacing={0}>
          {propertyList([
            { label: 'Baseline', value: row.templateName },
            { label: 'Description', value: row.description },
            { label: 'Standards', value: row.standardsCount },
            { label: 'Stages', value: (row.stageNames ?? []).join(' -> ') },
            {
              label: 'Assigned To',
              value: (row.assignedTenants ?? []).join(', '),
            },
            { label: 'Remediation', value: row.remediationPosture },
          ])}
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
              Tenant Stage Progress
            </Typography>
            {tenantStates.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No tenants are currently tracked in this rollout.
              </Typography>
            )}
            {tenantStates.map((state) => (
              <Box
                key={state.tenantFilter}
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
                  <Box sx={{ minWidth: 0 }}>
                    <Typography
                      variant="subtitle2"
                      sx={{ fontWeight: 600 }}
                      noWrap
                    >
                      {state.tenantName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Entered{' '}
                      {parseCippDate(state.enteredStageAt).toLocaleDateString()}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Chip
                      variant="outlined"
                      size="small"
                      color={state.nextStage ? 'info' : 'success'}
                      label={`Stage ${state.currentStage} of ${state.totalStages}: ${state.stageName}`}
                    />
                    {state.manualAdvance && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ArrowForward />}
                        onClick={() => {
                          setAdvanceTarget({
                            tenantFilter: state.tenantFilter,
                            templateId: row.GUID,
                            templateName: row.templateName,
                            nextStageName: state.nextStageName,
                          })
                          advanceDialog.handleOpen()
                        }}
                      >
                        Move to Next Stage
                      </Button>
                    )}
                  </Stack>
                </Stack>
                {state.nextStage ? (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Next: Stage {state.currentStage + 1} ({state.nextStageName})
                    - advances when {describeStageConditions(state.nextStage)}
                    {state.estimatedAdvanceAt
                      ? `, estimated ${parseCippDate(state.estimatedAdvanceAt).toLocaleDateString()}`
                      : ''}
                  </Typography>
                ) : (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Final stage - the full template is applied.
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>
        </Stack>
      )
    },
  }

  const tenantFilterList = [
    {
      filterName: 'Open Deviations',
      value: [{ id: 'deviationState', value: 'Detected' }],
      type: 'column',
    },
    {
      filterName: 'Accepted',
      value: [{ id: 'deviationState', value: 'Accepted' }],
      type: 'column',
    },
    {
      filterName: 'Suppressed',
      value: [{ id: 'deviationState', value: 'Suppressed' }],
      type: 'column',
    },
    {
      filterName: 'License Missing',
      value: [{ id: 'deviationState', value: 'License Missing' }],
      type: 'column',
    },
  ]

  const standardFilterList = [
    {
      filterName: 'Has Open Deviations',
      value: [{ id: 'detected', value: 1 }],
      type: 'column',
    },
    {
      filterName: 'Has Accepted Deviations',
      value: [{ id: 'accepted', value: 1 }],
      type: 'column',
    },
    {
      filterName: 'Has License Missing',
      value: [{ id: 'licenseMissing', value: 1 }],
      type: 'column',
    },
  ]

  // Page-level view selector, shown above the score bar and table.
  const modeToggle = (
    <ToggleButtonGroup
      value={viewMode}
      exclusive
      size="small"
      onChange={(event, newViewMode) => {
        if (newViewMode !== null) setViewMode(newViewMode)
      }}
      sx={{
        '& .MuiToggleButton-root': { py: 0.5, px: 1.5, fontSize: '0.8125rem' },
      }}
    >
      <ToggleButton value="tenant" aria-label="tenant view">
        <Tooltip
          title="All standards applicable to the selected tenant"
          placement="top"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <BuildingOfficeIcon
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
            Tenant View
          </Box>
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="standard" aria-label="standard view">
        <Tooltip
          title="Every standard aggregated across all tenants"
          placement="top"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <Squares2X2Icon style={{ width: 16, height: 16, marginRight: 6 }} />
            Standard View
          </Box>
        </Tooltip>
      </ToggleButton>
      <ToggleButton value="template" aria-label="template view">
        <Tooltip
          title="Baselines with their assigned tenants and stage progress"
          placement="top"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <RectangleStackIcon
              style={{ width: 16, height: 16, marginRight: 6 }}
            />
            Baseline View
          </Box>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )

  const rolloutCard = (
    <CippButtonCard title={`Staged Rollout - ${tenant.displayName}`}>
      <Stack spacing={1.5}>
        {stageStates.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No staged baselines are assigned to this tenant.
          </Typography>
        )}
        {stageStates.map((state) => (
          <Box
            key={state.templateId}
            sx={{
              p: 1.5,
              borderRadius: '12px',
              border: '1px solid',
              borderColor: 'divider',
              bgcolor: 'background.paper',
            }}
          >
            <Stack
              direction={{ xs: 'column', md: 'row' }}
              spacing={1}
              alignItems={{ xs: 'flex-start', md: 'center' }}
              justifyContent="space-between"
            >
              <Box sx={{ minWidth: 0 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }} noWrap>
                  {state.templateName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Entered{' '}
                  {parseCippDate(state.enteredStageAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                {state.alignedPercentage !== null && (
                  <Tooltip title="Alignment against the standards this baseline has rolled out to this tenant so far">
                    <Chip
                      variant="outlined"
                      size="small"
                      color={
                        state.alignedPercentage === 100 ? 'success' : 'warning'
                      }
                      label={`${state.alignedPercentage}% aligned`}
                    />
                  </Tooltip>
                )}
                <Chip
                  variant="outlined"
                  size="small"
                  color={state.nextStage ? 'info' : 'success'}
                  label={`Stage ${state.currentStage} of ${state.totalStages}: ${state.stageName}`}
                />
                {!state.nextStage && (
                  <Chip
                    variant="outlined"
                    size="small"
                    color="success"
                    label="Final stage"
                  />
                )}
                {state.manualAdvance && (
                  <Tooltip title="The next stage requires manual approval">
                    <Chip
                      variant="outlined"
                      size="small"
                      color="warning"
                      label="Awaiting approval"
                    />
                  </Tooltip>
                )}
              </Stack>
            </Stack>
            {state.nextStage && (
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ display: 'block', mt: 1 }}
              >
                Next: Stage {state.currentStage + 1} ({state.nextStageName}) -
                advances when {describeStageConditions(state.nextStage)}
              </Typography>
            )}
            {state.manualAdvance && (
              <>
                <Divider sx={{ my: 1 }} />
                <Stack direction="row" justifyContent="flex-end">
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ArrowForward />}
                    onClick={() => {
                      setAdvanceTarget({
                        tenantFilter: tenant.tenantId,
                        templateId: state.templateId,
                        templateName: state.templateName,
                        nextStageName: state.nextStageName,
                      })
                      advanceDialog.handleOpen()
                    }}
                  >
                    Move to next stage ({state.nextStageName})
                  </Button>
                </Stack>
              </>
            )}
          </Box>
        ))}
      </Stack>
    </CippButtonCard>
  )

  const tenantScoreBar = (
    <CippInfoBar
      data={[
        {
          icon: <CheckBadgeIcon />,
          name: 'Aligned',
          data: `${tenant.alignedPercentage}%`,
          color: 'success',
          toolTip: `${tenant.acceptedPercentage}% of this score comes from accepted deviations`,
        },
        {
          icon: <ShieldCheckIcon />,
          name: 'Verified Compliant',
          data: `${tenant.verifiedPercentage}%`,
        },
        {
          icon: <ExclamationTriangleIcon />,
          name: 'Open Deviations',
          data: tenant.detected,
          color: 'error',
        },
        {
          icon: <KeyIcon />,
          name: 'License Missing',
          data: `${tenant.total ? Math.round((tenant.licenseMissing / tenant.total) * 100) : 0}%`,
          color: 'warning',
          toolTip: `${tenant.licenseMissing} standard${tenant.licenseMissing === 1 ? '' : 's'} excluded from scoring because the tenant lacks the license`,
        },
      ]}
    />
  )

  const overrideStandard = overrideTarget
    ? catalog.find((entry) => entry.name === overrideTarget.standardName)
    : null

  // The triage/override/advance dialogs are shared between the tenant layout and the
  // table page for the other views.
  const dialogs = (
    <>
      {advanceTarget && (
        <CippApiDialog
          createDialog={advanceDialog}
          title="Move to Next Stage"
          api={{
            url: '/api/ExecBaselineStage',
            type: 'POST',
            data: {
              action: '!advanceStage',
              tenantFilter: 'tenantFilter',
              templateId: 'templateId',
            },
            confirmText:
              'Move [tenantFilter] into stage [nextStageName] of [templateName]? The tenant receives all standards from that stage on the next run.',
            relatedQueryKeys,
          }}
          row={advanceTarget}
        />
      )}
      {triageTarget && (
        <CippApiDialog
          createDialog={triageDialog}
          title="Accept Deviation"
          fields={[
            { type: 'textField', name: 'reason', label: 'Reason' },
            {
              type: 'datePicker',
              name: 'expires',
              label: 'Expires (optional)',
              dateTimeType: 'date',
            },
            {
              type: 'switch',
              name: 'remediateOnExpire',
              label: 'Remediate automatically when the acceptance expires',
            },
          ]}
          api={{
            url: '/api/ExecUpdateBaselineDeviation',
            type: 'POST',
            data: {
              action: '!Accept',
              tenantFilter: 'tenantFilter',
              standard: 'standardName',
            },
            confirmText:
              'Accept the current deviation on [standardLabel] for [tenantFilter]? The tenant counts as aligned, and alerts are silenced until the acceptance expires.',
            relatedQueryKeys,
          }}
          row={triageTarget}
        />
      )}
      {overrideTarget && overrideStandard && (
        <CippApiDialog
          createDialog={overrideDialog}
          title="Create Tenant Override"
          children={({ formHook }) => (
            <Stack spacing={2} sx={{ mt: 2 }}>
              <Typography variant="body2" color="text.secondary">
                The settings below are pre-filled with what{' '}
                {overrideTarget.sourceTemplate} currently applies to{' '}
                {overrideTarget.tenantName}. Saving creates a tenant-specific
                override that replaces them.
              </Typography>
              <CippBaselineStandardSettings
                standard={overrideStandard}
                formControl={formHook}
                namePrefix="variables"
                initialValues={variableValuesFromExpected(
                  overrideStandard,
                  overrideTarget.expectedValue
                )}
              />
            </Stack>
          )}
          api={{
            url: '/api/ExecBaselineOverride',
            type: 'POST',
            data: {
              action: '!createOverride',
              tenantFilter: 'tenantFilter',
              standard: 'standardName',
            },
            confirmText:
              'Create a tenant-specific override of [standardLabel] for [tenantFilter]?',
            relatedQueryKeys,
          }}
          row={overrideTarget}
        />
      )}
      {acceptPathTarget && (
        <CippApiDialog
          createDialog={acceptPathDialog}
          title="Accept Property Deviation"
          fields={[{ type: 'textField', name: 'reason', label: 'Reason' }]}
          api={{
            url: '/api/ExecUpdateBaselineDeviation',
            type: 'POST',
            data: {
              action: '!AcceptPath',
              tenantFilter: 'tenantFilter',
              standard: 'standardName',
              path: 'path',
            },
            confirmText:
              'Accept the deviation on property [path] of [standardLabel]? Drift on any other property of this standard still raises a deviation.',
            relatedQueryKeys,
          }}
          row={acceptPathTarget}
        />
      )}
      {removeOverrideTarget && (
        <CippApiDialog
          createDialog={removeOverrideDialog}
          title="Remove Tenant Override"
          api={{
            url: '/api/ExecBaselineOverride',
            type: 'POST',
            data: {
              action: '!deleteOverride',
              tenantFilter: 'tenantFilter',
              standard: 'standardName',
            },
            confirmText:
              'Remove the tenant override on [standardLabel] for [tenantFilter]? The tenant falls back to the configuration inherited from the wider baseline on the next run.',
            relatedQueryKeys,
          }}
          row={removeOverrideTarget}
        />
      )}
    </>
  )

  // Tenant view: custom layout so the deviation feed sits directly next to the
  // alignment table.
  if (isTenantView) {
    return (
      <>
        <CippHead title={pageTitle} />
        <Container maxWidth={false}>
          <Stack spacing={2}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
            >
              {modeToggle}
              <CippBaselineWhatIfReport
                tenant={tenant}
                stageStates={stageStates}
                baselines={baselines}
                catalog={catalog}
              />
            </Stack>
            {tenantScoreBar}
            {rolloutCard}
            <CippDataTable
              queryKey={`ListBaselineAlignment-${currentTenant}-standards-table`}
              title={`Applicable Standards - ${tenant.displayName}`}
              data={tenant.rows}
              refreshFunction={resolvedApi}
              actions={tenantActions}
              offCanvas={tenantOffCanvas}
              offCanvasOnRowClick={true}
              filters={tenantFilterList}
              simpleColumns={[
                'standardLabel',
                'category',
                'deviationState',
                'deviationReason',
                'deviationBy',
                'deviationAt',
                'sourceTemplate',
                'lastOutcome',
                'lastRun',
              ]}
            />
            {dialogs}
          </Stack>
        </Container>
      </>
    )
  }

  return (
    <CippTablePage
      key={viewMode}
      title={pageTitle}
      data={isTemplateView ? baselines : standardAggregates}
      refreshFunction={isTemplateView ? baselinesApi : aggregateApi}
      tenantInTitle={false}
      tableFilter={
        <Stack spacing={2}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
          >
            {modeToggle}
          </Stack>
          {dialogs}
        </Stack>
      }
      actions={isTemplateView ? templateActions : standardActions}
      filters={isTemplateView ? undefined : standardFilterList}
      offCanvas={isTemplateView ? templateOffCanvas : standardOffCanvas}
      offCanvasOnRowClick={true}
      simpleColumns={
        isTemplateView
          ? [
              'baselineName',
              'standardsCount',
              'stageNames',
              'assignedTenants',
              'remediationPosture',
              'updatedAt',
            ]
          : [
              'standardLabel',
              'category',
              'impact',
              'alignedPercentage',
              'verifiedPercentage',
              'accepted',
              'detected',
              'licenseMissing',
              'totalTenants',
            ]
      }
      queryKey={`ListBaselineAlignment-${viewMode}-table`}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
