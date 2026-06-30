import { Layout as DashboardLayout } from '../../../layouts/index.js'
import { HeaderedTabbedLayout } from '../../../layouts/HeaderedTabbedLayout'
import { useForm, useFormState } from 'react-hook-form'
import { ApiGetCall, ApiPostCall } from '../../../api/ApiCall'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import CippFormComponent from '../../../components/CippComponents/CippFormComponent'
import {
  Stack,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Tooltip,
  SvgIcon,
  IconButton,
  Chip,
} from '@mui/material'
import { Grid } from '@mui/system'
import { CippPropertyListCard } from '../../../components/CippCards/CippPropertyListCard'
import CippButtonCard from '../../../components/CippCards/CippButtonCard'
import { getCippFormatting } from '../../../utils/get-cipp-formatting'
import CippCustomVariables from '../../../components/CippComponents/CippCustomVariables'
import { CippOffboardingDefaultSettings } from '../../../components/CippComponents/CippOffboardingDefaultSettings'
import { CippApiResults } from '../../../components/CippComponents/CippApiResults'
import { useSettings } from '../../../hooks/use-settings'
import { Business, Save, Sync } from '@mui/icons-material'
import { TrashIcon, PlusIcon } from '@heroicons/react/24/outline'
import { CippDataTable } from '../../../components/CippTable/CippDataTable'
import tabOptions from './tabOptions.json'
import { CippHead } from '../../../components/CippComponents/CippHead'

const Page = () => {
  const router = useRouter()
  const { templateId } = router.query
  const settings = useSettings()
  // Prioritize URL query parameter, then fall back to settings
  const currentTenant = router.query.tenantFilter || settings.currentTenant

  const formControl = useForm({
    mode: 'onChange',
  })

  const offboardingFormControl = useForm({
    mode: 'onChange',
  })

  const [groupTableData, setGroupTableData] = useState([])

  const allGroups = ApiGetCall({
    url: '/api/ListTenantGroups',
    queryKey: 'AllTenantGroups',
  })

  const handleAddGroup = () => {
    const selected = formControl.getValues('selectedGroup')
    if (!selected) return
    if (groupTableData.find((g) => g.Id === selected.value)) return
    const full = (allGroups.data?.Results || []).find((g) => g.Id === selected.value)
    setGroupTableData([
      ...groupTableData,
      {
        Id: selected.value,
        Name: selected.label,
        Description: full?.Description || '',
        GroupType: 'static',
      },
    ])
    formControl.setValue('selectedGroup', null)
  }

  const handleRemoveGroup = (row) => {
    const toRemove = Array.isArray(row) ? row : [row]
    const removeIds = toRemove.map((r) => r.Id)
    setGroupTableData((prev) => prev.filter((g) => !removeIds.includes(g.Id)))
  }

  // API call for updating tenant properties
  const updateTenant = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [
      `TenantProperties_${currentTenant}`,
      'ListTenants-notAllTenants',
      'TenantSelector',
    ],
  })

  // API call for updating offboarding defaults
  const updateOffboardingDefaults = ApiPostCall({
    urlFromData: true,
    relatedQueryKeys: [`TenantProperties_${currentTenant}`, 'CustomVariables*'],
  })

  const { isValid: isFormValid } = useFormState({ control: formControl.control })
  const { isValid: isOffboardingFormValid } = useFormState({
    control: offboardingFormControl.control,
  })

  const tenantDetails = ApiGetCall({
    url:
      currentTenant && currentTenant !== 'AllTenants'
        ? `/api/ListTenantDetails?tenantFilter=${currentTenant}`
        : null,
    queryKey:
      currentTenant && currentTenant !== 'AllTenants' ? `TenantProperties_${currentTenant}` : null,
  })

  useEffect(() => {
    if (tenantDetails.isSuccess && tenantDetails.data && currentTenant !== 'AllTenants') {
      formControl.reset({
        customerId: currentTenant,
        Alias: tenantDetails?.data?.customProperties?.Alias ?? '',
      })

      // Build group table from current memberships, cross-referencing full group data for GroupType
      const currentGroups = tenantDetails.data.Groups || []
      const allGroupsData = allGroups.data?.Results || []
      setGroupTableData(
        currentGroups.map((g) => {
          const full = allGroupsData.find((ag) => ag.Id === g.Id)
          return {
            Id: g.Id,
            Name: g.Name,
            Description: full?.Description || '',
            GroupType: full?.GroupType || 'static',
          }
        })
      )

      // Set up offboarding defaults with default values
      const tenantOffboardingDefaults = tenantDetails.data?.customProperties?.OffboardingDefaults
      const defaultOffboardingValues = {
        ConvertToShared: false,
        RemoveGroups: false,
        HideFromGAL: false,
        RemoveLicenses: false,
        removeCalendarInvites: false,
        RevokeSessions: false,
        removePermissions: false,
        RemoveRules: false,
        ResetPass: false,
        KeepCopy: false,
        DeleteUser: false,
        RemoveMobile: false,
        DisableSignIn: false,
        RemoveMFADevices: false,
        RemoveTeamsPhoneDID: false,
        ClearImmutableId: false,
      }

      let offboardingDefaults = {}

      if (tenantOffboardingDefaults) {
        try {
          const parsed = JSON.parse(tenantOffboardingDefaults)
          offboardingDefaults = {
            offboardingDefaults: { ...defaultOffboardingValues, ...parsed },
          }
        } catch {
          offboardingDefaults = { offboardingDefaults: defaultOffboardingValues }
        }
      } else {
        offboardingDefaults = { offboardingDefaults: defaultOffboardingValues }
      }

      offboardingFormControl.reset(offboardingDefaults)
    }
  }, [tenantDetails.isSuccess, tenantDetails.data, allGroups.data, currentTenant])

  const handleResetOffboardingDefaults = () => {
    const defaultOffboardingValues = {
      ConvertToShared: false,
      RemoveGroups: false,
      HideFromGAL: false,
      RemoveLicenses: false,
      removeCalendarInvites: false,
      RevokeSessions: false,
      removePermissions: false,
      RemoveRules: false,
      ResetPass: false,
      KeepCopy: false,
      DeleteUser: false,
      RemoveMobile: false,
      DisableSignIn: false,
      RemoveMFADevices: false,
      RemoveTeamsPhoneDID: false,
      ClearImmutableId: false,
    }

    offboardingFormControl.reset({ offboardingDefaults: defaultOffboardingValues })

    updateOffboardingDefaults.mutate({
      url: '/api/EditTenantOffboardingDefaults',
      data: {
        customerId: tenantDetails.data?.id || currentTenant,
        defaultDomainName: tenantDetails.data?.defaultDomainName || currentTenant,
        offboardingDefaults: null,
      },
    })
  }

  const title = 'Manage Tenant'

  // Show message for AllTenants
  if (currentTenant === 'AllTenants') {
    return (
      <HeaderedTabbedLayout
        tabOptions={tabOptions}
        title={title}
        actions={[]}
        actionsData={{}}
        isFetching={false}
      >
        <CippHead title="Edit Tenant" />
        <Box sx={{ py: 4 }}>
          <Card>
            <CardContent>
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Business sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h5" gutterBottom>
                  Select a Specific Tenant
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  Tenant editing is not available when "All Tenants" is selected. Please select a
                  specific tenant to edit its configuration.
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>
      </HeaderedTabbedLayout>
    )
  }

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      actions={[]}
      actionsData={{}}
      isFetching={tenantDetails.isFetching}
    >
      <CippHead title="Edit Tenant" />
      <Box sx={{ p: 1 }}>
        <Grid container spacing={3}>
          {/* First Row - Tenant Details and Edit Form */}
          <Grid size={{ md: 4, xs: 12 }}>
            <CippPropertyListCard
              title="Tenant Details"
              actionButton={
                <Tooltip title="Refresh">
                  <IconButton
                    onClick={() => tenantDetails.refetch()}
                    disabled={tenantDetails.isFetching}
                    size="small"
                    sx={{ mt: 0.25 }}
                  >
                    <SvgIcon fontSize="small">
                      <Sync />
                    </SvgIcon>
                  </IconButton>
                </Tooltip>
              }
              propertyItems={[
                { label: 'Display Name', value: tenantDetails.data?.displayName },
                {
                  label: 'Tenant ID',
                  value: getCippFormatting(tenantDetails.data?.id, 'Tenant'),
                },
                {
                  label: 'Default Domain',
                  value: currentTenant,
                },
                {
                  label: 'Created',
                  value: getCippFormatting(tenantDetails.data?.createdDateTime, 'datetime'),
                },
                {
                  label: 'Address',
                  value:
                    [
                      tenantDetails.data?.street,
                      tenantDetails.data?.city,
                      tenantDetails.data?.state,
                      tenantDetails.data?.postalCode,
                      tenantDetails.data?.countryLetterCode,
                    ]
                      .filter(Boolean)
                      .join(', ') || undefined,
                },
                { label: 'Business Phone', value: tenantDetails.data?.businessPhones },
                {
                  label: 'Technical Contact',
                  value: tenantDetails.data?.technicalNotificationMails,
                },
                {
                  label: 'On-Premises Sync',
                  value: tenantDetails.data?.onPremisesSyncEnabled
                    ? getCippFormatting(tenantDetails.data?.onPremisesLastSyncDateTime, 'datetime')
                    : 'Disabled',
                },
              ].filter(
                (item) => item.value !== undefined && item.value !== null && item.value !== ''
              )}
              showDivider={false}
              isFetching={tenantDetails.isFetching}
            />
          </Grid>

          <Grid size={{ md: 8, xs: 12 }}>
            <CippButtonCard
              title="Edit Tenant Properties"
              CardButton={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={formControl.handleSubmit((values) => {
                    const formattedValues = {
                      tenantAlias: values.Alias,
                      tenantGroups: groupTableData.map((g) => ({
                        groupId: g.Id,
                        groupName: g.Name,
                      })),
                      customerId: tenantDetails.data?.id,
                    }
                    updateTenant.mutate({
                      url: '/api/EditTenant',
                      data: formattedValues,
                    })
                  })}
                  disabled={updateTenant.isPending || !isFormValid || tenantDetails.isFetching}
                >
                  {updateTenant.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              }
              isFetching={tenantDetails.isFetching}
            >
              <Stack spacing={2}>
                <CippFormComponent
                  type="textField"
                  name="Alias"
                  label="Tenant Alias"
                  placeholder="Enter a custom alias for this tenant to be displayed in CIPP."
                  formControl={formControl}
                  isFetching={tenantDetails.isFetching}
                  disabled={tenantDetails.isFetching}
                />
                <Box>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Tenant Groups
                  </Typography>
                  <Stack direction="row" spacing={1} sx={{ mb: 2, alignItems: 'flex-end' }}>
                    <Box sx={{ flex: 1 }}>
                      <CippFormComponent
                        type="autoComplete"
                        name="selectedGroup"
                        label="Add Group"
                        formControl={formControl}
                        multiple={false}
                        creatable={false}
                        options={(
                          allGroups.data?.Results?.filter(
                            (g) =>
                              g.GroupType !== 'dynamic' &&
                              !groupTableData.find((t) => t.Id === g.Id)
                          ) || []
                        ).map((g) => ({ label: g.Name, value: g.Id }))}
                        isFetching={allGroups.isFetching}
                        disabled={tenantDetails.isFetching}
                      />
                    </Box>
                    <Tooltip title="Add Group">
                      <span>
                        <Button
                          variant="contained"
                          onClick={handleAddGroup}
                          disabled={tenantDetails.isFetching}
                          sx={{ mb: 0.5 }}
                        >
                          <SvgIcon fontSize="small">
                            <PlusIcon />
                          </SvgIcon>
                        </Button>
                      </span>
                    </Tooltip>
                  </Stack>
                  <CippDataTable
                    noCard={true}
                    data={groupTableData}
                    simple={false}
                    simpleColumns={['Name', 'Description', 'GroupType']}
                    isFetching={allGroups.isFetching || tenantDetails.isFetching}
                    actions={[
                      {
                        label: 'Remove',
                        icon: <TrashIcon />,
                        confirmText: 'Remove this tenant from [Name]?',
                        customFunction: handleRemoveGroup,
                        condition: (row) => row.GroupType !== 'dynamic',
                      },
                    ]}
                  />
                </Box>
                <CippApiResults apiObject={updateTenant} />
              </Stack>
            </CippButtonCard>
          </Grid>

          {/* Second Row - Offboarding Defaults and Custom Variables */}
          <Grid size={{ md: 6, xs: 12 }}>
            <CippButtonCard
              title="Tenant Offboarding Defaults"
              CardButton={
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Save />}
                  onClick={offboardingFormControl.handleSubmit((values) => {
                    const offboardingSettings = values.offboardingDefaults || values
                    const formattedValues = {
                      customerId: tenantDetails.data?.id || currentTenant,
                      defaultDomainName: tenantDetails.data?.defaultDomainName || currentTenant,
                      offboardingDefaults: offboardingSettings,
                    }
                    updateOffboardingDefaults.mutate({
                      url: '/api/EditTenantOffboardingDefaults',
                      data: formattedValues,
                    })
                  })}
                  disabled={
                    updateOffboardingDefaults.isPending ||
                    !isOffboardingFormValid ||
                    tenantDetails.isFetching
                  }
                >
                  {updateOffboardingDefaults.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              }
              isFetching={tenantDetails.isFetching}
            >
              <Stack spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  Configure default offboarding settings specifically for this tenant. These
                  settings will override user defaults when offboarding users in this tenant.
                </Typography>

                <CippOffboardingDefaultSettings
                  formControl={offboardingFormControl}
                  title="Tenant Offboarding Defaults"
                />

                <Box>
                  <Button
                    variant="outlined"
                    onClick={handleResetOffboardingDefaults}
                    disabled={updateOffboardingDefaults.isPending || tenantDetails.isFetching}
                    sx={{ mr: 2 }}
                  >
                    Reset All to Off
                  </Button>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                    Click "Reset All to Off" to turn off all options, then click "Save" to clear
                    tenant defaults.
                  </Typography>
                </Box>

                <CippApiResults apiObject={updateOffboardingDefaults} />
              </Stack>
            </CippButtonCard>
          </Grid>

          <Grid size={{ md: 6, xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  Custom Variables
                </Typography>
              </CardContent>
              <CippCustomVariables id={currentTenant} />
            </Card>
          </Grid>
        </Grid>
      </Box>
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
