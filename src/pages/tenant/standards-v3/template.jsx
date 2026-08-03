import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Stack,
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
  Delete,
  ExpandMore,
  RadioButtonUnchecked,
  SaveRounded,
} from '@mui/icons-material'
import { useCallback, useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useRouter } from 'next/router'
import { get } from 'lodash'
import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { CippHead } from '../../../components/CippComponents/CippHead'
import CippButtonCard from '../../../components/CippCards/CippButtonCard'
import { CippPropertyListCard } from '../../../components/CippCards/CippPropertyListCard'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import { CippFormTenantSelector } from '../../../components/CippComponents/CippFormTenantSelector'
import CippStandardV3Item from '../../../components/CippStandardsV3/CippStandardV3Item'
import CippStandardV3Dialog from '../../../components/CippStandardsV3/CippStandardV3Dialog'
import { PermissionButton } from '../../../utils/permissions.js'
import {
  getTemplateStageOccupancy,
  standardsV3Catalog,
  standardsV3Templates,
  standardsV3Variables,
} from '../../../data/standards-v3-mock-data'

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

const variableOptions = standardsV3Variables.map((variable) => ({
  label: variable,
  value: variable,
}))

const catalogByName = Object.fromEntries(
  standardsV3Catalog.map((standard) => [standard.name, standard])
)

// Convert a stored condition into the option objects the form fields expect.
const toConditionDefaults = (condition) => ({
  type: conditionTypeOptions.find((option) => option.value === condition.type),
  days: condition.days,
  unit: unitOptions.find(
    (option) => option.value === (condition.unit ?? 'days')
  ),
  variable: variableOptions.find(
    (option) => option.value === condition.variable
  ),
  operator: operatorOptions.find(
    (option) => option.value === condition.operator
  ),
  value: condition.value,
})

const buildEditorStages = (templateDefinition) =>
  (
    templateDefinition?.stages ?? [
      { name: 'Stage 1', standards: [], conditions: [], logic: 'and' },
    ]
  ).map((stage) => ({
    name: stage.name,
    standards: [...stage.standards],
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
      label: 'Auto-remediate on drift',
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
                              creatable={false}
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
            <CippStandardV3Item
              key={instanceKey}
              standard={standard}
              instanceId={instanceKey}
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
  const [saved, setSaved] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  const template = standardsV3Templates.find(
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
    setSaved(false)
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
          // Multi-instance standards: every click adds another instance ('Name#n').
          const instanceCount = stage.standards.filter(
            (key) => key.split('#')[0] === standardName
          ).length
          const newKey =
            instanceCount === 0
              ? standardName
              : `${standardName}#${instanceCount}`
          return { ...stage, standards: [...stage.standards, newKey] }
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

  const stageOccupancy = loadedTemplateId
    ? getTemplateStageOccupancy(loadedTemplateId)
    : []

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

  const steps = [
    { label: 'Set a template name', done: !!watchForm?.templateName },
    {
      label: 'Assign tenants or groups',
      done: (watchForm?.tenantFilter?.length ?? 0) > 0,
    },
    {
      label: 'Add standards to at least one stage',
      done: uniqueStandards.length > 0,
    },
  ]
  const isSaveDisabled = steps.some((step) => !step.done)

  const handleSave = () => {
    setSaved(true)
    setHasUnsavedChanges(false)
    // Re-baseline the form so isDirty clears after the (mock) save.
    formControl.reset(formControl.getValues())
  }

  const pageTitle = template
    ? 'Edit Standards V3 Template'
    : 'Add Standards V3 Template'

  return (
    <Box sx={{ flexGrow: 1, px: 3, maxWidth: '1900px' }}>
      <CippHead title={pageTitle} />
      <Stack spacing={2}>
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
              Save Template
            </PermissionButton>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Add />}
              onClick={handleAddStage}
            >
              Add Stage
            </Button>
          </Stack>
        </Stack>

        {saved && (
          <Alert severity="success" onClose={() => setSaved(false)}>
            Mock save - in the real implementation this writes the template, its
            stages, and the per-stage standard configuration.
          </Alert>
        )}

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4 }}>
            <Stack spacing={2}>
              <CippButtonCard title="Template Details">
                <Stack spacing={2}>
                  <CippFormComponent
                    type="textField"
                    name="templateName"
                    label="Template Name"
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
                title="Template Summary"
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
                      ? `${new Date(template.updatedAt).toLocaleString()} by ${template.updatedBy}`
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
                  />
                ))}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Stack>

      <CippStandardV3Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        catalog={standardsV3Catalog}
        selectedStandards={stages[dialogStageIndex]?.standards ?? []}
        onToggle={handleToggleStandard}
      />
    </Box>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
