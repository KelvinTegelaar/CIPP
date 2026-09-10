import React, { useState, useEffect } from 'react'
import { CippIcons } from '../../utils/icon-registry'
import { Divider, Button, Alert } from '@mui/material'
import { Grid } from '@mui/system'
import { useForm, useWatch, useFormState } from 'react-hook-form'
import { CippOffCanvas } from './CippOffCanvas'
import CippFormComponent from './CippFormComponent'
import { CippFormTenantSelector } from './CippFormTenantSelector'
import { CippApiResults } from './CippApiResults'
import languageList from '../../data/languageList.json'
import { ApiPostCall } from '../../api/ApiCall'
import { usePermissions } from '../../hooks/use-permissions'

// Intune rejects anything outside this set with a generic 500 that carries no reason, so we catch it here.
// Kept in sync with Test-CIPPAutopilotProfileName on the backend.
const PROFILE_NAME_PATTERN = /^[\p{L}\p{N} :"?.@$&_\[\]{}|\\]+$/u
const PROFILE_NAME_MESSAGE =
  'Only letters, numbers, spaces and : " ? . @ $ & _ [ ] { } | \\ are allowed'
const PROFILE_NAME_HINT =
  'Intune only accepts letters, numbers, spaces and : " ? . @ $ & _ [ ] { } | \\ — hyphens are rejected'

export const CippAutopilotProfileDrawer = ({
  buttonText = 'Add Profile',
  requiredPermissions = [],
  PermissionButton = Button,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false)
  const { checkPermissions } = usePermissions()
  const canReadGroups = checkPermissions([
    'Identity.Group.Read',
    'Identity.Group.ReadWrite',
  ])
  const formControl = useForm({
    mode: 'onChange',
    defaultValues: {
      DisplayName: '',
      Description: '',
      DeviceNameTemplate: '',
      languages: null,
      CollectHash: false,
      Assignto: true,
      GroupIds: [],
      DeploymentMode: false,
      HideTerms: true,
      HidePrivacy: true,
      HideChangeAccount: true,
      NotLocalAdmin: true,
      allowWhiteglove: true,
      Autokeyboard: true,
    },
  })

  const createProfile = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: ['Autopilot Profiles*'],
  })

  // Watch the deployment mode to conditionally disable white glove
  const deploymentMode = useWatch({
    control: formControl.control,
    name: 'DeploymentMode',
  })

  // Group targets are tenant-scoped, so they are only offered for a single tenant.
  const selectedTenants = useWatch({
    control: formControl.control,
    name: 'selectedTenants',
  })
  const assignToGroups = useWatch({
    control: formControl.control,
    name: 'Assignto',
  })
  const singleTenant =
    Array.isArray(selectedTenants) && selectedTenants.length === 1
  const groupTenant = singleTenant ? selectedTenants[0]?.value : undefined

  // Watch form state for validation
  const { isValid, isDirty } = useFormState({
    control: formControl.control,
  })

  // Automatically disable white glove when self-deploying mode (shared) is enabled
  useEffect(() => {
    if (deploymentMode === true) {
      // Self-deploying mode is enabled (shared mode), disable white glove
      formControl.setValue('allowWhiteglove', false)
    }
  }, [deploymentMode, formControl])

  // A group selection is only valid for the tenant it was loaded from.
  useEffect(() => {
    formControl.setValue('GroupIds', [])
  }, [assignToGroups, canReadGroups, formControl, groupTenant])

  const handleSubmit = () => {
    const formData = formControl.getValues()
    // Always set HideChangeAccount to true regardless of form state
    formData.HideChangeAccount = true
    // The group picker stores option objects; the endpoint expects bare group ids.
    const canAssignGroups =
      assignToGroups === false && singleTenant && canReadGroups
    formData.GroupIds =
      canAssignGroups && Array.isArray(formData.GroupIds)
        ? formData.GroupIds.map((group) => group.value).filter(Boolean)
        : []
    createProfile.mutate({
      url: '/api/AddAutopilotConfig',
      data: formData,
      relatedQueryKeys: ['Autopilot Profiles*'],
    })
  }

  const handleCloseDrawer = () => {
    setDrawerVisible(false)
    formControl.reset()
  }

  return (
    <>
      <PermissionButton
        {...(PermissionButton !== Button ? { requiredPermissions } : {})}
        onClick={() => setDrawerVisible(true)}
        startIcon={<CippIcons.AccountCircle />}
      >
        {buttonText}
      </PermissionButton>
      <CippOffCanvas
        title="Autopilot Profile Wizard"
        visible={drawerVisible}
        onClose={handleCloseDrawer}
        size="lg"
        footer={
          <div>
            <CippApiResults apiObject={createProfile} />
            <div
              style={{
                display: 'flex',
                gap: '8px',
                justifyContent: 'flex-start',
                marginTop: '16px',
              }}
            >
              <Button
                variant="contained"
                color="primary"
                onClick={handleSubmit}
                disabled={createProfile.isLoading || !isValid}
              >
                {createProfile.isLoading
                  ? 'Creating...'
                  : createProfile.isSuccess
                    ? 'Create Another'
                    : 'Create Profile'}
              </Button>
              <Button variant="outlined" onClick={handleCloseDrawer}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        <Grid container spacing={2}>
          {/* Tenant Selector */}
          <Grid size={{ xs: 12 }}>
            <CippFormTenantSelector
              label="Select Tenants"
              formControl={formControl}
              name="selectedTenants"
              type="multiple"
              allTenants={true}
              preselectedEnabled={true}
              validators={{ required: 'At least one tenant must be selected' }}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <Divider sx={{ my: 2 }} />
          </Grid>

          {/* Form Fields */}
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Display Name"
              name="DisplayName"
              formControl={formControl}
              validators={{
                required: 'Display Name is required',
                validate: (value) =>
                  (value ?? '').trim().length > 0 || 'Display Name is required',
                pattern: {
                  value: PROFILE_NAME_PATTERN,
                  message: PROFILE_NAME_MESSAGE,
                },
              }}
              required={true}
              helperText={PROFILE_NAME_HINT}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="autoComplete"
              label="Language"
              name="languages"
              options={[
                { value: 'os-default', label: 'Operating system default' },
                { value: 'user-select', label: 'User Select' },
                ...languageList.map(
                  ({ language, tag, 'Geographic area': geographicArea }) => ({
                    value: tag,
                    label: `${language} - ${geographicArea}`, // Format as "language - geographic area" for display
                  })
                ),
              ]}
              formControl={formControl}
              multiple={false}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Description"
              name="Description"
              formControl={formControl}
              placeholder="Leave blank for none"
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="textField"
              label="Unique Name Template"
              name="DeviceNameTemplate"
              formControl={formControl}
              placeholder="Ex. %SERIAL%, %RAND:x% or leave blank for none"
            />
          </Grid>

          {/* Switches */}
          <Grid size={{ xs: 12 }}>
            <CippFormComponent
              type="switch"
              label="Convert all targeted devices to Autopilot"
              name="CollectHash"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Assign to all devices"
              name="Assignto"
              formControl={formControl}
            />
            {assignToGroups === false && (
              <Grid size={{ xs: 12 }}>
                {!canReadGroups ? (
                  <Alert severity="warning" sx={{ my: 1 }}>
                    Assigning this profile to groups requires the Identity Group
                    Read permission. You can still create it without an
                    assignment.
                  </Alert>
                ) : singleTenant ? (
                  <CippFormComponent
                    type="autoComplete"
                    label="Assign to Selected Groups"
                    name="GroupIds"
                    multiple={true}
                    formControl={formControl}
                    helperText="Leave empty to create the profile without an assignment."
                    api={{
                      url: '/api/ListGroups',
                      tenantFilter: groupTenant,
                      labelField: (option) =>
                        option?.groupType
                          ? `${option.displayName} (${option.groupType})`
                          : (option?.displayName ?? ''),
                      valueField: 'id',
                      queryKey: 'ListGroups',
                      showRefresh: true,
                    }}
                  />
                ) : (
                  <Alert severity="warning" sx={{ my: 1 }}>
                    Selected groups are tenant-specific, so profiling by group
                    requires selecting a single tenant. Leave this unchecked to
                    create the profile without an assignment.
                  </Alert>
                )}
              </Grid>
            )}
            <CippFormComponent
              type="switch"
              label="Self-deploying mode"
              name="DeploymentMode"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Hide Terms and conditions"
              name="HideTerms"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Hide Privacy Settings"
              name="HidePrivacy"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Hide Change Account Options"
              name="HideChangeAccount"
              formControl={formControl}
              disabled={true}
              helperText="This setting requires Hybrid Microsoft Entra Join which is not supported in CIPP"
            />
            <CippFormComponent
              type="switch"
              label="Setup user as standard user (Leave unchecked to setup user as local admin)"
              name="NotLocalAdmin"
              formControl={formControl}
            />
            <CippFormComponent
              type="switch"
              label="Allow White Glove OOBE"
              name="allowWhiteglove"
              formControl={formControl}
              disabled={deploymentMode === true}
              helperText={
                deploymentMode === true
                  ? 'White Glove is not supported with Self-deploying mode (shared devices)'
                  : undefined
              }
            />
            <CippFormComponent
              type="switch"
              label="Automatically configure keyboard"
              name="Autokeyboard"
              formControl={formControl}
            />
          </Grid>
        </Grid>
      </CippOffCanvas>
    </>
  )
}
