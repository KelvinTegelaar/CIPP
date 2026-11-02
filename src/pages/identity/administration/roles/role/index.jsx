import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useRouter } from 'next/router'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
import tabOptions from './tabOptions.json'
import { CippCopyToClipBoard } from '../../../../../components/CippComponents/CippCopyToClipboard'
import { Box, Stack } from '@mui/system'
import { Grid } from '@mui/system'
import {
  Alert,
  Button,
  Card,
  CardHeader,
  Chip,
  Divider,
  SvgIcon,
  Tooltip,
  Typography,
} from '@mui/material'
import { PropertyList } from '../../../../../components/property-list'
import { PropertyListItem } from '../../../../../components/property-list-item'
import { getCippFormatting } from '../../../../../utils/get-cipp-formatting'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { useCippRoleAssignmentActions } from '../../../../../components/CippComponents/CippRoleAssignmentActions'
import CippInfoTooltip from '../../../../../components/CippComponents/CippInfoTooltip'
import {
  POLICY_BELOW_FLOOR_TOOLTIP,
  PRIVILEGED_ROLE_TOOLTIP,
  getRoleRow,
} from '../../../../../utils/role-detail-shared'

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { roleTemplateId } = router.query
  const tenantFilter =
    router.query.tenantFilter ?? userSettingsDefaults.currentTenant
  const needsTenant = !tenantFilter || tenantFilter === 'AllTenants'

  const roleRequest = ApiGetCall({
    url: '/api/ListPIMRoles',
    data: {
      roleTemplateId,
      tenantFilter,
    },
    queryKey: `ListPIMRoles-${tenantFilter}-${roleTemplateId}`,
    waiting: !!roleTemplateId && !needsTenant,
  })

  const roleData = getRoleRow(roleRequest.data)

  const assignmentActions = useCippRoleAssignmentActions({
    relatedQueryKeys: [
      `ListPIMRoles-${tenantFilter}-${roleTemplateId}`,
      'ListPIMRoles*',
      'ListRoleAssignments*',
    ],
  })

  const viewSignInsAction = {
    label: 'View sign-ins',
    link: `/identity/administration/users/user?userId=[PrincipalId]&tenantFilter=${tenantFilter}`,
    icon: <CippIcons.Login />,
    color: 'info',
    condition: (row) => row?.PrincipalType === 'User' && !!row?.PrincipalId,
  }

  const title = !roleTemplateId
    ? 'No Role Selected'
    : needsTenant
      ? 'Select a Tenant'
      : roleRequest.isError
        ? 'Role'
        : roleRequest.isSuccess
          ? roleData?.RoleDisplayName ?? 'Role'
          : 'Loading...'

  const subtitle = roleRequest.isSuccess && roleData
    ? [
        {
          icon: <CippIcons.Fingerprint />,
          text: (
            <CippCopyToClipBoard type="chip" text={roleData.RoleDefinitionId} />
          ),
        },
        roleData.IsPrivilegedRole
          ? {
              icon: <CippIcons.Warning />,
              text: (
                <Tooltip title={PRIVILEGED_ROLE_TOOLTIP} arrow>
                  <Chip size="small" color="warning" label="Privileged" />
                </Tooltip>
              ),
            }
          : null,
        roleData.PolicyBelowFloor
          ? {
              icon: <CippIcons.GppBad />,
              text: (
                <Tooltip title={POLICY_BELOW_FLOOR_TOOLTIP} arrow>
                  <Chip size="small" color="error" label="Policy below floor" />
                </Tooltip>
              ),
            }
          : null,
        {
          icon: <CippIcons.Launch />,
          text: (
            <Button
              color="muted"
              style={{ paddingLeft: 0 }}
              size="small"
              href={`https://entra.microsoft.com/${tenantFilter}/#view/Microsoft_AAD_IAM/RoleManagementMenuBlade/~/AllRoles`}
              target="_blank"
              rel="noopener noreferrer"
            >
              View in Entra
            </Button>
          ),
        },
      ].filter(Boolean)
    : []

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      backUrl="/identity/administration/roles"
      titleControl={
        roleTemplateId && !needsTenant ? (
          <CippEntitySwitcher
            title={title}
            currentId={roleTemplateId}
            queryParamKey="roleTemplateId"
            entityName="role"
            api={{
              url: '/api/ListPIMRoles',
              data: { tenantFilter },
              queryKey: `ListPIMRoles-switcher-${tenantFilter}`,
            }}
            getOptions={(data) =>
              Array.isArray(data) ? data : (data?.Results ?? [])
            }
            getId={(row) => row.RoleDefinitionId}
            getPrimary={(row) => row.RoleDisplayName}
            getSecondary={(row) => row.RoleDefinitionId}
            sortByPrimary
          />
        ) : undefined
      }
      subtitle={subtitle}
      isFetching={!!roleTemplateId && !needsTenant && roleRequest.isLoading}
    >
      {!roleTemplateId && (
        <Alert severity="info" sx={{ m: 2 }}>
          No role selected. Open this page from the Roles &amp; PIM list.
        </Alert>
      )}
      {roleTemplateId && needsTenant && (
        <Alert severity="info" sx={{ m: 2 }}>
          Select a single tenant to view role details. All Tenants is not
          supported on this page.
        </Alert>
      )}
      {roleTemplateId && !needsTenant && roleRequest.isLoading && (
        <CippFormSkeleton layout={[2, 1, 2, 2]} />
      )}
      {roleTemplateId && !needsTenant && roleRequest.isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Failed to load role details.
        </Alert>
      )}
      {roleTemplateId &&
        !needsTenant &&
        roleRequest.isSuccess &&
        !roleData && (
          <Alert severity="warning" sx={{ m: 2 }}>
            No role was found for this id in the selected tenant.
          </Alert>
        )}
      {roleRequest.isSuccess && roleData && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <CippHead title={title} />
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, lg: 4 }}>
              <Card>
                <CardHeader title="Role Details" />
                <Divider />
                <PropertyList>
                  <PropertyListItem
                    divider
                    value={
                      <Stack spacing={1} sx={{ alignItems: 'center' }}>
                        <SvgIcon sx={{ fontSize: 64 }}>
                          <CippIcons.AdminPanelSettings />
                        </SvgIcon>
                        <Typography variant="h6">
                          {roleData.RoleDisplayName || 'N/A'}
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: 'text.secondary' }}
                        >
                          {roleData.RoleIsBuiltIn
                            ? 'Built-in role'
                            : 'Custom role'}
                        </Typography>
                      </Stack>
                    }
                  />
                  <PropertyListItem
                    divider
                    label="Role Information"
                    value={
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            variant="inherit"
                            gutterBottom
                            sx={{ color: 'text.primary' }}
                          >
                            Description:
                          </Typography>
                          <Typography variant="inherit">
                            {roleData.RoleDescription || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            variant="inherit"
                            gutterBottom
                            sx={{ color: 'text.primary' }}
                          >
                            Role Definition ID:
                          </Typography>
                          <Typography variant="inherit">
                            {getCippFormatting(
                              roleData.RoleDefinitionId,
                              'RoleDefinitionId'
                            ) || 'N/A'}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Stack
                            direction="row"
                            spacing={0.5}
                            sx={{ alignItems: 'center', mb: 0.5 }}
                          >
                            <Typography
                              variant="inherit"
                              sx={{ color: 'text.primary' }}
                            >
                              Privileged Role:
                            </Typography>
                            <CippInfoTooltip title={PRIVILEGED_ROLE_TOOLTIP} />
                          </Stack>
                          <Typography variant="inherit">
                            {getCippFormatting(
                              roleData.IsPrivilegedRole,
                              'IsPrivilegedRole'
                            )}
                          </Typography>
                        </Grid>
                        <Grid size={{ xs: 12 }}>
                          <Typography
                            variant="inherit"
                            gutterBottom
                            sx={{ color: 'text.primary' }}
                          >
                            Members / Permanent / Eligible / Active:
                          </Typography>
                          <Typography variant="inherit">
                            {roleData.MemberCount ?? 0} /{' '}
                            {roleData.PermanentCount ?? 0} /{' '}
                            {roleData.EligibleCount ?? 0} /{' '}
                            {roleData.ActiveCount ?? 0}
                          </Typography>
                        </Grid>
                      </Grid>
                    }
                  />
                </PropertyList>
              </Card>
            </Grid>
            <Grid size={{ xs: 12, lg: 8 }}>
              <CippDataTable
                title="Assignments"
                data={roleData.Assignments ?? []}
                actions={[...assignmentActions, viewSignInsAction]}
                simpleColumns={[
                  'PrincipalDisplayName',
                  'PrincipalUserPrincipalName',
                  'PrincipalType',
                  'AssignmentType',
                  'MemberType',
                  'Scope',
                  'EndDateTime',
                ]}
              />
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
