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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  DialogActions,
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

const Page = () => {
  const pageTitle = 'Scripts'
  const [codeOpen, setCodeOpen] = useState(false)
  const [codeContent, setCodeContent] = useState('')
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
    return currentScript?.scriptType?.toLowerCase() === ('macos' || 'linux')
      ? 'shell'
      : 'powershell'
  }, [currentScript?.scriptType])

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
        const scriptBytes = Buffer.from(data.scriptContent, 'base64')
        setCodeContent(scriptBytes.toString('ascii'))
      })
    }
  }, [scriptId, scriptRefetch])

  const handleScriptEdit = async (row, action) => {
    setScriptId(row.id)
    setScriptTenant(row?.Tenant || tenantFilter)
    setCodeOpen(!codeOpen)
  }

  const codeChange = (newValue, evt) => {
    setCodeContent(newValue)
    setCodeContentChanged(true)
  }

  const codeClosed = () => {
    if (codeContentChanged) {
      setWarnOpen(!warnOpen)
    } else {
      setCodeOpen(!codeOpen)
      setCodeContentChanged(false)
      setScriptId(null)
      setScriptTenant(null)
      setCodeContent('')
    }
  }

  const { refetch: saveScriptRefetch, isFetching: isSaving } = useQuery({
    queryKey: ['saveScript'],
    queryFn: async () => {
      const scriptBytes = Buffer.from(codeContent, 'ascii')
      const {
        runAs32Bit,
        id,
        displayName,
        description,
        scriptContent,
        runAsAccount,
        fileName,
        roleScopeTagIds,
        scriptType,
      } = currentScript
      const patchData = {
        TenantFilter: scriptTenant || tenantFilter,
        ScriptId: id,
        ScriptType: scriptType,
        IntuneScript: JSON.stringify({
          runAs32Bit,
          id,
          displayName,
          description,
          scriptContent: scriptBytes.toString('base64'), // Convert to base64
          runAsAccount,
          fileName,
          roleScopeTagIds,
        }),
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
    setCodeContentChanged(false)
    setCodeOpen(!codeOpen)
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
          defaultValue: 'replace',
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
        assignmentMode: formData?.assignmentMode || 'replace',
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
          defaultValue: 'replace',
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
        assignmentMode: formData?.assignmentMode || 'replace',
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
          defaultValue: 'replace',
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
        assignmentMode: formData?.assignmentMode || 'replace',
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
                (formValues?.assignmentMode || 'replace') === 'replace'
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
          defaultValue: 'replace',
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
          assignmentMode: formData?.assignmentMode || 'replace',
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
        cardButton={reportDB.controls}
      />

      <Dialog open={codeOpen} maxWidth="lg" fullWidth>
        <DialogTitle sx={{ py: 2 }}>
          Script Content
          {!isSaving && (
            <IconButton
              aria-label="close"
              onClick={codeClosed}
              sx={{ position: 'absolute', right: 8, top: 8 }}
            >
              <Close />
            </IconButton>
          )}
          {!isSaving && (
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
            <CippCodeBlock
              open={codeOpen}
              type="editor"
              code={codeContent}
              onChange={codeChange}
              language={language}
            />
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
              setCodeContent('')
              setScriptId(null)
              setScriptTenant(null)
              setCodeContentChanged(false)
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
