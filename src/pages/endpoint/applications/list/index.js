import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippApiDialog } from '../../../../components/CippComponents/CippApiDialog.jsx'
import { GlobeAltIcon, TrashIcon, UserIcon, UserGroupIcon } from '@heroicons/react/24/outline'
import {
  LaptopMac,
  Sync,
  Apps,
  CheckCircle,
  Cancel,
  CalendarToday,
  Assignment,
  BookmarkAdd,
} from '@mui/icons-material'
import { CippApplicationDeployDrawer } from '../../../../components/CippComponents/CippApplicationDeployDrawer'
import { Button, Paper, Avatar, Typography, Chip, Divider, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'
import { Box, Stack } from '@mui/system'
import { useCallback } from 'react'
import { useRouter } from 'next/router'
import { useSettings } from '../../../../hooks/use-settings.js'
import { useDialog } from '../../../../hooks/use-dialog.js'
import { getCippFormatting } from '../../../../utils/get-cipp-formatting'
import { getInitials, stringToColor } from '../../../../utils/get-initials'

const assignmentIntentOptions = [
  { label: 'Required', value: 'Required' },
  { label: 'Available', value: 'Available' },
  { label: 'Available without enrollment', value: 'AvailableWithoutEnrollment' },
  { label: 'Uninstall', value: 'Uninstall' },
]

const assignmentModeOptions = [
  { label: 'Replace existing assignments', value: 'replace' },
  { label: 'Append to existing assignments', value: 'append' },
]

const assignmentFilterTypeOptions = [
  { label: 'Include - Apply to devices matching filter', value: 'include' },
  { label: 'Exclude - Apply to devices NOT matching filter', value: 'exclude' },
]

const assignmentDirectionOptions = [
  { label: 'Include these group(s)', value: 'include' },
  { label: 'Exclude these group(s)', value: 'exclude' },
]

const getAppAssignmentSettingsType = (odataType) => {
  if (!odataType || typeof odataType !== 'string') {
    return undefined
  }

  return odataType.replace('#microsoft.graph.', '').replace(/App$/i, '')
}

const mapOdataToAppType = (odataType) => {
  if (!odataType) return 'win32ScriptApp'
  const type = odataType.toLowerCase()
  if (type.includes('wingetapp')) return 'StoreApp'
  if (type.includes('win32lobapp')) return 'chocolateyApp'
  if (type.includes('officesuiteapp')) return 'officeApp'
  return 'win32ScriptApp'
}

const Page = () => {
  const pageTitle = 'Applications'
  const syncDialog = useDialog()
  const tenant = useSettings().currentTenant
  const theme = useTheme()
  const router = useRouter()

  const handleCardClick = useCallback(
    (app) => {
      router.push(`/endpoint/applications/list/view?appId=${encodeURIComponent(app.id || '')}`)
    },
    [router]
  )

  // Card view configuration (works for both mobile and desktop)
  const cardConfig = {
    title: 'displayName',
    subtitle: 'publishingState',
    avatar: {
      field: 'displayName',
      icon: () => <Apps />,
    },
    badges: [
      {
        field: 'isAssigned',
        tooltip: 'Assignment Status',
        conditions: {
          true: { label: 'Assigned', color: 'success' },
          false: { label: 'Unassigned', color: 'default' },
        },
      },
    ],
    extraFields: [{ field: 'AppAssignment', maxLines: 2 }],
    // Additional fields shown only on desktop cards
    desktopFields: [
      { field: 'lastModifiedDateTime', label: 'Last Modified' },
      { field: 'createdDateTime', label: 'Created' },
    ],
    // Grid sizing for consistent card widths
    cardGridProps: {
      md: 6,
      lg: 4,
    },
    mobileQuickActions: [
      'Assign to All Users',
      'Assign to All Devices',
      'Assign to Custom Group',
      'Delete Application',
    ],
    maxQuickActions: 8,
  }

  const getAssignmentFilterFields = () => [
    {
      type: 'autoComplete',
      name: 'assignmentFilter',
      label: 'Assignment Filter (Optional)',
      multiple: false,
      creatable: false,
      api: {
        url: '/api/ListAssignmentFilters',
        queryKey: `ListAssignmentFilters-${tenant}`,
        labelField: (filter) => filter.displayName,
        valueField: 'displayName',
      },
    },
    {
      type: 'radio',
      name: 'assignmentFilterType',
      label: 'Assignment Filter Mode',
      options: assignmentFilterTypeOptions,
      defaultValue: 'include',
      helperText: 'Choose whether to include or exclude devices matching the filter.',
      condition: { field: 'assignmentFilter', compareType: 'hasValue', clearOnHide: false },
    },
  ]

  // Builds a customDataformatter that handles both single-row and bulk (array) inputs.
  const makeAssignFormatter = (getRowData) => (row, action, formData) => {
    const formatRow = (singleRow) => {
      const tenantFilterValue =
        tenant === 'AllTenants' && singleRow?.Tenant ? singleRow.Tenant : tenant
      return {
        tenantFilter: tenantFilterValue,
        ID: singleRow?.id,
        AppType: getAppAssignmentSettingsType(singleRow?.['@odata.type']),
        AssignmentFilterName: formData?.assignmentFilter?.value || null,
        AssignmentFilterType: formData?.assignmentFilter?.value
          ? formData?.assignmentFilterType || 'include'
          : null,
        ExcludeGroupIds: (formData?.excludeGroupTargets || []).map((g) => g.value).filter(Boolean),
        ExcludeGroupNames: (formData?.excludeGroupTargets || [])
          .map((g) => g.label)
          .filter(Boolean),
        ...getRowData(singleRow, formData),
      }
    }
    return Array.isArray(row) ? row.map(formatRow) : formatRow(row)
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
      queryKey: `ListAppAssignmentGroups-${tenant}`,
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

  const assignmentFields = [
    { type: 'heading', label: 'Exclude groups (optional)' },
    getGroupPickerField('excludeGroupTargets', 'Exclude group(s)', false),
    { type: 'heading', label: 'Assignment options' },
    {
      type: 'radio',
      name: 'Intent',
      label: 'Assignment intent',
      options: assignmentIntentOptions,
      defaultValue: 'Required',
      validators: { required: 'Select an assignment intent' },
      helperText:
        'Available assigns to Company Portal, Required installs automatically, Uninstall removes the app, Available without enrollment exposes it without device enrollment.',
    },
    {
      type: 'radio',
      name: 'assignmentMode',
      label: 'Assignment mode',
      options: assignmentModeOptions,
      defaultValue: 'append',
      helperText:
        'Replace will overwrite existing assignments. Append keeps current assignments and adds/overwrites only for the selected groups/intents.',
    },
    { type: 'heading', label: 'Device filter (optional)' },
    ...getAssignmentFilterFields(),
  ]

  const actions = [
    {
      label: 'Assign to All Users',
      type: 'POST',
      url: '/api/ExecAssignApp',
      allowResubmit: true,
      fields: assignmentFields,
      customDataformatter: makeAssignFormatter((_singleRow, formData) => ({
        AssignTo: 'AllUsers',
        Intent: formData?.Intent || 'Required',
        assignmentMode: formData?.assignmentMode || 'append',
      })),
      confirmText: 'Are you sure you want to assign "[displayName]" to all users?',
      icon: <UserIcon />,
      color: 'info',
      category: 'manage',
      quickAction: true,
    },
    {
      label: 'Assign to All Devices',
      type: 'POST',
      url: '/api/ExecAssignApp',
      allowResubmit: true,
      fields: assignmentFields,
      customDataformatter: makeAssignFormatter((_singleRow, formData) => ({
        AssignTo: 'AllDevices',
        Intent: formData?.Intent || 'Required',
        assignmentMode: formData?.assignmentMode || 'append',
      })),
      confirmText: 'Are you sure you want to assign "[displayName]" to all devices?',
      icon: <LaptopMac />,
      color: 'info',
      category: 'manage',
      quickAction: true,
    },
    {
      label: 'Assign Globally (All Users / All Devices)',
      type: 'POST',
      url: '/api/ExecAssignApp',
      allowResubmit: true,
      fields: assignmentFields,
      customDataformatter: makeAssignFormatter((_singleRow, formData) => ({
        AssignTo: 'AllDevicesAndUsers',
        Intent: formData?.Intent || 'Required',
        assignmentMode: formData?.assignmentMode || 'append',
      })),
      confirmText: 'Are you sure you want to assign "[displayName]" to all users and devices?',
      icon: <GlobeAltIcon />,
      color: 'info',
      category: 'manage',
    },
    {
      label: 'Assign to Custom Group',
      type: 'POST',
      url: '/api/ExecAssignApp',
      allowResubmit: true,
      icon: <UserGroupIcon />,
      color: 'info',
      category: 'manage',
      confirmText: 'Select the target groups and intent for "[displayName]".',
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
          name: 'assignmentIntent',
          label: 'Assignment intent',
          options: assignmentIntentOptions,
          defaultValue: 'Required',
          validators: { required: 'Select an assignment intent' },
          helperText:
            'Available assigns to Company Portal, Required installs automatically, Uninstall removes the app, Available without enrollment exposes it without device enrollment.',
        },
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
        { type: 'heading', label: 'Device filter (optional)' },
        ...getAssignmentFilterFields(),
      ],
      customDataformatter: makeAssignFormatter((_singleRow, formData) => {
        const selectedGroups = Array.isArray(formData?.groupTargets) ? formData.groupTargets : []
        const isExclude = formData?.assignmentDirection === 'exclude'
        const ids = selectedGroups.map((group) => group.value).filter(Boolean)
        const names = selectedGroups.map((group) => group.label).filter(Boolean)
        return {
          GroupIds: isExclude ? [] : ids,
          GroupNames: isExclude ? [] : names,
          ExcludeGroupIds: isExclude ? ids : [],
          ExcludeGroupNames: isExclude ? names : [],
          assignmentDirection: formData?.assignmentDirection || 'include',
          Intent: formData?.assignmentIntent || 'Required',
          AssignmentMode: formData?.assignmentMode || 'append',
        }
      }),
    },
    {
      label: 'Save as Template',
      type: 'POST',
      url: '/api/AddAppTemplate',
      icon: <BookmarkAdd />,
      color: 'info',
      fields: [
        {
          type: 'textField',
          name: 'displayName',
          label: 'Template Name',
          validators: { required: 'Template name is required' },
        },
        {
          type: 'textField',
          name: 'description',
          label: 'Description',
        },
      ],
      customDataformatter: (row, action, formData) => {
        const rows = Array.isArray(row) ? row : [row]
        return {
          displayName: formData?.displayName,
          description: formData?.description || '',
          apps: rows.map((r) => ({
            appType: mapOdataToAppType(r['@odata.type']),
            appName: r.displayName,
            config: JSON.stringify({
              ApplicationName: r.displayName,
              IntuneBody: r,
              assignTo: 'On',
            }),
          })),
        }
      },
      confirmText: 'Save selected application(s) as a reusable template?',
      category: 'manage',
      quickAction: true,
    },
    {
      label: 'Delete Application',
      type: 'POST',
      url: '/api/RemoveApp',
      data: {
        ID: 'id',
      },
      confirmText: 'Are you sure you want to delete "[displayName]"?',
      icon: <TrashIcon />,
      color: 'danger',
      category: 'danger',
      quickAction: true,
    },
  ]

  const offCanvas = {
    actions: actions,
    children: (row) => {
      const isAssigned = row.isAssigned === true
      const statusColor = isAssigned ? theme.palette.success.main : theme.palette.grey[500]

      return (
        <Stack spacing={3}>
          {/* Hero Section */}
          <Paper
            elevation={0}
            sx={{
              p: 2.5,
              borderRadius: 2,
              background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.15)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`,
              borderLeft: `4px solid ${theme.palette.primary.main}`,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                sx={{
                  bgcolor: stringToColor(row.displayName || 'A'),
                  width: 56,
                  height: 56,
                }}
              >
                <Apps />
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.25 }}>
                  {row.displayName || 'Unknown Application'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {row.publishingState || 'Unknown state'}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          {/* Status */}
          <Box>
            <Typography
              variant="overline"
              color="text.secondary"
              sx={{ fontWeight: 600, letterSpacing: 1, mb: 1.5, display: 'block' }}
            >
              Assignment Status
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                icon={isAssigned ? <CheckCircle fontSize="small" /> : <Cancel fontSize="small" />}
                label={isAssigned ? 'Assigned' : 'Unassigned'}
                color={isAssigned ? 'success' : 'default'}
                variant="filled"
                sx={{ fontWeight: 600 }}
              />
              {row.isFeatured && (
                <Chip label="Featured" color="info" variant="outlined" size="small" />
              )}
            </Stack>
          </Box>

          {/* Assignments */}
          {(row.AppAssignment || row.AppExclude) && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <Assignment fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Assignments
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {row.AppAssignment && (
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="body2" color="text.secondary">
                        Assigned To
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}
                      >
                        {row.AppAssignment}
                      </Typography>
                    </Stack>
                  )}
                  {row.AppExclude && (
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="body2" color="text.secondary">
                        Excluded
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ fontWeight: 500, textAlign: 'right', maxWidth: '60%' }}
                      >
                        {row.AppExclude}
                      </Typography>
                    </Stack>
                  )}
                  {row.dependentAppCount > 0 && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Dependencies
                      </Typography>
                      <Chip label={row.dependentAppCount} size="small" variant="outlined" />
                    </Stack>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Install Experience */}
          {row.installExperience && (
            <>
              <Divider />
              <Box>
                <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
                  <LaptopMac fontSize="small" color="action" />
                  <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                    Install Experience
                  </Typography>
                </Stack>
                <Stack spacing={1}>
                  {row.installExperience.runAsAccount && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Run As
                      </Typography>
                      <Chip
                        label={row.installExperience.runAsAccount}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  )}
                  {row.installExperience.deviceRestartBehavior && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Restart Behavior
                      </Typography>
                      <Chip
                        label={row.installExperience.deviceRestartBehavior}
                        size="small"
                        variant="outlined"
                      />
                    </Stack>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Detection Rules */}
          {row.rules?.[0] && (
            <>
              <Divider />
              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                  Detection Rule
                </Typography>
                <Stack spacing={1}>
                  {row.rules[0].ruleType && (
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography variant="body2" color="text.secondary">
                        Type
                      </Typography>
                      <Chip label={row.rules[0].ruleType} size="small" variant="outlined" />
                    </Stack>
                  )}
                  {row.rules[0].path && (
                    <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="body2" color="text.secondary">
                        Path
                      </Typography>
                      <Typography
                        variant="caption"
                        sx={{
                          fontFamily: 'monospace',
                          bgcolor: alpha(theme.palette.text.primary, 0.05),
                          px: 1,
                          py: 0.25,
                          borderRadius: 0.5,
                          maxWidth: '60%',
                          wordBreak: 'break-all',
                        }}
                      >
                        {row.rules[0].path}
                      </Typography>
                    </Stack>
                  )}
                </Stack>
              </Box>
            </>
          )}

          {/* Timeline */}
          <Divider />
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5 }}>
              <CalendarToday fontSize="small" color="action" />
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Timeline
              </Typography>
            </Stack>
            <Stack spacing={1}>
              {row.createdDateTime && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Created
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getCippFormatting(row.createdDateTime, 'createdDateTime')}
                  </Typography>
                </Stack>
              )}
              {row.lastModifiedDateTime && (
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="body2" color="text.secondary">
                    Last Modified
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {getCippFormatting(row.lastModifiedDateTime, 'lastModifiedDateTime')}
                  </Typography>
                </Stack>
              )}
            </Stack>
          </Box>
        </Stack>
      )
    },
  }

  const simpleColumns = [
    'displayName',
    'AppAssignment',
    'AppExclude',
    'publishingState',
    'lastModifiedDateTime',
    'createdDateTime',
  ]

  return (
    <>
      <CippTablePage
        title={pageTitle}
        apiUrl="/api/ListApps"
        actions={actions}
        offCanvas={offCanvas}
        simpleColumns={simpleColumns}
        cardButton={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <CippApplicationDeployDrawer />
            <Button onClick={syncDialog.handleOpen} startIcon={<Sync />}>
              Sync VPP
            </Button>
          </Box>
        }
        cardConfig={cardConfig}
        onCardClick={handleCardClick}
        offCanvasOnRowClick={true}
      />
      <CippApiDialog
        title="Sync VPP Tokens"
        createDialog={syncDialog}
        api={{
          type: 'POST',
          url: '/api/ExecSyncVPP',
          data: {},
          confirmText: `Are you sure you want to sync Apple Volume Purchase Program (VPP) tokens? This will sync all VPP tokens for ${tenant}.`,
        }}
      />
    </>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>
export default Page
