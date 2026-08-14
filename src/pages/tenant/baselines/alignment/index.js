import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Divider,
  Link,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip,
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
import { useState } from 'react'
import { useRouter } from 'next/router'
import {
  BuildingOfficeIcon,
  CheckBadgeIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  KeyIcon,
  RectangleStackIcon,
  ShieldCheckIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'
import {
  ArrowForward,
  BuildOutlined,
  Cancel,
  CheckCircle,
  CheckCircleOutlined,
  Compare,
  Edit,
  ErrorOutlineOutlined,
  InfoOutlined,
  LayersClear,
  PlayArrow,
  RemoveCircle,
  Search,
  TaskAlt,
  Tune,
  Visibility,
  WarningAmberOutlined,
} from '@mui/icons-material'
import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import tabOptions from '../tabOptions.json'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { CippQueueTracker } from '../../../../components/CippTable/CippQueueTracker'
import { CippHead } from '../../../../components/CippComponents/CippHead'
import { CippInfoBar } from '../../../../components/CippCards/CippInfoBar'
import CippButtonCard from '../../../../components/CippCards/CippButtonCard'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog'
import { CippApiLogsDrawer } from '../../../../components/CippComponents/CippApiLogsDrawer'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippFormTemplateTenantSelector } from '../../../../components/CippComponents/CippFormTemplateTenantSelector'
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
import { CippOffCanvas } from '../../../../components/CippComponents/CippOffCanvas'
import { CippAutoComplete } from '../../../../components/CippComponents/CippAutocomplete'
import CippJsonView from '../../../../components/CippFormPages/CippJSONView'

const deviationColors = {
  Compliant: 'success',
  Accepted: 'info',
  'Partially Accepted': 'warning',
  Drift: 'error',
  Conflict: 'error',
  'Denied - Remediate Pending': 'warning',
  'Denied - Delete Pending': 'warning',
  'Skipped - No License': 'default',
  'No Data': 'default',
}

// Identity-carrying tiers (CA/Intune templates): the tier configures a full policy
// template, so the card shows a View Policy button that opens the template in the
// same policy viewer the editor's picker preview uses - a raw variables blob means
// nothing to an operator.
const templatePolicySources = {
  intuneTemplate: {
    title: 'Intune Template',
    url: '/api/ListIntuneTemplates',
    queryKey: 'ListIntuneTemplates',
    property: 'RAWJson',
    type: 'intune',
  },
  caTemplate: {
    title: 'Conditional Access Policy',
    url: '/api/ListCATemplates',
    queryKey: 'ListCATemplates',
    type: 'default',
  },
}

const TierPolicyView = ({ variableKey, templateRef }) => {
  const [visible, setVisible] = useState(false)
  const source = templatePolicySources[variableKey]
  const templatesApi = ApiGetCall({
    url: source.url,
    queryKey: source.queryKey,
    waiting: visible,
  })
  const rawRef =
    templateRef && typeof templateRef === 'object'
      ? templateRef.value
      : templateRef
  const entry = (templatesApi.data ?? []).find(
    (template) => template.GUID === rawRef
  )
  let policy = entry ?? null
  if (entry && source.property) {
    try {
      policy = JSON.parse(entry[source.property])
    } catch {
      policy = entry
    }
  }
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => setVisible(true)}
      >
        View Policy
      </Button>
      <CippOffCanvas
        visible={visible}
        onClose={() => setVisible(false)}
        title={source.title}
        size="xl"
      >
        {templatesApi.isFetching ? (
          <CircularProgress size={24} />
        ) : policy ? (
          <CippJsonView object={policy} defaultOpen={true} type={source.type} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            The template could not be found - it may have been deleted from the
            template library.
          </Typography>
        )}
      </CippOffCanvas>
    </>
  )
}

// Detect-drift standards flag LIVE policies that no baseline covers. Their cards get a
// View Policy button that pulls the real policy from the tenant on demand, so an
// operator can read what it actually does before accepting or deleting it.
const detectPolicySources = {
  DetectIntuneDrift: {
    title: 'Intune Policy',
    url: '/api/ListIntunePolicy',
    queryKey: 'ListIntunePolicy',
    type: 'intune',
  },
  DetectConditionalAccessDrift: {
    title: 'Conditional Access Policy',
    url: '/api/ListConditionalAccessPolicies',
    queryKey: 'ListConditionalAccessPolicies',
    dataKey: 'Results',
    type: 'default',
  },
}

const LivePolicyView = ({ standardName, tenantFilter, policyId }) => {
  const [visible, setVisible] = useState(false)
  const source = detectPolicySources[standardName]
  const policiesApi = ApiGetCall({
    url: source.url,
    data: { tenantFilter },
    queryKey: `${source.queryKey}-${tenantFilter}`,
    waiting: visible,
  })
  const policies = source.dataKey
    ? (policiesApi.data?.[source.dataKey] ?? [])
    : (policiesApi.data ?? [])
  const policy = policies.find((entry) => entry?.id === policyId)
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => setVisible(true)}
      >
        View Policy
      </Button>
      <CippOffCanvas
        visible={visible}
        onClose={() => setVisible(false)}
        title={source.title}
        size="xl"
      >
        {policiesApi.isFetching ? (
          <CircularProgress size={24} />
        ) : policy ? (
          <CippJsonView object={policy} defaultOpen={true} type={source.type} />
        ) : (
          <Typography variant="body2" color="text.secondary">
            The policy could not be found - it may already have been removed
            from the tenant.
          </Typography>
        )}
      </CippOffCanvas>
    </>
  )
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

// The API serializes single-element arrays as a bare object; the selector needs a real array.
const asOptionArray = (value) =>
  (Array.isArray(value) ? value : value ? [value] : []).filter(
    (entry) => entry && typeof entry === 'object' && entry.value
  )

const runModeLabels = {
  run: 'Full run',
  compare: 'Compare',
  oneoff: 'One-off remediation',
  triage: 'Operator action',
  stage: 'Stage change',
  delete: 'Deletion',
}

// Timeline dot/chip styling per run outcome, mirroring the manage-tenant history page.
const outcomeTimeline = {
  Compliant: {
    color: 'success',
    chipColor: 'success',
    icon: <CheckCircleOutlined />,
  },
  Remediated: { color: 'info', chipColor: 'info', icon: <BuildOutlined /> },
  Drift: {
    color: 'warning',
    chipColor: 'error',
    icon: <WarningAmberOutlined />,
  },
  Error: { color: 'error', chipColor: 'error', icon: <ErrorOutlineOutlined /> },
  'Skipped-NoCache': {
    color: 'grey',
    chipColor: 'default',
    icon: <InfoOutlined />,
    label: 'Skipped - No Data',
  },
  'Skipped-License': {
    color: 'grey',
    chipColor: 'default',
    icon: <InfoOutlined />,
    label: 'Skipped - No License',
  },
  // Operator/system audit events (triage verdicts, overrides, stage changes,
  // deletions carried out for denied deviations).
  Accepted: { color: 'info', chipColor: 'info', icon: <TaskAlt /> },
  'Property Accepted': { color: 'info', chipColor: 'info', icon: <TaskAlt /> },
  'Denied - Remediation Ordered': {
    color: 'warning',
    chipColor: 'warning',
    icon: <Cancel />,
  },
  'Denied - Delete Ordered': {
    color: 'warning',
    chipColor: 'warning',
    icon: <Cancel />,
  },
  'Property Denied': {
    color: 'warning',
    chipColor: 'warning',
    icon: <Cancel />,
  },
  'Triage Cleared': { color: 'grey', chipColor: 'default', icon: <Edit /> },
  'Property Triage Cleared': {
    color: 'grey',
    chipColor: 'default',
    icon: <Edit />,
  },
  'Task Completed': {
    color: 'success',
    chipColor: 'success',
    icon: <TaskAlt />,
  },
  'Override Created': { color: 'info', chipColor: 'info', icon: <Tune /> },
  'Override Removed': {
    color: 'grey',
    chipColor: 'default',
    icon: <LayersClear />,
  },
  'Stage Advanced': {
    color: 'primary',
    chipColor: 'primary',
    icon: <ArrowForward />,
  },
  Deleted: { color: 'error', chipColor: 'error', icon: <RemoveCircle /> },
  'Delete Failed': {
    color: 'error',
    chipColor: 'error',
    icon: <ErrorOutlineOutlined />,
  },
}

// One readable sentence per run event for the historic timeline. Operator and
// system events carry their own story in `detail`; run events derive one here.
const historyEventMessage = (event) => {
  if (event.detail) {
    return `"${event.standardLabel}" - ${event.detail}`
  }
  switch (event.outcome) {
    case 'Remediated':
      return `Successfully changed "${event.standardLabel}" to the expected configuration`
    case 'Compliant':
      return `Verified "${event.standardLabel}" is compliant with the baseline`
    case 'Drift':
      return `Detected drift on "${event.standardLabel}"`
    case 'Error':
      return `Failed to change "${event.standardLabel}" - see the logs for this run`
    case 'Skipped-License':
      return `Skipped "${event.standardLabel}" - the tenant is not licensed for it`
    case 'Skipped-NoCache':
      return `Skipped "${event.standardLabel}" - no data collected yet`
    default:
      return `"${event.standardLabel}" - ${event.outcome}`
  }
}

// A run's diff can be long - hide it behind a toggle so the history list stays readable.
const RunDetails = ({ diff }) => {
  const [open, setOpen] = useState(false)
  if (!diff) return null
  const entries = Array.isArray(diff) ? diff : [diff]
  return (
    <>
      <Button
        size="small"
        variant="outlined"
        sx={{ mt: 1 }}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? 'Hide run details' : 'View details of this run'}
      </Button>
      {open &&
        entries.map((entry, index) => (
          <Typography
            key={entry?.Property ?? index}
            variant="caption"
            sx={{
              fontFamily: 'monospace',
              display: 'block',
              mt: 0.5,
              wordBreak: 'break-word',
            }}
          >
            {entry?.Property}: expected {JSON.stringify(entry?.ExpectedValue)},
            found {JSON.stringify(entry?.ReceivedValue)}
          </Typography>
        ))}
    </>
  )
}

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
  const router = useRouter()
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
  const [denyPathTarget, setDenyPathTarget] = useState(null)
  const denyPathDialog = useDialog()
  const [removeOverrideTarget, setRemoveOverrideTarget] = useState(null)
  const removeOverrideDialog = useDialog()
  // Filtering re-orders the timeline, so expansion state keys on stable event/run
  // identity rather than render index.
  const [expandedEvents, setExpandedEvents] = useState(new Set())
  const toggleEventExpansion = (eventKey) => {
    setExpandedEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventKey)) {
        next.delete(eventKey)
      } else {
        next.add(eventKey)
      }
      return next
    })
  }
  const [expandedRuns, setExpandedRuns] = useState(new Set())
  const toggleRunExpansion = (runKey) => {
    setExpandedRuns((prev) => {
      const next = new Set(prev)
      if (next.has(runKey)) {
        next.delete(runKey)
      } else {
        next.add(runKey)
      }
      return next
    })
  }
  const [historyFilters, setHistoryFilters] = useState({
    standard: [],
    outcome: [],
    mode: [],
    search: '',
  })
  const [historyLimit, setHistoryLimit] = useState(50)
  const setHistoryFilter = (name, value) => {
    setHistoryFilters((prev) => ({ ...prev, [name]: value }))
    setHistoryLimit(50)
  }
  const isTenantView = viewMode === 'tenant'
  const isTemplateView = viewMode === 'template'

  // Refetch everything baseline-related after any triage/run/override action:
  // the wildcard invalidates every ListBaseline* query, including the '-table'
  // keys the table instances register. The queue key re-discovers the run a
  // Compare/Remediate/Run action just started, so the progress tracker appears.
  const relatedQueryKeys = ['ListBaseline*', 'ListCippQueue-BaselineRun']

  // Live run progress: baseline runs tag their queue entry with this reference;
  // the newest one drives the tracker chip next to the view toggle.
  const baselineQueues = ApiGetCall({
    url: '/api/ListCippQueue',
    data: { Reference: 'BaselineRun' },
    queryKey: 'ListCippQueue-BaselineRun',
  })
  const latestBaselineQueueId = Array.isArray(baselineQueues.data)
    ? baselineQueues.data[0]?.RowKey
    : baselineQueues.data?.RowKey

  // Deep link support: /tenant/baselines/alignment?status=Drift lands with the
  // table pre-filtered (the Fleet Overview tiles link here).
  const initialStatusFilter = router.query.status
    ? [{ id: 'status', value: router.query.status }]
    : []

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
    waiting: viewMode === 'standard',
  })
  const historyApi = ApiGetCall({
    url: '/api/ListBaselineAlignment',
    data: { tenantFilter: currentTenant, history: true },
    queryKey: `ListBaselineAlignment-${currentTenant}-history`,
    waiting: viewMode === 'history' && !!currentTenant,
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
    drift: 0,
    denied: 0,
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
      // Compare applies to manual tasks too: it re-evaluates the completion recurrence,
      // flipping a task back to Drift once its reopen window has elapsed. A Conflict
      // cannot even compare - the expected value itself is ambiguous.
      condition: (row) => row.status !== 'Conflict',
      bulkFilterEligible: true,
    },
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
        'Fix [standardLabel] on [tenantFilter] now? CIPP immediately applies the configured expected value.',
      multiPost: false,
      relatedQueryKeys,
      // Running remediation by hand is always possible - the engine deploys the expected
      // value regardless of the current state, and a license bought after the last run
      // should not block trying. Manual tasks have nothing to deploy; a Conflict has no
      // unambiguous expected value to deploy.
      condition: (row) =>
        !row.standardName.startsWith('ManualTask') && row.status !== 'Conflict',
      hideCondition: (row) => row.standardName.startsWith('ManualTask'),
      bulkFilterEligible: true,
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
      // Manual tasks are completed, not triaged.
      condition: (row) =>
        ['Drift', 'Partially Accepted'].includes(row.status) &&
        !row.standardName.startsWith('ManualTask'),
      hideCondition: (row) => row.standardName.startsWith('ManualTask'),
      bulkFilterEligible: true,
    },
    {
      label: 'Deny & Fix Deviation',
      type: 'POST',
      url: '/api/ExecUpdateBaselineDeviation',
      icon: <Cancel />,
      color: 'warning',
      data: {
        action: '!Deny',
        method: '!remediate',
        tenantFilter: 'tenantFilter',
        standard: 'standardName',
      },
      children: ({ formHook }) => (
        <Stack spacing={2} sx={{ mt: 2 }}>
          <CippFormComponent
            type="textField"
            name="reason"
            label="Reason (optional)"
            formControl={formHook}
          />
        </Stack>
      ),
      confirmText:
        'Deny the deviation on [standardLabel]? CIPP fixes it back to the baseline on the next run (within 12 hours), regardless of the configured posture.',
      multiPost: false,
      relatedQueryKeys,
      condition: (row) =>
        ['Drift', 'Partially Accepted'].includes(row.status) &&
        !row.standardName.startsWith('ManualTask'),
      hideCondition: (row) => row.standardName.startsWith('ManualTask'),
      bulkFilterEligible: true,
    },
    {
      label: 'Undo Accept/Deny',
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
        'Clear the Accept/Deny status and any accepted properties on [standardLabel]? The deviation re-surfaces as Drift on the next run.',
      multiPost: false,
      relatedQueryKeys,
      // Also offered when only sub-object/property acceptances exist - clearing is the
      // one way to delete those.
      condition: (row) =>
        (['Accepted', 'Partially Accepted'].includes(row.status) ||
          row.status?.startsWith('Denied') ||
          Object.keys(row.acceptedPaths ?? {}).length > 0) &&
        !row.standardName.startsWith('ManualTask'),
      hideCondition: (row) => row.standardName.startsWith('ManualTask'),
      bulkFilterEligible: true,
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
      // Instance keys are 'ManualTask#n' - an exact match missed every instance but the first.
      condition: (row) =>
        row.standardName.startsWith('ManualTask') && row.status === 'Drift',
      hideCondition: (row) => !row.standardName.startsWith('ManualTask'),
      bulkFilterEligible: true,
    },
    {
      label: 'Create Tenant Override',
      type: 'POST',
      url: '/api/ExecBaselineOverride',
      icon: <Tune />,
      color: 'info',
      // Overrides configure ONE tenant's settings in a dialog - meaningless as a bulk action.
      hideBulk: true,
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
      hideCondition: (row) => row.standardName.startsWith('ManualTask'),
    },
    {
      label: 'Remove Tenant Override',
      type: 'POST',
      url: '/api/ExecBaselineOverride',
      icon: <LayersClear />,
      color: 'error',
      hideBulk: true,
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
      hideCondition: (row) => row.standardName.startsWith('ManualTask'),
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
      // Manual tasks have nothing to deploy - operators complete them instead.
      hideCondition: (row) => row.standardName.startsWith('ManualTask'),
    },
    {
      label: 'Mark Task Complete (All Tenants)',
      type: 'POST',
      url: '/api/ExecUpdateBaselineDeviation',
      icon: <TaskAlt />,
      color: 'success',
      data: {
        action: '!CompleteTask',
        tenantFilter: '!AllTenants',
        standard: 'standardName',
      },
      confirmText:
        'Mark the manual task [standardLabel] as completed for every applicable tenant? Each tenant raises it again on the configured recurrence.',
      multiPost: false,
      relatedQueryKeys,
      hideCondition: (row) => !row.standardName.startsWith('ManualTask'),
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
      // Per-property drift comes from the ENGINE's persisted diff - the frontend never
      // re-derives compares, so $anyOf/hard-compare/acceptance semantics live in exactly
      // one place. A diff Property may be a nested dot-path under a card's path.
      const diffEntries = Array.isArray(row.diff)
        ? row.diff
        : row.diff
          ? [row.diff]
          : []
      const hasDiffAt = (path) =>
        diffEntries.some(
          (entry) =>
            entry?.Property === path || entry?.Property?.startsWith(`${path}.`)
        )
      // Display flattening only (never comparison): big policies like CA render each
      // sub-object as its own card (conditions.users, conditions.applications, ...)
      // instead of one unreadable JSON blob. Empty-vs-empty cards are skipped unless
      // the engine flagged drift there.
      // A literal property name wins over dot-path traversal: policy names routinely
      // contain dots ("... - v3.0"), and splitting those would resolve to nothing.
      const getPath = (source, path) => {
        if (
          source &&
          typeof source === 'object' &&
          Object.prototype.hasOwnProperty.call(source, path)
        ) {
          return source[path]
        }
        return path
          .split('.')
          .reduce((acc, key) => (acc == null ? acc : acc[key]), source)
      }
      const isPlainObject = (value) =>
        value && typeof value === 'object' && !Array.isArray(value)
      const isEmptyish = (value) =>
        value == null ||
        (Array.isArray(value) && value.length === 0) ||
        (isPlainObject(value) && Object.keys(value).length === 0)
      // Expand every sub-object down to its leaves (scalars/arrays), so acceptance is
      // exactly one setting: accepting conditions.users.excludeUsers never tolerates a
      // change to includeUsers. Empty-vs-empty leaves are hidden below, keeping the
      // card list compact despite the depth.
      const buildCardPaths = (value, prefix = '') =>
        Object.keys(value ?? {}).flatMap((key) => {
          const child = value[key]
          const path = prefix ? `${prefix}.${key}` : key
          return isPlainObject(child) ? buildCardPaths(child, path) : [path]
        })
      const cardPaths = buildCardPaths(row.expectedValue).filter(
        (path) =>
          hasDiffAt(path) ||
          !(
            isEmptyish(getPath(row.expectedValue, path)) &&
            isEmptyish(getPath(row.currentValue, path))
          )
      )
      const differences = cardPaths.filter(hasDiffAt)
      // Drift first: the whole point of opening the offcanvas is seeing what's wrong -
      // deviating cards render before compliant ones (stable within each group).
      const orderedCardPaths = [...cardPaths].sort(
        (a, b) => Number(hasDiffAt(b)) - Number(hasDiffAt(a))
      )
      // Settings-catalog diffs key on friendly setting LABELS, not object paths - any
      // diff entry that maps to no expected-value path renders as its own card, valued
      // straight from the engine's diff.
      const unmatchedDiffEntries = diffEntries.filter(
        (entry) =>
          entry?.Property &&
          !cardPaths.some(
            (path) =>
              entry.Property === path || entry.Property.startsWith(`${path}.`)
          )
      )
      const properties = [
        { label: 'Standard', value: row.standardLabel },
        {
          label: 'State',
          value: row.status,
          color: deviationColors[row.status],
        },
        { label: 'Impact', value: row.impact },
        { label: 'Stage', value: row.stage },
        { label: 'Configured By', value: row.sourceTemplate },
        {
          label: 'Last Run',
          value: row.lastRun
            ? parseCippDate(row.lastRun).toLocaleString()
            : 'N/A',
        },
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
            {row.status === 'Conflict' && (
              <Alert severity="error">
                Two baselines configure this standard at the same assignment
                level with different settings, so CIPP cannot know which one is
                intended - nothing is compared or fixed until you edit one of
                the baselines below.
              </Alert>
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
                {tier.remediateEnabled !== undefined && (
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    useFlexGap
                    sx={{ mt: 1 }}
                  >
                    <Tooltip
                      title={
                        tier.remediateEnabled
                          ? 'Drift is corrected automatically on every run'
                          : 'Drift is only reported, never corrected automatically'
                      }
                    >
                      <Chip
                        variant="outlined"
                        size="small"
                        color={tier.remediateEnabled ? 'success' : 'default'}
                        label={
                          tier.remediateEnabled
                            ? 'Auto-remediate'
                            : 'Report only'
                        }
                      />
                    </Tooltip>
                    <Tooltip
                      title={
                        tier.alertEnabled
                          ? 'An alert fires when a new deviation is detected'
                          : 'No alerts fire for deviations on this standard'
                      }
                    >
                      <Chip
                        variant="outlined"
                        size="small"
                        color={tier.alertEnabled ? 'info' : 'warning'}
                        label={
                          tier.alertEnabled
                            ? 'Alert on deviation'
                            : 'Alerts muted'
                        }
                      />
                    </Tooltip>
                    {tier.alertOnRemediate && (
                      <Tooltip title="An alert fires whenever auto-remediation corrects this standard">
                        <Chip
                          variant="outlined"
                          size="small"
                          color="info"
                          label="Alert on remediation"
                        />
                      </Tooltip>
                    )}
                  </Stack>
                )}
                {tier.value?.intuneTemplate || tier.value?.caTemplate ? (
                  <Box sx={{ mt: 1 }}>
                    <TierPolicyView
                      variableKey={
                        tier.value?.intuneTemplate
                          ? 'intuneTemplate'
                          : 'caTemplate'
                      }
                      templateRef={
                        tier.value?.intuneTemplate ?? tier.value?.caTemplate
                      }
                    />
                  </Box>
                ) : (
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
                )}
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
            {row.currentValue ? (
              <>
                {unmatchedDiffEntries.map((entry) => {
                  const acceptedPath = row.acceptedPaths?.[entry.Property]
                  // Detect-drift cards reference a real policy in the tenant: show what
                  // it is in plain language and offer to open it, instead of a blob.
                  const policyRef =
                    detectPolicySources[row.standardName] &&
                    entry.ReceivedValue?.id
                      ? entry.ReceivedValue
                      : null
                  return (
                    <Box
                      key={entry.Property}
                      sx={{
                        p: 1.5,
                        borderRadius: '12px',
                        border: '1px solid',
                        borderColor: acceptedPath ? 'divider' : 'error.main',
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
                          {entry.Property}
                        </Typography>
                        {acceptedPath ? (
                          <Tooltip
                            title={`${acceptedPath.reason} (${acceptedPath.by})`}
                          >
                            <Chip
                              variant="outlined"
                              size="small"
                              color={
                                acceptedPath.verdict === 'denyDelete'
                                  ? 'warning'
                                  : 'info'
                              }
                              label={
                                acceptedPath.verdict === 'denyDelete'
                                  ? 'Delete Pending'
                                  : 'Accepted'
                              }
                            />
                          </Tooltip>
                        ) : (
                          <Chip
                            variant="outlined"
                            size="small"
                            color="error"
                            label="Drift"
                          />
                        )}
                      </Stack>
                      {policyRef ? (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            color: acceptedPath
                              ? 'text.secondary'
                              : 'error.main',
                          }}
                        >
                          {policyRef.status}
                          {policyRef.policyType
                            ? ` - ${policyRef.policyType}`
                            : ''}
                          {policyRef.state ? ` - ${policyRef.state}` : ''}
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              display: 'block',
                              mt: 0.5,
                              wordBreak: 'break-word',
                            }}
                          >
                            Expected: {JSON.stringify(entry.ExpectedValue)}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              display: 'block',
                              wordBreak: 'break-word',
                              color: acceptedPath
                                ? 'text.secondary'
                                : 'error.main',
                            }}
                          >
                            Current: {JSON.stringify(entry.ReceivedValue)}
                          </Typography>
                        </>
                      )}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1 }}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {policyRef && (
                          <LivePolicyView
                            standardName={row.standardName}
                            tenantFilter={row.tenantFilter}
                            policyId={policyRef.id}
                          />
                        )}
                        {!acceptedPath && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CheckCircle />}
                            onClick={() => {
                              setAcceptPathTarget({
                                ...row,
                                path: entry.Property,
                              })
                              acceptPathDialog.handleOpen()
                            }}
                          >
                            Accept this property only
                          </Button>
                        )}
                        {!acceptedPath && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<RemoveCircle />}
                            onClick={() => {
                              setDenyPathTarget({
                                ...row,
                                path: entry.Property,
                              })
                              denyPathDialog.handleOpen()
                            }}
                          >
                            Deny & queue deletion
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  )
                })}
                {orderedCardPaths.map((key) => {
                  const drifted = differences.includes(key)
                  const acceptedPath = row.acceptedPaths?.[key]
                  // Detect-drift cards reference a real policy in the tenant: show what
                  // it is in plain language and offer to open it, instead of a blob.
                  const cardCurrent = getPath(row.currentValue, key)
                  const policyRef =
                    detectPolicySources[row.standardName] && cardCurrent?.id
                      ? cardCurrent
                      : null
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
                              color={
                                acceptedPath.verdict === 'denyDelete'
                                  ? 'warning'
                                  : 'info'
                              }
                              label={
                                acceptedPath.verdict === 'denyDelete'
                                  ? 'Delete Pending'
                                  : 'Accepted'
                              }
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
                      {policyRef ? (
                        <Typography
                          variant="caption"
                          sx={{
                            display: 'block',
                            mt: 0.5,
                            color: drifted ? 'error.main' : 'text.secondary',
                          }}
                        >
                          {policyRef.status}
                          {policyRef.policyType
                            ? ` - ${policyRef.policyType}`
                            : ''}
                          {policyRef.state ? ` - ${policyRef.state}` : ''}
                        </Typography>
                      ) : (
                        <>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              display: 'block',
                              mt: 0.5,
                              wordBreak: 'break-word',
                            }}
                          >
                            Expected:{' '}
                            {JSON.stringify(getPath(row.expectedValue, key))}
                          </Typography>
                          <Typography
                            variant="caption"
                            sx={{
                              fontFamily: 'monospace',
                              display: 'block',
                              wordBreak: 'break-word',
                              color: drifted ? 'error.main' : 'text.secondary',
                            }}
                          >
                            Current: {JSON.stringify(cardCurrent)}
                          </Typography>
                        </>
                      )}
                      <Stack
                        direction="row"
                        spacing={1}
                        sx={{ mt: 1 }}
                        flexWrap="wrap"
                        useFlexGap
                      >
                        {policyRef && (
                          <LivePolicyView
                            standardName={row.standardName}
                            tenantFilter={row.tenantFilter}
                            policyId={policyRef.id}
                          />
                        )}
                        {drifted && !acceptedPath && (
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<CheckCircle />}
                            onClick={() => {
                              setAcceptPathTarget({ ...row, path: key })
                              acceptPathDialog.handleOpen()
                            }}
                          >
                            Accept this property only
                          </Button>
                        )}
                        {drifted && !acceptedPath && (
                          <Button
                            size="small"
                            variant="outlined"
                            color="error"
                            startIcon={<RemoveCircle />}
                            onClick={() => {
                              setDenyPathTarget({ ...row, path: key })
                              denyPathDialog.handleOpen()
                            }}
                          >
                            Deny & queue deletion
                          </Button>
                        )}
                      </Stack>
                    </Box>
                  )
                })}
                {(differences.length > 0 ||
                  unmatchedDiffEntries.length > 0) && (
                  <Typography variant="caption" color="text.secondary">
                    Accepting a single property tolerates only that value -
                    drift on any other property still raises a deviation.
                  </Typography>
                )}
              </>
            ) : (
              <>
                {jsonBox(row.expectedValue, true)}
                <Typography variant="caption" color="text.secondary">
                  No data has been collected for this standard yet - this is the
                  configuration that will apply.
                </Typography>
              </>
            )}
            {(row.manual?.taskName || row.manual?.instructions) && (
              <>
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 600,
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                  }}
                >
                  Manual Task
                </Typography>
                <Box
                  sx={{
                    p: 1.5,
                    borderRadius: '12px',
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'background.paper',
                  }}
                >
                  {row.manual.taskName && (
                    <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                      {row.manual.taskName}
                    </Typography>
                  )}
                  {row.manual.instructions && (
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 0.5, whiteSpace: 'pre-wrap' }}
                    >
                      {row.manual.instructions}
                    </Typography>
                  )}
                  {row.manual.documentationUrl && (
                    <Link
                      href={row.manual.documentationUrl}
                      target="_blank"
                      rel="noreferrer"
                      variant="caption"
                      sx={{ display: 'inline-block', mt: 1 }}
                    >
                      Open documentation
                    </Link>
                  )}
                  {row.manual.reopen && row.manual.reopen !== 'once' && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: 'block', mt: 1 }}
                    >
                      Reopens {row.manual.reopen} after completion.
                    </Typography>
                  )}
                </Box>
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
                    label={outcomeTimeline[run.outcome]?.label ?? run.outcome}
                    color={outcomeTimeline[run.outcome]?.chipColor ?? 'error'}
                  />
                </Stack>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {runModeLabels[run.mode] ?? run.mode}, triggered by{' '}
                  {run.triggeredBy}
                  {run.remediated ? ', remediated' : ''}
                </Typography>
                {run.detail && (
                  <Typography
                    variant="caption"
                    sx={{ display: 'block', mt: 0.5 }}
                  >
                    {run.detail}
                  </Typography>
                )}
                <RunDetails diff={run.diff} />
              </Box>
            ))}
            <Button
              size="small"
              variant="outlined"
              startIcon={<Visibility />}
              sx={{ alignSelf: 'flex-start' }}
              onClick={() => {
                setHistoryFilters({
                  standard: row.standardLabel ? [row.standardLabel] : [],
                  outcome: [],
                  mode: [],
                  search: '',
                })
                setHistoryLimit(50)
                setViewMode('history')
              }}
            >
              View full history
            </Button>
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
          {
            label: 'Compliant with accepted deviations',
            value: `${row.alignedPercentage}%`,
          },
          {
            label: 'Compliant with baseline',
            value: `${row.verifiedPercentage}%`,
          },
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
                  label={tenantRow.status}
                  size="small"
                  color={deviationColors[tenantRow.status] ?? 'default'}
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
              {([
                'Drift',
                'Partially Accepted',
                'Denied - Remediate Pending',
              ].includes(tenantRow.status) ||
                tenantRow.sourceTemplate === 'Tenant Override') && (
                <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                  {[
                    'Drift',
                    'Partially Accepted',
                    'Denied - Remediate Pending',
                  ].includes(tenantRow.status) && (
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
      value: [{ id: 'status', value: 'Drift' }],
      type: 'column',
    },
    {
      filterName: 'Accepted',
      value: [{ id: 'status', value: 'Accepted' }],
      type: 'column',
    },
    {
      filterName: 'Denied',
      value: [{ id: 'status', value: 'Denied - Remediate Pending' }],
      type: 'column',
    },
    {
      filterName: 'License Missing',
      value: [{ id: 'status', value: 'Skipped - No License' }],
      type: 'column',
    },
  ]

  const standardFilterList = [
    {
      filterName: 'Has Open Deviations',
      value: [{ id: 'drift', value: 1 }],
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
      <ToggleButton value="history" aria-label="historic view">
        <Tooltip
          title="Every recorded run event for the selected tenant"
          placement="top"
        >
          <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
            <ClockIcon style={{ width: 16, height: 16, marginRight: 6 }} />
            Historic View
          </Box>
        </Tooltip>
      </ToggleButton>
    </ToggleButtonGroup>
  )

  const rolloutCard = (
    <CippButtonCard title={`Assigned Baselines - ${tenant.displayName}`}>
      {stageStates.length === 0 && (
        <Typography variant="body2" color="text.secondary">
          No baselines are assigned to this tenant.
        </Typography>
      )}
      <Grid container spacing={1.5}>
        {[...stageStates]
          .sort((a, b) =>
            String(a.templateName).localeCompare(String(b.templateName))
          )
          .map((state) => (
            <Grid key={state.templateId} size={{ xs: 12, md: 4 }}>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="subtitle2"
                    sx={{ fontWeight: 600 }}
                    noWrap
                  >
                    {state.templateName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Entered{' '}
                    {parseCippDate(state.enteredStageAt).toLocaleDateString()}
                  </Typography>
                </Box>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  flexWrap="wrap"
                  useFlexGap
                  sx={{ mt: 1 }}
                >
                  {state.alignedPercentage !== null && (
                    <Tooltip title="Alignment against the standards this baseline has rolled out to this tenant so far">
                      <Chip
                        variant="outlined"
                        size="small"
                        color={
                          state.alignedPercentage === 100
                            ? 'success'
                            : 'warning'
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
                {state.nextStage && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ display: 'block', mt: 1 }}
                  >
                    Next: Stage {state.currentStage + 1} ({state.nextStageName})
                    - advances when {describeStageConditions(state.nextStage)}
                  </Typography>
                )}
                {state.manualAdvance && (
                  <>
                    <Box sx={{ flexGrow: 1 }} />
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
            </Grid>
          ))}
      </Grid>
    </CippButtonCard>
  )

  const tenantScoreBar = (
    <CippInfoBar
      data={[
        {
          icon: <CheckBadgeIcon />,
          name: 'Compliant with accepted deviations',
          data: `${tenant.alignedPercentage}%`,
          color: 'success',
          toolTip: `${tenant.acceptedPercentage}% of this score comes from accepted deviations`,
        },
        {
          icon: <ShieldCheckIcon />,
          name: 'Compliant with baseline',
          data: `${tenant.verifiedPercentage}%`,
        },
        {
          icon: <ExclamationTriangleIcon />,
          name: 'Open Deviations',
          data: tenant.drift,
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
      {denyPathTarget && (
        <CippApiDialog
          createDialog={denyPathDialog}
          title="Deny Deviation - Queue Deletion"
          fields={[{ type: 'textField', name: 'reason', label: 'Reason' }]}
          api={{
            url: '/api/ExecUpdateBaselineDeviation',
            type: 'POST',
            data: {
              action: '!DenyPath',
              tenantFilter: 'tenantFilter',
              standard: 'standardName',
              path: 'path',
            },
            confirmText:
              'Deny [path] of [standardLabel]? It shows as Delete Pending and is DELETED from the tenant on the next remediation run. Only this object is deleted - other deviations are untouched. This cannot be undone.',
            relatedQueryKeys,
          }}
          row={denyPathTarget}
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

  // Historic view: every recorded baseline event for the tenant on an activity
  // timeline (same pattern as the manage-tenant history page). Engine runs touch
  // many standards under one run GUID, so those group into a collapsible summary
  // entry; operator events (triage, overrides, stage changes, deletions) stand on
  // their own. View Logs opens the Baselines log drawer filtered to one run.
  if (viewMode === 'history') {
    const historyEvents = historyApi.data?.events ?? []
    const standardOptions = [
      ...new Set(historyEvents.map((event) => event.standardLabel)),
    ]
      .filter(Boolean)
      .sort()
      .map((value) => ({ label: value, value }))
    const outcomeOptions = [
      ...new Set(historyEvents.map((event) => event.outcome)),
    ]
      .filter(Boolean)
      .sort()
      .map((value) => ({
        label: outcomeTimeline[value]?.label ?? value,
        value,
      }))
    const modeOptions = [...new Set(historyEvents.map((event) => event.mode))]
      .filter(Boolean)
      .map((value) => ({ label: runModeLabels[value] ?? value, value }))
    const searchTerm = historyFilters.search.trim().toLowerCase()
    const filteredEvents = historyEvents.filter(
      (event) =>
        (historyFilters.standard.length === 0 ||
          historyFilters.standard.includes(event.standardLabel)) &&
        (historyFilters.outcome.length === 0 ||
          historyFilters.outcome.includes(event.outcome)) &&
        (historyFilters.mode.length === 0 ||
          historyFilters.mode.includes(event.mode)) &&
        (!searchTerm ||
          `${event.standardLabel} ${event.outcome} ${event.detail ?? ''} ${event.triggeredBy}`
            .toLowerCase()
            .includes(searchTerm))
    )
    // Group by run GUID (newest-first order preserved); multi-event groups render
    // as one collapsible summary. Flattening to render rows up front lets the
    // timeline connector stop at the true last item.
    const runGroups = []
    const groupIndex = new Map()
    for (const event of filteredEvents) {
      const key = String(event.runId ?? 'unknown')
      if (groupIndex.has(key)) {
        runGroups[groupIndex.get(key)].events.push(event)
      } else {
        groupIndex.set(key, runGroups.length)
        runGroups.push({ runId: key, events: [event] })
      }
    }
    const visibleGroups = runGroups.slice(0, historyLimit)
    const renderRows = []
    for (const group of visibleGroups) {
      if (group.events.length === 1) {
        renderRows.push({ type: 'event', event: group.events[0] })
      } else {
        renderRows.push({ type: 'group', group })
        if (expandedRuns.has(group.runId)) {
          for (const event of group.events) {
            renderRows.push({ type: 'event', event })
          }
        }
      }
    }
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
              <CippApiLogsDrawer
                apiFilter="Baselines"
                buttonText="View Logs"
                title="Baseline Logs"
                tenantFilter={currentTenant}
                variant="outlined"
              />
            </Stack>
            <Typography variant="body1" color="text.secondary">
              This timeline shows every recorded baseline event for{' '}
              {tenant.displayName} - runs, operator decisions, stage changes,
              and deletions.
            </Typography>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 4 }}>
                <TextField
                  fullWidth
                  label="Search Events"
                  value={historyFilters.search}
                  onChange={(event) =>
                    setHistoryFilter('search', event.target.value)
                  }
                  autoComplete="off"
                  placeholder="Search by standard, outcome, or operator..."
                  InputProps={{
                    startAdornment: (
                      <Search sx={{ mr: 1, color: 'text.secondary' }} />
                    ),
                  }}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <CippAutoComplete
                  fullWidth
                  multiple={true}
                  creatable={false}
                  label="Standard"
                  placeholder="All standards"
                  options={standardOptions}
                  value={historyFilters.standard.map((value) => ({
                    label: value,
                    value,
                  }))}
                  onChange={(newValue) =>
                    setHistoryFilter(
                      'standard',
                      Array.isArray(newValue)
                        ? newValue.map((option) => option.value)
                        : []
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <CippAutoComplete
                  fullWidth
                  multiple={true}
                  creatable={false}
                  label="Outcome"
                  placeholder="All outcomes"
                  options={outcomeOptions}
                  value={historyFilters.outcome.map((value) => ({
                    label: outcomeTimeline[value]?.label ?? value,
                    value,
                  }))}
                  onChange={(newValue) =>
                    setHistoryFilter(
                      'outcome',
                      Array.isArray(newValue)
                        ? newValue.map((option) => option.value)
                        : []
                    )
                  }
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6, md: 2.5 }}>
                <CippAutoComplete
                  fullWidth
                  multiple={true}
                  creatable={false}
                  label="Event Type"
                  placeholder="All event types"
                  options={modeOptions}
                  value={historyFilters.mode.map((value) => ({
                    label: runModeLabels[value] ?? value,
                    value,
                  }))}
                  onChange={(newValue) =>
                    setHistoryFilter(
                      'mode',
                      Array.isArray(newValue)
                        ? newValue.map((option) => option.value)
                        : []
                    )
                  }
                />
              </Grid>
            </Grid>
            {historyApi.isFetching && (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            )}
            {!historyApi.isFetching && historyEvents.length === 0 && (
              <Alert severity="info">
                No baseline run history for this tenant yet - run a baseline
                first.
              </Alert>
            )}
            {!historyApi.isFetching &&
              historyEvents.length > 0 &&
              filteredEvents.length === 0 && (
                <Alert severity="info">
                  No events match the current filters.
                </Alert>
              )}
            {renderRows.length > 0 && (
              <Card sx={{ mr: 2 }}>
                <CardContent>
                  <Timeline
                    sx={{
                      [`& .MuiTimelineOppositeContent-root`]: {
                        flex: 0.2,
                        minWidth: 100,
                      },
                      [`& .MuiTimelineContent-root`]: { flex: 0.8 },
                    }}
                  >
                    {renderRows.map((row, index) => {
                      // Collapsed engine run: one summary entry with per-outcome
                      // counts; expanding reveals the individual standards below.
                      if (row.type === 'group') {
                        const group = row.group
                        const first = group.events[0]
                        const groupDate = parseCippDate(first.timestamp)
                        const outcomeCounts = {}
                        for (const groupEvent of group.events) {
                          outcomeCounts[groupEvent.outcome] =
                            (outcomeCounts[groupEvent.outcome] ?? 0) + 1
                        }
                        const severityRank = {
                          error: 4,
                          warning: 3,
                          info: 2,
                          success: 1,
                        }
                        const dotColor = group.events.reduce(
                          (worst, groupEvent) => {
                            const color =
                              outcomeTimeline[groupEvent.outcome]?.color ??
                              'grey'
                            return (severityRank[color] ?? 0) >
                              (severityRank[worst] ?? 0)
                              ? color
                              : worst
                          },
                          'grey'
                        )
                        const isOpen = expandedRuns.has(group.runId)
                        const alertedCount = group.events.filter(
                          (groupEvent) => groupEvent.alerted
                        ).length
                        return (
                          <TimelineItem key={`group-${group.runId}`}>
                            <TimelineOppositeContent
                              sx={{ m: 'auto 0', minWidth: 100, maxWidth: 100 }}
                              align="right"
                              variant="body2"
                              color="text.secondary"
                            >
                              <Typography
                                variant="caption"
                                display="block"
                                fontSize="0.7rem"
                              >
                                {groupDate.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </Typography>
                              <Typography
                                variant="caption"
                                display="block"
                                fontWeight="bold"
                                fontSize="0.75rem"
                              >
                                {groupDate.toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                  hour12: false,
                                })}
                              </Typography>
                            </TimelineOppositeContent>
                            <TimelineSeparator>
                              <TimelineDot
                                color={dotColor}
                                variant="outlined"
                                size="small"
                              >
                                {first.mode === 'compare' ? (
                                  <Compare />
                                ) : (
                                  <PlayArrow />
                                )}
                              </TimelineDot>
                              {index < renderRows.length - 1 && (
                                <TimelineConnector />
                              )}
                            </TimelineSeparator>
                            <TimelineContent sx={{ py: '8px', px: 2 }}>
                              <Stack spacing={1}>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={1}
                                  flexWrap="wrap"
                                >
                                  <Chip
                                    label={
                                      runModeLabels[first.mode] ?? first.mode
                                    }
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                  <Tooltip title={group.runId}>
                                    <Chip
                                      label={`Run ${String(group.runId).slice(0, 8)}`}
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                  </Tooltip>
                                  {Object.entries(outcomeCounts).map(
                                    ([outcome, count]) => (
                                      <Chip
                                        key={outcome}
                                        label={`${count} ${outcomeTimeline[outcome]?.label ?? outcome}`}
                                        color={
                                          outcomeTimeline[outcome]?.chipColor ??
                                          'default'
                                        }
                                        size="small"
                                        variant="outlined"
                                        sx={{ fontSize: '0.7rem', height: 20 }}
                                      />
                                    )
                                  )}
                                  {alertedCount > 0 && (
                                    <Chip
                                      label={`${alertedCount} alert${alertedCount === 1 ? '' : 's'} sent`}
                                      color="warning"
                                      size="small"
                                      variant="outlined"
                                      sx={{ fontSize: '0.7rem', height: 20 }}
                                    />
                                  )}
                                </Box>
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  Processed {group.events.length} standards in
                                  this run
                                </Typography>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Link
                                    component="button"
                                    variant="caption"
                                    onClick={() =>
                                      toggleRunExpansion(group.runId)
                                    }
                                    sx={{
                                      textAlign: 'left',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {isOpen
                                      ? 'Hide the individual standards'
                                      : `View all ${group.events.length} standards`}
                                  </Link>
                                  <CippApiLogsDrawer
                                    baselineRunFilter={group.runId}
                                    tenantFilter={currentTenant}
                                    buttonText="View Logs"
                                    title={`Run ${String(group.runId).slice(0, 8)} - Logs`}
                                    size="small"
                                    sx={{
                                      fontSize: '0.75rem',
                                      p: 0,
                                      minWidth: 0,
                                      textTransform: 'none',
                                    }}
                                  />
                                </Box>
                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                  sx={{ fontSize: '0.7rem' }}
                                >
                                  Triggered by {first.triggeredBy}
                                </Typography>
                              </Stack>
                            </TimelineContent>
                          </TimelineItem>
                        )
                      }
                      const event = row.event
                      const timelineConfig = outcomeTimeline[event.outcome] ?? {
                        color: 'grey',
                        chipColor: 'default',
                        icon: <InfoOutlined />,
                      }
                      const eventDate = parseCippDate(event.timestamp)
                      const eventKey = `${event.runId}-${event.standardName}-${event.outcome}-${event.timestamp}`
                      const isExpanded = expandedEvents.has(eventKey)
                      const diffEntries = event.diff
                        ? Array.isArray(event.diff)
                          ? event.diff
                          : [event.diff]
                        : []
                      return (
                        <TimelineItem key={`${eventKey}-${index}`}>
                          <TimelineOppositeContent
                            sx={{ m: 'auto 0', minWidth: 100, maxWidth: 100 }}
                            align="right"
                            variant="body2"
                            color="text.secondary"
                          >
                            <Typography
                              variant="caption"
                              display="block"
                              fontSize="0.7rem"
                            >
                              {eventDate.toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric',
                              })}
                            </Typography>
                            <Typography
                              variant="caption"
                              display="block"
                              fontWeight="bold"
                              fontSize="0.75rem"
                            >
                              {eventDate.toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                                hour12: false,
                              })}
                            </Typography>
                          </TimelineOppositeContent>
                          <TimelineSeparator>
                            <TimelineDot
                              color={timelineConfig.color}
                              variant="outlined"
                              size="small"
                            >
                              {timelineConfig.icon}
                            </TimelineDot>
                            {index < renderRows.length - 1 && (
                              <TimelineConnector />
                            )}
                          </TimelineSeparator>
                          <TimelineContent sx={{ py: '8px', px: 2 }}>
                            <Stack spacing={1}>
                              <Box
                                display="flex"
                                alignItems="center"
                                gap={1}
                                flexWrap="wrap"
                              >
                                <Chip
                                  label={timelineConfig.label ?? event.outcome}
                                  color={timelineConfig.chipColor}
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                <Chip
                                  label={
                                    runModeLabels[event.mode] ?? event.mode
                                  }
                                  size="small"
                                  variant="outlined"
                                  sx={{ fontSize: '0.7rem', height: 20 }}
                                />
                                <Tooltip title={event.runId}>
                                  <Chip
                                    label={`Run ${String(event.runId).slice(0, 8)}`}
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                </Tooltip>
                                {event.alerted && (
                                  <Chip
                                    label="Alert sent"
                                    color="warning"
                                    size="small"
                                    variant="outlined"
                                    sx={{ fontSize: '0.7rem', height: 20 }}
                                  />
                                )}
                              </Box>
                              <Box>
                                <Typography
                                  variant="body2"
                                  fontWeight="medium"
                                  sx={{ fontSize: '0.875rem' }}
                                >
                                  {historyEventMessage(event)}
                                </Typography>
                                <Box
                                  display="flex"
                                  alignItems="center"
                                  gap={2}
                                  sx={{ mt: 0.5 }}
                                >
                                  <Link
                                    component="button"
                                    variant="caption"
                                    onClick={() =>
                                      toggleEventExpansion(eventKey)
                                    }
                                    sx={{
                                      textAlign: 'left',
                                      fontSize: '0.75rem',
                                    }}
                                  >
                                    {isExpanded
                                      ? 'Hide details'
                                      : 'View details'}
                                  </Link>
                                  <CippApiLogsDrawer
                                    baselineRunFilter={event.runId}
                                    tenantFilter={currentTenant}
                                    buttonText="View Logs"
                                    title={`Run ${String(event.runId).slice(0, 8)} - Logs`}
                                    size="small"
                                    sx={{
                                      fontSize: '0.75rem',
                                      p: 0,
                                      minWidth: 0,
                                      textTransform: 'none',
                                    }}
                                  />
                                </Box>
                                {isExpanded && (
                                  <Box sx={{ mt: 0.5 }}>
                                    {diffEntries.map((entry, diffIndex) => (
                                      <Typography
                                        key={entry?.Property ?? diffIndex}
                                        variant="caption"
                                        sx={{
                                          fontFamily: 'monospace',
                                          display: 'block',
                                          wordBreak: 'break-word',
                                        }}
                                      >
                                        {entry?.Property}: expected{' '}
                                        {JSON.stringify(entry?.ExpectedValue)},
                                        found{' '}
                                        {JSON.stringify(entry?.ReceivedValue)}
                                      </Typography>
                                    ))}
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        fontFamily: 'monospace',
                                        display: 'block',
                                        wordBreak: 'break-word',
                                        color: 'text.secondary',
                                      }}
                                    >
                                      Run ID: {event.runId}
                                    </Typography>
                                  </Box>
                                )}
                              </Box>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                                sx={{ fontSize: '0.7rem' }}
                              >
                                Triggered by {event.triggeredBy}
                              </Typography>
                            </Stack>
                          </TimelineContent>
                        </TimelineItem>
                      )
                    })}
                  </Timeline>
                </CardContent>
              </Card>
            )}
            {runGroups.length > historyLimit && (
              <Button
                variant="outlined"
                sx={{ alignSelf: 'center' }}
                onClick={() => setHistoryLimit((prev) => prev + 50)}
              >
                Load more (showing {historyLimit} of {runGroups.length} entries)
              </Button>
            )}
            {dialogs}
          </Stack>
        </Container>
      </>
    )
  }

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
              <Stack direction="row" spacing={1} alignItems="center">
                <CippQueueTracker
                  queueId={latestBaselineQueueId}
                  queryKey={`ListBaselineAlignment-${currentTenant}`}
                  title="Baseline Run"
                />
                <CippBaselineWhatIfReport
                  tenant={tenant}
                  stageStates={stageStates}
                  baselines={baselines}
                  catalog={catalog}
                />
              </Stack>
            </Stack>
            {tenantScoreBar}
            {rolloutCard}
            <CippDataTable
              queryKey={`ListBaselineAlignment-${currentTenant}-standards-table`}
              title={`Applicable Standards - ${tenant.displayName}`}
              data={tenant.rows}
              isFetching={resolvedApi.isFetching}
              refreshFunction={resolvedApi}
              actions={tenantActions}
              offCanvas={tenantOffCanvas}
              offCanvasOnRowClick={true}
              filters={[...initialStatusFilter, ...tenantFilterList]}
              simpleColumns={[
                'standardLabel',
                'category',
                'stage',
                'status',
                'deviationReason',
                'deviationBy',
                'deviationAt',
                'deviationExpires',
                'sourceTemplate',
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
      isFetching={
        isTemplateView ? baselinesApi.isFetching : aggregateApi.isFetching
      }
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
              'drift',
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
