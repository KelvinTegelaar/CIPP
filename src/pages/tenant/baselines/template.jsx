import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  SvgIcon,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { Grid } from '@mui/system'
import {
  Add,
  CheckCircle,
  ContentCopy,
  Delete,
  ExpandMore,
  PlayArrow,
  RadioButtonUnchecked,
  SaveRounded,
} from '@mui/icons-material'
import ArrowLeftIcon from '@mui/icons-material/ArrowLeft'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import { get } from 'lodash'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippHead } from '../../../components/CippComponents/CippHead'
import CippButtonCard from '../../../components/CippCards/CippButtonCard'
import { CippPropertyListCard } from '../../../components/CippCards/CippPropertyListCard'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippFormTenantSelector } from '../../../components/CippComponents/CippFormTenantSelector'
import CippBaselineStandardItem from '../../../components/CippBaselines/CippBaselineStandardItem'
import CippBaselineStandardDialog from '../../../components/CippBaselines/CippBaselineStandardDialog'
import { PermissionButton } from '../../../utils/permissions.js'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { parseCippDate } from '../../../utils/parse-cipp-date'
import { CippApiResults } from '../../../components/CippComponents/CippApiResults'

const conditionTypeOptions = [
  { label: 'Time in previous stage', value: 'time' },
  { label: 'Tenant variable', value: 'variable' },
  { label: 'All previous stage items applied successfully', value: 'success' },
  { label: 'Manual approval by an operator', value: 'manual' },
]

const operatorOptions = [
  { label: 'Equals', value: 'eq' },
  { label: 'Not equals', value: 'ne' },
  { label: 'Starts with', value: 'startsWith' },
  { label: 'Does not start with', value: 'notStartsWith' },
]

const unitOptions = [
  { label: 'Days', value: 'days' },
  { label: 'Weeks', value: 'weeks' },
]

const logicOptions = [
  { label: 'All conditions must match (AND)', value: 'and' },
  { label: 'Any condition may match (OR)', value: 'or' },
]

// Convert a stored condition into the option objects the form fields expect. Stored
// variables become their own option so prefill never depends on the variables list load.
const toConditionDefaults = (condition) => ({
  type: conditionTypeOptions.find((option) => option.value === condition.type),
  days: condition.days,
  unit: unitOptions.find(
    (option) => option.value === (condition.unit ?? 'days')
  ),
  variable: condition.variable
    ? { label: condition.variable, value: condition.variable }
    : undefined,
  operator: operatorOptions.find(
    (option) => option.value === condition.operator
  ),
  value: condition.value,
})

// The API serializes single-element arrays as a bare object; normalize before handing
// values to the (multiple) tenant selector. Returns null when there is nothing usable
// so callers can fall back.
const toOptionArray = (value) => {
  const entries = (Array.isArray(value) ? value : value ? [value] : []).filter(
    (entry) => entry && typeof entry === 'object' && entry.value
  )
  return entries.length > 0 ? entries : null
}

const buildEditorStages = (templateDefinition) =>
  (
    templateDefinition?.stages ?? [
      { name: 'Default', standards: [], conditions: [], logic: 'and' },
    ]
  ).map((stage) => ({
    name: stage.name,
    standards: [...stage.standards],
    // Saved per-instance configuration (variables + action posture) keyed by
    // instance key, so the stage form can seed fields with what was saved.
    standardConfigs: Object.fromEntries(
      (stage.standardsConfig ?? []).map((config) => [
        config.instance ?? config.standard,
        config,
      ])
    ),
    conditionIds: stage.conditions.map((condition, index) => `c${index + 1}`),
    conditionDefaults: Object.fromEntries(
      stage.conditions.map((condition, index) => [
        `c${index + 1}`,
        toConditionDefaults(condition),
      ])
    ),
    logic: logicOptions.find(
      (option) => option.value === (stage.logic ?? 'and')
    ),
  }))

// One panel per stage with its own form, so the same standard configured in two stages never
// collides. Panels stay mounted (hidden) so switching tabs keeps configuration.
const StagePanel = ({
  stageIndex,
  stage,
  hidden,
  onStageNameChange,
  onRemoveStage,
  onOpenDialog,
  onRemoveStandard,
  canRemoveStage,
  tenantsInStage,
  catalogByName,
  registerSerializer,
  variableOptions,
}) => {
  const formControl = useForm({
    mode: 'onBlur',
    defaultValues: {
      conditionLogic: stage.logic ?? logicOptions[0],
      conditions: stage.conditionDefaults,
    },
  })
  const watchForm = useWatch({ control: formControl.control })
  const [expandedStandard, setExpandedStandard] = useState(null)
  const [conditionIds, setConditionIds] = useState(stage.conditionIds)
  const [nextConditionId, setNextConditionId] = useState(
    stage.conditionIds.length + 1
  )

  const handleAddCondition = () => {
    setConditionIds((prev) => [...prev, `c${nextConditionId}`])
    setNextConditionId((prev) => prev + 1)
  }

  const handleRemoveCondition = (conditionId) => {
    setConditionIds((prev) => prev.filter((id) => id !== conditionId))
    formControl.unregister(`conditions.${conditionId}`)
  }

  const handleRemoveStandard = (standardName) => {
    formControl.unregister(standardName)
    onRemoveStandard(stageIndex, standardName)
  }

  // Bulk posture: apply one action setting to every standard in this stage.
  const [bulkAnchor, setBulkAnchor] = useState(null)
  const bulkPostureOptions = [
    {
      label: 'Report only (no auto-remediation)',
      field: 'remediateEnabled',
      value: false,
    },
    {
      label: 'Automatically fix when settings drift',
      field: 'remediateEnabled',
      value: true,
    },
    { label: 'Alert on new deviation', field: 'alertEnabled', value: true },
    { label: 'Alert when remediated', field: 'alertOnRemediate', value: true },
  ]
  const applyPostureToAll = (field, value) => {
    stage.standards.forEach((instanceKey) => {
      formControl.setValue(`${instanceKey}.${field}`, value)
    })
  }

  // Instance keys ('Name' or 'Name#n' for multi-instance standards) resolve to their base
  // catalog definition.
  const stageStandards = stage.standards
    .map((instanceKey) => ({
      instanceKey,
      standard: catalogByName[instanceKey.split('#')[0]],
    }))
    .filter((entry) => Boolean(entry.standard))

  // Registered every render so the save handler always serializes the latest form values.
  useEffect(() => {
    const unwrapValue = (value) =>
      value && typeof value === 'object' && 'value' in value
        ? value.value
        : value
    registerSerializer(stageIndex, () => {
      const values = formControl.getValues()
      return {
        name: stage.name,
        logic: unwrapValue(values.conditionLogic) ?? 'and',
        conditions: conditionIds.map((conditionId) => {
          const condition = values.conditions?.[conditionId] ?? {}
          return {
            type: unwrapValue(condition.type),
            days: condition.days,
            unit: unwrapValue(condition.unit),
            variable: unwrapValue(condition.variable),
            operator: unwrapValue(condition.operator),
            value: condition.value,
          }
        }),
        standards: stage.standards.map((instanceKey) => {
          const config = values[instanceKey] ?? {}
          return {
            standard: instanceKey.split('#')[0],
            instance: instanceKey,
            variables: Object.fromEntries(
              Object.entries(config.variables ?? {}).map(([key, value]) => [
                key,
                unwrapValue(value),
              ])
            ),
            remediateEnabled: config.remediateEnabled ?? true,
            alertEnabled: config.alertEnabled ?? true,
            alertOnRemediate: config.alertOnRemediate ?? false,
          }
        }),
      }
    })
    return () => registerSerializer(stageIndex, null)
  })

  return (
    <Box hidden={hidden}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <TextField
            label="Stage Name"
            size="small"
            value={stage.name}
            onChange={(event) =>
              onStageNameChange(stageIndex, event.target.value)
            }
            sx={{ maxWidth: 320 }}
          />
          {tenantsInStage && (
            <Tooltip
              title={
                tenantsInStage.length > 0
                  ? tenantsInStage.join(', ')
                  : 'No tenants are currently in this stage'
              }
            >
              <Chip
                variant="outlined"
                size="small"
                color={tenantsInStage.length > 0 ? 'info' : 'default'}
                label={`${tenantsInStage.length} tenant${tenantsInStage.length === 1 ? '' : 's'} in this stage`}
              />
            </Tooltip>
          )}
          <Box sx={{ flexGrow: 1 }} />
          {canRemoveStage && (
            <Tooltip title="Remove this stage">
              <IconButton
                onClick={() => onRemoveStage(stageIndex)}
                color="error"
              >
                <Delete />
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {stageIndex === 0 ? (
          <Alert severity="info">
            Stage 1 always applies to the assigned tenants. Graduation
            conditions configure when tenants advance into the following stages.
          </Alert>
        ) : (
          <Stack spacing={2}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Graduation conditions
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tenants graduate from Stage {stageIndex} into this stage when the
              conditions below are met. Stages are cumulative: a tenant in this
              stage also receives everything from the previous stages. If this
              stage configures a standard an earlier stage also configures, the
              settings here replace the earlier ones once the tenant arrives.
            </Typography>
            {conditionIds.length > 1 && (
              <Box sx={{ maxWidth: 380 }}>
                <CippFormComponent
                  type="autoComplete"
                  name="conditionLogic"
                  label="Condition Logic"
                  formControl={formControl}
                  options={logicOptions}
                  multiple={false}
                  creatable={false}
                />
              </Box>
            )}
            {conditionIds.length === 0 && (
              <Alert severity="warning">
                No conditions configured - tenants can only be moved into this
                stage manually.
              </Alert>
            )}
            {conditionIds.map((conditionId) => {
              const conditionType = get(
                watchForm,
                `conditions.${conditionId}.type`
              )?.value
              return (
                <Card key={conditionId} variant="outlined">
                  <CardContent>
                    <Stack spacing={2}>
                      <Stack
                        direction="row"
                        spacing={2}
                        alignItems="flex-start"
                      >
                        <Box sx={{ flexGrow: 1 }}>
                          <CippFormComponent
                            type="autoComplete"
                            name={`conditions.${conditionId}.type`}
                            label="Condition"
                            formControl={formControl}
                            options={conditionTypeOptions}
                            multiple={false}
                            creatable={false}
                          />
                        </Box>
                        <Tooltip title="Remove this condition">
                          <IconButton
                            size="small"
                            onClick={() => handleRemoveCondition(conditionId)}
                          >
                            <Delete fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                      {conditionType === 'time' && (
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={2}
                        >
                          <Box sx={{ flex: 1 }}>
                            <CippFormComponent
                              type="number"
                              name={`conditions.${conditionId}.days`}
                              label="Duration in the previous stage"
                              formControl={formControl}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <CippFormComponent
                              type="autoComplete"
                              name={`conditions.${conditionId}.unit`}
                              label="Unit"
                              formControl={formControl}
                              options={unitOptions}
                              multiple={false}
                              creatable={false}
                            />
                          </Box>
                        </Stack>
                      )}
                      {conditionType === 'variable' && (
                        <Stack
                          direction={{ xs: 'column', md: 'row' }}
                          spacing={2}
                        >
                          <Box sx={{ flex: 1 }}>
                            <CippFormComponent
                              type="autoComplete"
                              name={`conditions.${conditionId}.variable`}
                              label="Variable"
                              formControl={formControl}
                              options={variableOptions}
                              multiple={false}
                              creatable={true}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <CippFormComponent
                              type="autoComplete"
                              name={`conditions.${conditionId}.operator`}
                              label="Operator"
                              formControl={formControl}
                              options={operatorOptions}
                              multiple={false}
                              creatable={false}
                            />
                          </Box>
                          <Box sx={{ flex: 1 }}>
                            <CippFormComponent
                              type="textField"
                              name={`conditions.${conditionId}.value`}
                              label="Value"
                              formControl={formControl}
                            />
                          </Box>
                        </Stack>
                      )}
                      {conditionType === 'success' && (
                        <Typography variant="body2" color="text.secondary">
                          Advances when every standard from the previous stages
                          reports Compliant for the tenant.
                        </Typography>
                      )}
                      {conditionType === 'manual' && (
                        <Typography variant="body2" color="text.secondary">
                          An operator advances the tenant from the Alignment
                          page.
                        </Typography>
                      )}
                    </Stack>
                  </CardContent>
                </Card>
              )
            })}
            <Box>
              <Button
                variant="outlined"
                size="small"
                startIcon={<Add />}
                onClick={handleAddCondition}
              >
                Add Condition
              </Button>
            </Box>
          </Stack>
        )}

        <Divider />
        <Stack direction="row" spacing={2} alignItems="center">
          <Typography variant="subtitle1" sx={{ fontWeight: 600, flexGrow: 1 }}>
            Standards in this stage ({stageStandards.length})
          </Typography>
          <Button
            variant="outlined"
            endIcon={<ExpandMore />}
            disabled={stageStandards.length === 0}
            onClick={(event) => setBulkAnchor(event.currentTarget)}
          >
            Set all standards to
          </Button>
          <Menu
            anchorEl={bulkAnchor}
            open={Boolean(bulkAnchor)}
            onClose={() => setBulkAnchor(null)}
          >
            {bulkPostureOptions.map((option) => (
              <MenuItem
                key={option.label}
                onClick={() => {
                  applyPostureToAll(option.field, option.value)
                  setBulkAnchor(null)
                }}
              >
                {option.label}
              </MenuItem>
            ))}
          </Menu>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => onOpenDialog(stageIndex)}
          >
            Add Standards
          </Button>
        </Stack>
        {stageStandards.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No standards in this stage yet. Use Add Standards to browse the
            catalog.
          </Typography>
        )}
        <Stack spacing={1.5}>
          {stageStandards.map(({ instanceKey, standard }) => (
            <CippBaselineStandardItem
              key={instanceKey}
              standard={standard}
              instanceId={instanceKey}
              savedConfig={stage.standardConfigs?.[instanceKey]}
              formControl={formControl}
              expanded={expandedStandard === instanceKey}
              onToggle={() =>
                setExpandedStandard((prev) =>
                  prev === instanceKey ? null : instanceKey
                )
              }
              onRemove={handleRemoveStandard}
            />
          ))}
        </Stack>
      </Stack>
    </Box>
  )
}

const Page = () => {
  const router = useRouter()
  const [activeStage, setActiveStage] = useState(0)
  const [loadedTemplateId, setLoadedTemplateId] = useState(null)
  const [stages, setStages] = useState(() => buildEditorStages(undefined))
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogStageIndex, setDialogStageIndex] = useState(0)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [addStageAnchor, setAddStageAnchor] = useState(null)
  const stageSerializers = useRef({})

  const definitionsApi = ApiGetCall({
    url: '/api/ListBaselineStandards',
    queryKey: 'ListBaselineStandards',
  })
  const baselinesApi = ApiGetCall({
    url: '/api/ListBaselines',
    queryKey: 'ListBaselines',
  })
  // Saving a baseline invalidates every baseline-related query: the baselines list (direct
  // and table), all alignment views for every tenant, and the standards catalog.
  const saveBaseline = ApiPostCall({
    relatedQueryKeys: ['ListBaseline*'],
  })
  // After a save, the natural next step is seeing where the tenants stand - offer a
  // no-changes check right away instead of ending the setup flow in silence.
  const runAfterSave = ApiPostCall({
    relatedQueryKeys: ['ListBaseline*'],
  })
  const customVariablesApi = ApiGetCall({
    url: '/api/ListCustomVariables',
    queryKey: 'ListCustomVariables',
  })
  // Graduation conditions compare against CIPP custom variables; reserved tenant tokens
  // are not useful graduation signals. Creatable, so any variable name can be typed.
  const variableOptions = (customVariablesApi.data?.Results ?? [])
    .filter((variable) => variable.Type !== 'reserved')
    .map((variable) => ({ label: variable.Variable, value: variable.Variable }))

  const catalog = definitionsApi.data ?? []
  const catalogByName = Object.fromEntries(
    catalog.map((standard) => [standard.name, standard])
  )
  const template = (baselinesApi.data ?? []).find(
    (entry) => entry.GUID === router.query.id
  )
  const formControl = useForm({
    mode: 'onBlur',
    defaultValues: {
      templateName: '',
      description: '',
      alertEmails: '',
      alertWebhookUrl: '',
    },
  })
  const watchForm = useWatch({ control: formControl.control })

  // Load the selected template's content into the editor once the route is ready.
  // Render-phase reset (not an effect) so the switch happens before anything paints.
  if (template && template.GUID !== loadedTemplateId) {
    setLoadedTemplateId(template.GUID)
    setStages(buildEditorStages(template))
    setActiveStage(0)
    setHasUnsavedChanges(false)
    formControl.reset({
      templateName: router.query.clone
        ? `${template.templateName} (Clone)`
        : template.templateName,
      description: template.description,
      alertEmails: template.alertEmails ?? '',
      alertWebhookUrl: template.alertWebhookUrl ?? '',
      // The tenant selector's own option objects round-trip verbatim through the API
      // (assignments/exclusions); older saves fall back to name-based options.
      tenantFilter:
        toOptionArray(template.assignments) ??
        (template.assignedTenants ?? []).map((value) => ({
          label: value,
          value,
        })),
      excludedTenants:
        toOptionArray(template.exclusions) ??
        (template.excludedTenants ?? []).map((value) => ({
          label: value,
          value,
        })),
    })
  }

  // Structural changes set the flag explicitly; field edits are tracked by the form itself.
  const unsavedChanges = hasUnsavedChanges || formControl.formState.isDirty

  // Warn before navigating away with unsaved changes (browser close + in-app navigation).
  const handleRouteChange = useCallback(() => {
    if (unsavedChanges) {
      const confirmLeave = window.confirm(
        'You have unsaved changes. Are you sure you want to leave this page?'
      )
      if (!confirmLeave) {
        router.events.emit('routeChangeError')
        throw 'Route change was aborted'
      }
    }
  }, [unsavedChanges, router])

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (unsavedChanges) {
        event.preventDefault()
        event.returnValue =
          'You have unsaved changes. Are you sure you want to leave this page?'
        return event.returnValue
      }
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    router.events.on('routeChangeStart', handleRouteChange)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      router.events.off('routeChangeStart', handleRouteChange)
    }
  }, [unsavedChanges, handleRouteChange, router.events])

  const markDirty = () => {
    setHasUnsavedChanges(true)
  }

  const mutateStages = (mutator) => {
    setStages(mutator)
    markDirty()
  }

  const handleStageNameChange = (stageIndex, name) =>
    mutateStages((prev) =>
      prev.map((stage, index) =>
        index === stageIndex ? { ...stage, name } : stage
      )
    )

  const handleAddStage = () => {
    mutateStages((prev) => [
      ...prev,
      {
        name: `Stage ${prev.length + 1}`,
        standards: [],
        standardConfigs: {},
        conditionIds: ['c1'],
        conditionDefaults: {
          c1: toConditionDefaults({ type: 'time', days: 7 }),
        },
        logic: logicOptions[0],
      },
    ])
    setActiveStage(stages.length)
  }

  const handleRemoveStage = (stageIndex) => {
    mutateStages((prev) => prev.filter((_, index) => index !== stageIndex))
    setActiveStage((prev) => Math.max(0, prev - 1))
  }

  // Duplicate a stage (standards + graduation condition structure) as a new stage at the end.
  const handleCopyStage = (stageIndex) => {
    mutateStages((prev) => {
      const source = prev[stageIndex]
      return [
        ...prev,
        {
          name: `${source.name} (Copy)`,
          standards: [...source.standards],
          standardConfigs: { ...source.standardConfigs },
          conditionIds: [...source.conditionIds],
          conditionDefaults: { ...source.conditionDefaults },
          logic: source.logic,
        },
      ]
    })
    setActiveStage(stages.length)
  }

  const handleRemoveStandard = (stageIndex, standardName) =>
    mutateStages((prev) =>
      prev.map((stage, index) =>
        index === stageIndex
          ? {
              ...stage,
              standards: stage.standards.filter(
                (name) => name !== standardName
              ),
            }
          : stage
      )
    )

  const handleToggleStandard = (standardName) =>
    mutateStages((prev) =>
      prev.map((stage, index) => {
        if (index !== dialogStageIndex) return stage
        const isMultiple = catalogByName[standardName]?.multiple === true
        if (isMultiple) {
          // Multi-instance standards: every instance gets a unique id ('Name#<id>') so
          // instances from different baselines never collide by accident - conflict
          // detection compares real identities, not positional counters.
          const instanceId =
            globalThis.crypto?.randomUUID?.().slice(0, 8) ??
            Math.random().toString(36).slice(2, 10)
          return {
            ...stage,
            standards: [...stage.standards, `${standardName}#${instanceId}`],
          }
        }
        return stage.standards.includes(standardName)
          ? {
              ...stage,
              standards: stage.standards.filter(
                (name) => name !== standardName
              ),
            }
          : { ...stage, standards: [...stage.standards, standardName] }
      })
    )

  const handleOpenDialog = (stageIndex) => {
    setDialogStageIndex(stageIndex)
    setDialogOpen(true)
  }

  const stageOccupancy = template?.occupancy ?? []

  const registerSerializer = useCallback((index, serialize) => {
    if (serialize) {
      stageSerializers.current[index] = serialize
    } else {
      delete stageSerializers.current[index]
    }
  }, [])

  const uniqueStandards = [
    ...new Set(stages.flatMap((stage) => stage.standards)),
  ]
  // Secure Score counts once per standard type, regardless of instances.
  const secureScorePotential = [
    ...new Set(uniqueStandards.map((key) => key.split('#')[0])),
  ].reduce(
    (acc, name) => acc + (catalogByName[name]?.secureScoreImpact ?? 0),
    0
  )

  // Read through to getValues: useWatch can miss the render-phase reset when the
  // baseline was already cached, which left the save button disabled until an edit.
  const steps = [
    {
      label: 'Set a baseline name',
      done: !!(
        watchForm?.templateName || formControl.getValues('templateName')
      ),
    },
    {
      label: 'Assign tenants or groups',
      done:
        (watchForm?.tenantFilter ?? formControl.getValues('tenantFilter') ?? [])
          .length > 0,
    },
    {
      label: 'Add standards to at least one stage',
      done: uniqueStandards.length > 0,
    },
  ]
  const isSaveDisabled = steps.some((step) => !step.done)

  const handleSave = () => {
    const values = formControl.getValues()
    saveBaseline.mutate({
      url: '/api/AddBaseline',
      data: {
        GUID: router.query.clone ? undefined : (loadedTemplateId ?? undefined),
        templateName: values.templateName,
        description: values.description,
        // Send the selector's option objects as-is (label/value/type) so they can be
        // stored and restored verbatim; the API reads the value for scope resolution.
        assignedTenants: (values.tenantFilter ?? []).map((entry) =>
          entry && typeof entry === 'object'
            ? { label: entry.label, value: entry.value, type: entry.type }
            : entry
        ),
        excludedTenants: (values.excludedTenants ?? []).map((entry) =>
          entry && typeof entry === 'object'
            ? { label: entry.label, value: entry.value, type: entry.type }
            : entry
        ),
        alertEmails: values.alertEmails,
        alertWebhookUrl: values.alertWebhookUrl,
        stages: stages.map(
          (stage, index) =>
            stageSerializers.current[index]?.() ?? {
              name: stage.name,
              logic: 'and',
              conditions: [],
              standards: [],
            }
        ),
      },
    })
    setHasUnsavedChanges(false)
    // Re-baseline the form so isDirty clears after the save.
    formControl.reset(formControl.getValues())
  }

  const pageTitle = template ? 'Edit Baseline' : 'Add Baseline'

  return (
    <Box sx={{ flexGrow: 1, px: 3, maxWidth: '1900px' }}>
      <CippHead title={pageTitle} />
      <Stack spacing={2}>
        <Box>
          <Button
            color="inherit"
            onClick={() => router.back()}
            startIcon={
              <SvgIcon fontSize="small">
                <ArrowLeftIcon />
              </SvgIcon>
            }
          >
            Back
          </Button>
        </Box>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          spacing={4}
          sx={{ mb: 1 }}
        >
          <Typography variant="h4">{pageTitle}</Typography>
          <Stack direction="row" spacing={2}>
            <PermissionButton
              requiredPermissions={['Tenant.Standards.ReadWrite']}
              variant="contained"
              color="primary"
              startIcon={<SaveRounded />}
              disabled={isSaveDisabled}
              onClick={handleSave}
            >
              Save Baseline
            </PermissionButton>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Add />}
              endIcon={<ExpandMore />}
              onClick={(event) => setAddStageAnchor(event.currentTarget)}
            >
              Add Stage
            </Button>
            <Menu
              anchorEl={addStageAnchor}
              open={Boolean(addStageAnchor)}
              onClose={() => setAddStageAnchor(null)}
            >
              <MenuItem
                onClick={() => {
                  handleAddStage()
                  setAddStageAnchor(null)
                }}
              >
                <ListItemIcon>
                  <Add fontSize="small" />
                </ListItemIcon>
                <ListItemText>Add empty stage</ListItemText>
              </MenuItem>
              <MenuItem
                onClick={() => {
                  handleCopyStage(activeStage)
                  setAddStageAnchor(null)
                }}
              >
                <ListItemIcon>
                  <ContentCopy fontSize="small" />
                </ListItemIcon>
                <ListItemText>
                  Copy currently selected stage ({stages[activeStage]?.name})
                </ListItemText>
              </MenuItem>
            </Menu>
          </Stack>
        </Stack>

        <CippApiResults apiObject={saveBaseline} />
        {saveBaseline.isSuccess && !runAfterSave.isSuccess && (
          <Alert
            severity="success"
            action={
              <Button
                color="inherit"
                size="small"
                startIcon={<PlayArrow />}
                disabled={runAfterSave.isPending}
                onClick={() =>
                  runAfterSave.mutate({
                    url: '/api/ExecBaselineRun',
                    data: {
                      mode: 'compare',
                      templateId:
                        saveBaseline.data?.data?.Metadata?.id ??
                        loadedTemplateId,
                    },
                  })
                }
              >
                Check tenants now
              </Button>
            }
          >
            Baseline saved. Want to see where the assigned tenants stand? A
            check makes no changes - results appear on the Alignment page.
            Otherwise the schedule picks it up within 12 hours.
          </Alert>
        )}
        <CippApiResults apiObject={runAfterSave} />

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2}>
              <CippButtonCard title="Baseline Details">
                <Stack spacing={2}>
                  <CippFormComponent
                    type="textField"
                    name="templateName"
                    label="Baseline Name"
                    formControl={formControl}
                    required
                  />
                  <CippFormComponent
                    type="textField"
                    name="description"
                    label="Description"
                    formControl={formControl}
                  />
                  <CippFormTenantSelector
                    formControl={formControl}
                    name="tenantFilter"
                    label="Assigned Tenants"
                    allTenants={true}
                    includeGroups={true}
                    required={false}
                  />
                  <CippFormTenantSelector
                    formControl={formControl}
                    name="excludedTenants"
                    label="Excluded Tenants"
                    required={false}
                    disableClearable={false}
                  />
                </Stack>
              </CippButtonCard>
              <CippButtonCard title="Alerting">
                <Stack spacing={2}>
                  <CippFormComponent
                    type="textField"
                    name="alertEmails"
                    label="Custom alert email addresses (comma separated)"
                    formControl={formControl}
                  />
                  <CippFormComponent
                    type="textField"
                    name="alertWebhookUrl"
                    label="Custom webhook URL"
                    formControl={formControl}
                  />
                  <Typography variant="caption" color="text.secondary">
                    Alerts follow each standard's alert settings. Leave these
                    empty to deliver through the global CIPP notification
                    settings (email, webhook, and PSA).
                  </Typography>
                </Stack>
              </CippButtonCard>
              <CippButtonCard title="Setup Progress">
                <Stack spacing={1}>
                  {steps.map((step) => (
                    <Stack
                      key={step.label}
                      direction="row"
                      spacing={1}
                      alignItems="center"
                    >
                      {step.done ? (
                        <CheckCircle fontSize="small" color="success" />
                      ) : (
                        <RadioButtonUnchecked
                          fontSize="small"
                          color="disabled"
                        />
                      )}
                      <Typography
                        variant="body2"
                        color={step.done ? 'text.primary' : 'text.secondary'}
                      >
                        {step.label}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </CippButtonCard>
              <CippPropertyListCard
                title="Baseline Summary"
                align="vertical"
                showDivider={false}
                propertyItems={[
                  { label: 'Stages', value: `${stages.length}` },
                  {
                    label: 'Standards across all stages',
                    value: `${uniqueStandards.length}`,
                  },
                  {
                    label: 'Potential Secure Score gain',
                    value: `+${secureScorePotential} points`,
                  },
                  {
                    label: 'Last updated',
                    value: template
                      ? `${parseCippDate(template.updatedAt).toLocaleString()} by ${template.updatedBy}`
                      : 'Not saved yet',
                  },
                ]}
              />
            </Stack>
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <Card>
              <Tabs
                value={activeStage}
                onChange={(event, value) => setActiveStage(value)}
                variant="scrollable"
              >
                {stages.map((stage, index) => (
                  <Tab
                    key={index}
                    label={`Stage ${index + 1}: ${stage.name}`}
                    value={index}
                  />
                ))}
              </Tabs>
              <Divider />
              <CardContent>
                {stages.map((stage, index) => (
                  <StagePanel
                    key={`${loadedTemplateId ?? 'new'}-${index}`}
                    stageIndex={index}
                    stage={stage}
                    hidden={activeStage !== index}
                    onStageNameChange={handleStageNameChange}
                    onRemoveStage={handleRemoveStage}
                    onOpenDialog={handleOpenDialog}
                    onRemoveStandard={handleRemoveStandard}
                    canRemoveStage={index > 0}
                    tenantsInStage={stageOccupancy[index]?.tenants ?? null}
                    catalogByName={catalogByName}
                    registerSerializer={registerSerializer}
                    variableOptions={variableOptions}
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <CippBaselineStandardDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        catalog={catalog}
        selectedStandards={stages[dialogStageIndex]?.standards ?? []}
        onToggle={handleToggleStandard}
      />
    </Box>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
