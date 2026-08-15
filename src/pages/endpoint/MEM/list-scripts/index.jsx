import { Layout as DashboardLayout } from '../../../../layouts/index'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage'
import {
  TrashIcon,
  PencilIcon,
  UserIcon,
  UserGroupIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'
import { showToast } from '../../../../store/toasts'
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  DialogActions,
  Tab,
  Tabs,
} from '@mui/material'
import { CippCodeBlock } from '../../../../components/CippComponents/CippCodeBlock'
import { useState, useEffect, useMemo } from 'react'
import { useDispatch } from 'react-redux'
import { Close, Save, LaptopChromebook } from '@mui/icons-material'
import { useSettings } from '../../../../hooks/use-settings'
import { Stack } from '@mui/system'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'

const assignmentModeOptions = [
  { label: 'Replace existing assignments', value: 'replace' },
  { label: 'Append to existing assignments', value: 'append' },
]

const assignmentDirectionOptions = [
  { label: 'Include these group(s)', value: 'include' },
  { label: 'Exclude these group(s)', value: 'exclude' },
]

// Remediation scripts (deviceHealthScripts) carry two payloads, everything else carries one.
const scriptContentFields = {
  Remediation: [
    { name: 'detectionScriptContent', label: 'Detection Script' },
    { name: 'remediationScriptContent', label: 'Remediation Script' },
  ],
}
const defaultScriptContentFields = [{ name: 'scriptContent', label: 'Script' }]

// Only keep fields the API actually returned, so an unexpected script type (e.g. a Linux
// settings-catalog policy, which has no script body at all) degrades to a message instead of
// throwing on Buffer.from(undefined).
const getScriptContentFields = (script) => {
  if (!script) return []
  const fields = scriptContentFields[script.scriptType] ?? defaultScriptContentFields
  return fields.filter((field) => script[field.name] !== undefined)
}

const decodeScript = (value) => (value ? Buffer.from(value, 'base64').toString('utf8') : '')
const encodeScript = (value) => Buffer.from(value ?? '', 'utf8').toString('base64')

const Page = () => {
  const pageTitle = 'Scripts'
  const [codeOpen, setCodeOpen] = useState(false)
  const [scriptContents, setScriptContents] = useState({})
  const [activeContentTab, setActiveContentTab] = useState(0)
  const [scriptId, setScriptId] = useState(null)
  const [saveScript, setSaveScript] = useState(false)
  const [codeContentChanged, setCodeContentChanged] = useState(false)
  const [warnOpen, setWarnOpen] = useState(false)
  const [currentScript, setCurrentScript] = useState(null)
  const [scriptTenant, setScriptTenant] = useState(null)

  const tenantFilter = useSettings().currentTenant
  const reportDB = useCippReportDB({
    apiUrl: '/api/ListIntuneScript',
    queryKey: 'ListIntuneScript',
    cacheName: 'IntuneScripts',
    syncTitle: 'Sync Intune Scripts Report',
    allowToggle: true,
    defaultCached: false,
  })

  const dispatch = useDispatch()

  const language = useMemo(() => {
    const scriptType = currentScript?.scriptType?.toLowerCase()
    return scriptType === 'macos' || scriptType === 'linux' ? 'shell' : 'powershell'
  }, [currentScript?.scriptType])

  const contentFields = useMemo(() => getScriptContentFields(currentScript), [currentScript])
  // Built-in Microsoft remediations cannot be modified, Graph rejects the PATCH.
  const isReadOnly = currentScript?.isGlobalScript === true
  const activeField = contentFields[activeContentTab]

  const {
    isLoading: scriptIsLoading,
    isRefetching: scriptIsFetching,
    refetch: scriptRefetch,
    data,
  } = useQuery({
    queryKey: ['script', { scriptId, scriptTenant }],
    queryFn: async () => {
      const response = await fetch(
        `/api/EditIntuneScript?TenantFilter=${scriptTenant || tenantFilter}&ScriptId=${scriptId}`
      )
      return response.json()
    },
    refetchOnWindowFocus: false,
    enabled: false,
  })

  // Refetch the script on scriptId change
  useEffect(() => {
    if (scriptId) {
      scriptRefetch().then(({ data }) => {
        setCurrentScript(data)
        const contents = {}
        getScriptContentFields(data).forEach((field) => {
          contents[field.name] = decodeScript(data?.[field.name])
        })
        setScriptContents(contents)
        setActiveContentTab(0)
      })
    }
  }, [scriptId, scriptRefetch])

  const resetScriptState = () => {
    setCodeContentChanged(false)
    setScriptId(null)
    setScriptTenant(null)
    setCurrentScript(null)
    setScriptContents({})
    setActiveContentTab(0)
  }

  const handleScriptEdit = async (row, action) => {
    // Clear the previous script so the dialog never shows stale content while the fetch is in flight.
    setCurrentScript(null)
    setScriptContents({})
    setActiveContentTab(0)
    setScriptId(row.id)
    setScriptTenant(row?.Tenant || tenantFilter)
    setCodeOpen(true)
  }

  const codeChange = (fieldName) => (newValue) => {
    setScriptContents((prev) => ({ ...prev, [fieldName]: newValue }))
    setCodeContentChanged(true)
  }

  const codeClosed = () => {
    if (codeContentChanged) {
      setWarnOpen(!warnOpen)
    } else {
      setCodeOpen(false)
      resetScriptState()
    }
  }

  const { refetch: saveScriptRefetch, isFetching: isSaving } = useQuery({
    queryKey: ['saveScript'],
    queryFn: async () => {
      const {
        runAs32Bit,
        id,
        displayName,
        description,
        runAsAccount,
        fileName,
        roleScopeTagIds,
        scriptType,
        publisher,
        enforceSignatureCheck,
      } = currentScript

      // Convert each editor back to base64 under the field name it came from.
      const encodedContent = {}
      contentFields.forEach((field) => {
        encodedContent[field.name] = encodeScript(scriptContents[field.name])
      })

      const intuneScript =
        scriptType === 'Remediation'
          ? {
              id,
              displayName,
              description,
              publisher,
              runAsAccount,
              runAs32Bit,
              enforceSignatureCheck,
              roleScopeTagIds,
              ...encodedContent,
            }
          : {
              runAs32Bit,
              id,
              displayName,
              description,
              runAsAccount,
              fileName,
              roleScopeTagIds,
              ...encodedContent,
            }

      const patchData = {
        TenantFilter: scriptTenant || tenantFilter,
        ScriptId: id,
        ScriptType: scriptType,
        IntuneScript: JSON.stringify(intuneScript),
      }

      const response = await fetch('/api/EditIntuneScript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patchData),
      })

      if (!response.ok) {
        dispatch(
          showToast({
            title: 'Script Save Error',
            message: 'Your Intune script could not be saved.',
            type: 'error',
          })
        )
      }

      return response.json()
    },
    enabled: false,
    refetchOnWindowFocus: false,
  })

  const queryClient = useQueryClient()

  const saveCode = async () => {
    const { data } = await saveScriptRefetch()
    setCodeOpen(false)
    resetScriptState()
    dispatch(
      showToast({
        title: 'Script Saved',
        message: 'Your Intune script has been saved successfully.',
        type: 'update',
      })
    )
  }

  // Map script type to Graph API endpoint
  const getScriptEndpoint = (scriptType) => {
    const mapping = {
      Windows: 'deviceManagementScripts',
      MacOS: 'deviceShellScripts',
      Remediation: 'deviceHealthScripts',
      Linux: 'configurationPolicies',
    }
    return mapping[scriptType] || 'deviceManagementScripts'
  }

  // Group picker (by ID) reused for both include and exclude selection
  const getGroupPickerField = (name, label, required) => ({
    type: 'autoComplete',
    name,
    label,
    multiple: true,
    creatable: false,
    allowResubmit: true,
    ...(required && { validators: { required: 'Please select at least one group' } }),
    api: {
      url: '/api/ListGraphRequest',
      dataKey: 'Results',
      queryKey: `ListScriptAssignmentGroups-${tenantFilter}`,
      labelField: (group) => (group.id ? `${group.displayName} (${group.id})` : group.displayName),
      valueField: 'id',
      addedField: {
        description: 'description',
      },
      data: {
        Endpoint: 'groups',
        manualPagination: true,
        $select: 'id,displayName,description',
        $orderby: 'displayName',
        $top: 999,
        $count: true,
      },
    },
  })

  const actions = [
    {
      label: 'Assign to All Users',
      type: 'POST',
      url: '/api/ExecAssignPolicy',
      allowResubmit: true,
      icon: <UserIcon />,
      color: 'info',
      fields: [
        {
          type: 'radio',
          name: 'assignmentMode',
          label: 'Assignment mode',
          options: assignmentModeOptions,
          defaultValue: 'append',
          helperText:
            'Replace will overwrite existing assignments. Append keeps current assignments and adds the new ones.',
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
      customDataformatter: (row, action, formData) => ({
        tenantFilter: tenantFilter === 'AllTenants' && row?.Tenant ? row.Tenant : tenantFilter,
        ID: row?.id,
        Type: getScriptEndpoint(row?.scriptType),
        AssignTo: 'allLicensedUsers',
        assignmentMode: formData?.assignmentMode || 'append',
      }),
    },
    {
      label: 'Assign to All Devices',
      type: 'POST',
      url: '/api/ExecAssignPolicy',
      allowResubmit: true,
      icon: <LaptopChromebook />,
      color: 'info',
      fields: [
        {
          type: 'radio',
          name: 'assignmentMode',
          label: 'Assignment mode',
          options: assignmentModeOptions,
          defaultValue: 'append',
          helperText:
            'Replace will overwrite existing assignments. Append keeps current assignments and adds the new ones.',
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
      customDataformatter: (row, action, formData) => ({
        tenantFilter: tenantFilter === 'AllTenants' && row?.Tenant ? row.Tenant : tenantFilter,
        ID: row?.id,
        Type: getScriptEndpoint(row?.scriptType),
        AssignTo: 'AllDevices',
        assignmentMode: formData?.assignmentMode || 'append',
      }),
    },
    {
      label: 'Assign Globally (All Users / All Devices)',
      type: 'POST',
      url: '/api/ExecAssignPolicy',
      allowResubmit: true,
      icon: <GlobeAltIcon />,
      color: 'info',
      fields: [
        {
          type: 'radio',
          name: 'assignmentMode',
          label: 'Assignment mode',
          options: assignmentModeOptions,
          defaultValue: 'append',
          helperText:
            'Replace will overwrite existing assignments. Append keeps current assignments and adds the new ones.',
        },
      ],
      confirmText: 'Are you sure you want to assign "[displayName]" to all users and devices?',
      customDataformatter: (row, action, formData) => ({
        tenantFilter: tenantFilter === 'AllTenants' && row?.Tenant ? row.Tenant : tenantFilter,
        ID: row?.id,
        Type: getScriptEndpoint(row?.scriptType),
        AssignTo: 'AllDevicesAndUsers',
        assignmentMode: formData?.assignmentMode || 'append',
      }),
    },
    {
      label: 'Assign to Custom Group',
      type: 'POST',
      url: '/api/ExecAssignPolicy',
      allowResubmit: true,
      icon: <UserGroupIcon />,
      color: 'info',
      confirmText: 'Select the target groups for "[displayName]".',
      fields: [
        { type: 'heading', label: 'Target groups' },
        {
          ...getGroupPickerField('groupTargets', 'Group(s)', false),
          helperText:
            'Leave empty with Exclude + Replace to remove all exclusions (keeps includes).',
          validators: {
            // Required, except Exclude + Replace where an empty selection clears all exclusions.
            validate: (value, formValues) => {
              if (
                formValues?.assignmentDirection === 'exclude' &&
                (formValues?.assignmentMode || 'append') === 'replace'
              ) {
                return true
              }
              return (
                (Array.isArray(value) && value.length > 0) || 'Please select at least one group'
              )
            },
          },
        },
        {
          type: 'radio',
          name: 'assignmentDirection',
          label: 'Assignment direction',
          options: assignmentDirectionOptions,
          defaultValue: 'include',
          // Re-validate the picker so the empty-allowed rule updates when direction changes.
          validators: { deps: ['groupTargets'] },
          helperText:
            'Include assigns to these groups; Exclude excludes them. Replace updates only this direction and keeps the other (and All Users/All Devices) intact.',
        },
        { type: 'heading', label: 'Assignment options' },
        {
          type: 'radio',
          name: 'assignmentMode',
          label: 'Assignment mode',
          options: assignmentModeOptions,
          defaultValue: 'append',
          // Re-validate the picker so the empty-allowed rule updates when mode changes.
          validators: { deps: ['groupTargets'] },
          helperText:
            'Replace updates only the selected direction and keeps the other direction plus All Users/All Devices. Append adds the selected groups to existing assignments.',
        },
      ],
      customDataformatter: (row, action, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : []
        const isExclude = formData?.assignmentDirection === 'exclude'
        const ids = selectedGroups.map((group) => group.value).filter(Boolean)
        const names = selectedGroups.map((group) => group.label).filter(Boolean)
        return {
          tenantFilter: tenantFilter === 'AllTenants' && row?.Tenant ? row.Tenant : tenantFilter,
          ID: row?.id,
          Type: getScriptEndpoint(row?.scriptType),
          GroupIds: isExclude ? [] : ids,
          GroupNames: isExclude ? [] : names,
          ExcludeGroupIds: isExclude ? ids : [],
          ExcludeGroupNames: isExclude ? names : [],
          assignmentDirection: formData?.assignmentDirection || 'include',
          assignmentMode: formData?.assignmentMode || 'append',
        }
      },
    },
    {
      label: 'Edit Script',
      icon: <PencilIcon />,
      color: 'primary',
      noConfirm: true,
      customFunction: handleScriptEdit,
    },
    {
      label: 'Delete Script',
      type: 'POST',
      url: '/api/RemoveIntuneScript',
      data: {
        ID: 'id',
        displayName: 'displayName',
        ScriptType: 'scriptType',
      },
      confirmText: 'Are you sure you want to delete this script?',
      icon: <TrashIcon />,
      color: 'danger',
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'scriptType',
      'id',
      'fileName',
      'displayName',
      'description',
      'lastModifiedDateTime',
      'runAsAccount',
      'createdDateTime',
      'runAs32Bit',
      'executionFrequency',
      'enforceSignatureCheck',
    ],
    actions: actions,
  }

  const simpleColumns = [
    ...reportDB.cacheColumns,
    'scriptType',
    'displayName',
    'ScriptAssignment',
    'ScriptExclude',
    'description',
    'runAsAccount',
    'lastModifiedDateTime',
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl={reportDB.resolvedApiUrl}
        queryKey={reportDB.resolvedQueryKey}
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        dataSourceControls={reportDB.controls}
      />

      <Dialog open={codeOpen} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2, pr: 12 }}>
          {currentScript?.displayName || 'Script Content'}
          {!isSaving && (
            <IconButton
              aria-label="close"
              onClick={codeClosed}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          )}
          {!isSaving && !isReadOnly && contentFields.length > 0 && (
            <IconButton
              aria-label="save"
              onClick={saveCode}
              sx={{ position: 'absolute', right: 50, top: 8 }}
            >
              <Save />
            </IconButton>
          )}
          {isSaving && (
            <CircularProgress size={20} sx={{ position: 'absolute', right: 55, top: 14 }} />
          )}
        </DialogTitle>
        <DialogContent dividers>
          {(scriptIsFetching || scriptIsLoading) && <CircularProgress size={40} />}
          {!scriptIsFetching && !scriptIsLoading && (
            <>
              {isReadOnly && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  This is a built-in Microsoft script and cannot be modified.
                </Alert>
              )}
              {currentScript && contentFields.length === 0 && (
                <Alert severity="warning">
                  This script type does not expose editable script content.
                </Alert>
              )}
              {contentFields.length > 1 && (
                <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                  <Tabs
                    value={activeContentTab}
                    onChange={(event, newValue) => setActiveContentTab(newValue)}
                    aria-label="Script content"
                  >
                    {contentFields.map((field) => (
                      <Tab key={field.name} label={field.label} />
                    ))}
                  </Tabs>
                </Box>
              )}
              {activeField && (
                <CippCodeBlock
                  key={activeField.name}
                  type="editor"
                  code={scriptContents[activeField.name] ?? ''}
                  onChange={codeChange(activeField.name)}
                  language={language}
                  readOnly={isReadOnly}
                />
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={warnOpen} fullWidth maxWidth="sm">
        <DialogTitle>Confirmation</DialogTitle>
        <DialogContent>
          <Stack spacing={3}>Changes detected, are you sure you want to close?</Stack>
        </DialogContent>
        <DialogActions>
          <Button color="inherit" onClick={() => setWarnOpen(false)}>
            Abort
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              setCodeOpen(false)
              setWarnOpen(false)
              resetScriptState()
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
      {reportDB.syncDialog}
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
