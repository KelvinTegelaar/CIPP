import { useEffect } from 'react'
import { useRouter } from 'next/router'
import { useForm } from 'react-hook-form'
import { Alert, Grid, Stack, Typography } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import CippFormPage from '../../../../components/CippFormPages/CippFormPage'
import CippFormSkeleton from '../../../../components/CippFormPages/CippFormSkeleton'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { CippFormCondition } from '../../../../components/CippComponents/CippFormCondition'
import { CippFormUserAndGroupSelector } from '../../../../components/CippComponents/CippFormUserAndGroupSelector'
import { ApiGetCall } from '../../../../api/ApiCall'
import { useSettings } from '../../../../hooks/use-settings'

const customLists = [
  {
    key: 'customBypass',
    label: 'Custom bypass',
    helperText:
      'Destinations that skip Global Secure Access and go straight to the internet.',
  },
  {
    key: 'customAcquire',
    label: 'Custom acquire',
    helperText:
      'Destinations that are always sent through Global Secure Access.',
  },
]

// One ports field per list: blank when the entries cover all ports or differ from each other
const listPorts = (entries) => {
  const ports = [...new Set((entries ?? []).map((entry) => entry.ports))]
  return ports.length === 1 && ports[0] !== '0-65535' ? ports[0] : ''
}
const destinations = (items) => (items ?? []).map((item) => item?.value ?? item)

const Page = () => {
  const router = useRouter()
  const { id } = router.query
  const tenantFilter = useSettings().currentTenant
  const formControl = useForm({ mode: 'onChange' })
  const profiles = ApiGetCall({
    url: `/api/ListGSATrafficForwarding?tenantFilter=${tenantFilter}`,
    queryKey: `ListGSATrafficForwarding-edit-${tenantFilter}`,
    waiting: !!id && !!tenantFilter,
  })
  const profile = profiles.data?.find?.((row) => row.id === id)
  const isInternet = profile?.trafficForwardingType === 'internet'
  const assignmentRead =
    profile?.assignedToAllUsers != null && Array.isArray(profile?.assignees)
  const usesRemoteNetworks =
    ['m365', 'internet'].includes(profile?.trafficForwardingType) &&
    Array.isArray(profile?.remoteNetworks)

  useEffect(() => {
    if (!profile) return
    formControl.reset({
      id,
      enabled: profile.state === 'enabled',
      allUsers: !!profile.assignedToAllUsers,
      assignees: (profile.assignees ?? []).map((assignee) => ({
        label: assignee.principalDisplayName ?? assignee.principalId,
        value: assignee.principalId,
        addedFields: { type: assignee.principalType },
      })),
      remoteNetworks: (profile.remoteNetworks ?? []).map((network) => ({
        label: network.name,
        value: network.id,
      })),
      ...Object.fromEntries(
        customLists.flatMap(({ key }) => [
          [
            key,
            (profile[key] ?? []).map((entry) => ({
              label: entry.destination,
              value: entry.destination,
            })),
          ],
          [`${key}Ports`, listPorts(profile[key])],
        ])
      ),
    })
  }, [profile]) // eslint-disable-line react-hooks/exhaustive-deps

  const toBody = (values) => {
    const body = {
      tenantFilter,
      id: values.id,
      state: values.enabled ? 'enabled' : 'disabled',
    }
    if (assignmentRead) {
      body.assignedToAllUsers = !!values.allUsers
      if (!values.allUsers) {
        body.assignees = (values.assignees ?? []).map((assignee) => ({
          value: assignee.value,
          label: assignee.label,
          type: /group/i.test(assignee.addedFields?.type ?? '')
            ? 'Group'
            : 'User',
        }))
      }
    }
    if (usesRemoteNetworks) {
      body.remoteNetworks = destinations(values.remoteNetworks)
    }
    // Lists are only sent when changed, so a save elsewhere never rewrites rules made in the portal
    for (const { key } of isInternet ? customLists : []) {
      if (!Array.isArray(profile[key])) continue
      const current = profile[key].map((entry) => entry.destination)
      const wanted = destinations(values[key])
      const ports = values[`${key}Ports`] ?? ''
      if (
        JSON.stringify(wanted) !== JSON.stringify(current) ||
        ports !== listPorts(profile[key])
      ) {
        body[key] = wanted
        body[`${key}Ports`] = ports
      }
    }
    return body
  }

  return (
    <CippFormPage
      title={profile ? `Traffic Profile: ${profile.name}` : 'Traffic Profile'}
      formPageType="Edit"
      backButtonTitle="Traffic Forwarding"
      formControl={formControl}
      postUrl="/api/EditGSATrafficForwardingProfile"
      queryKey={['ListGSATrafficForwarding*', 'ListGSARemoteNetworks*']}
      customDataformatter={toBody}
    >
      {profile ? (
        <Stack spacing={2}>
          {profile.readErrors?.length > 0 && (
            <Alert severity="warning">
              Some settings could not be read and are left unchanged:{' '}
              {profile.readErrors.join('; ')}
            </Alert>
          )}
          {profile.licenseWarning && (
            <Alert severity="warning">{profile.licenseWarning}</Alert>
          )}
          <Alert severity="info">
            Changes take about 10 seconds to show in the tenant after you save.
          </Alert>
          {!profile.readErrors?.some((error) =>
            error.startsWith('Conditional Access')
          ) && (
            <Typography variant="body2">
              Linked Conditional Access policies:{' '}
              {profile.linkedConditionalAccessPolicies?.length > 0
                ? profile.linkedConditionalAccessPolicies
                    .map((policy) => policy.displayName)
                    .join(', ')
                : 'None'}
            </Typography>
          )}
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 6 }}>
              <CippFormComponent
                type="switch"
                name="enabled"
                label="Enabled"
                formControl={formControl}
                disabled={
                  Boolean(profile.licenseWarning) && profile.state !== 'enabled'
                }
              />
            </Grid>
            {assignmentRead && (
              <Grid size={{ xs: 12, md: 6 }}>
                <CippFormComponent
                  type="switch"
                  name="allUsers"
                  label="Assign to all users"
                  formControl={formControl}
                />
              </Grid>
            )}
            {assignmentRead && (
              <Grid size={12}>
                <CippFormCondition
                  formControl={formControl}
                  field="allUsers"
                  compareType="is"
                  compareValue={false}
                  clearOnHide={false}
                >
                  <CippFormUserAndGroupSelector
                    formControl={formControl}
                    name="assignees"
                    label="Assigned users and groups"
                    multiple
                    addedField={{ type: '@odata.type' }}
                  />
                </CippFormCondition>
              </Grid>
            )}
            {usesRemoteNetworks && (
              <Grid size={12}>
                <CippFormComponent
                  type="autoComplete"
                  name="remoteNetworks"
                  label="Remote networks"
                  helperText="Branch sites that send their traffic through this profile. The profile must be enabled, and each site keeps at least one profile."
                  multiple
                  creatable={false}
                  api={{
                    url: '/api/ListGSARemoteNetworks',
                    labelField: 'name',
                    valueField: 'id',
                    queryKey: 'ListGSARemoteNetworks-picker',
                  }}
                  formControl={formControl}
                />
              </Grid>
            )}
          </Grid>
          {isInternet &&
            customLists
              .filter(({ key }) => Array.isArray(profile[key]))
              .map(({ key, label, helperText }) => (
                <Stack key={key} spacing={2}>
                  <Typography variant="h6">{label}</Typography>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, md: 8 }}>
                      <CippFormComponent
                        type="autoComplete"
                        name={key}
                        label="Destinations"
                        helperText={`${helperText} FQDNs (*.contoso.com allowed), IPv4 addresses, subnets or ranges (10.0.0.1-10.0.0.9).`}
                        options={[]}
                        multiple
                        creatable
                        formControl={formControl}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                      <CippFormComponent
                        type="textField"
                        name={`${key}Ports`}
                        label="Ports"
                        helperText="For example 443 or 8000-8100, comma separated. Blank means all ports."
                        formControl={formControl}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              ))}
        </Stack>
      ) : profiles.isSuccess || profiles.isError ? (
        <Alert severity="warning">
          {profiles.isError
            ? (profiles.error?.response?.data?.Results ??
              'The traffic forwarding profiles could not be loaded.')
            : 'This traffic forwarding profile was not found in the selected tenant.'}
        </Alert>
      ) : (
        <CippFormSkeleton layout={[2, 1, 1]} />
      )}
    </CippFormPage>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
