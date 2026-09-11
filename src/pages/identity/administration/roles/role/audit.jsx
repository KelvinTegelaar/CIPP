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
import { Alert, Chip, Tooltip } from '@mui/material'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippTablePage } from '../../../../../components/CippComponents/CippTablePage.jsx'
import CippJsonView from '../../../../../components/CippFormPages/CippJSONView'
import { PRIVILEGED_ROLE_TOOLTIP, getRoleRow } from '../../../../../utils/role-detail-shared'

const GUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

const buildRoleAuditFilter = (roleTemplateId, days = 30) => {
  const clampedDays = Math.min(90, Math.max(1, Number(days) || 30))
  const start = new Date()
  start.setUTCDate(start.getUTCDate() - clampedDays)
  const startTime = start.toISOString().replace(/\.\d{3}Z$/, 'Z')
  return `activityDateTime ge ${startTime} and targetResources/any(s:s/id eq '${roleTemplateId}')`
}

const Page = () => {
  const userSettingsDefaults = useSettings()
  const router = useRouter()
  const { roleTemplateId } = router.query
  const tenantFilter =
    router.query.tenantFilter ?? userSettingsDefaults.currentTenant
  const needsTenant = !tenantFilter || tenantFilter === 'AllTenants'
  const roleId =
    typeof roleTemplateId === 'string' && GUID_RE.test(roleTemplateId)
      ? roleTemplateId
      : null

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
      ].filter(Boolean)
    : []

  const offCanvas = {
    children: (row) => (
      <CippJsonView object={row} defaultOpen={true} title="Audit Event Details" />
    ),
    size: 'xl',
  }

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
      <CippHead title={title ? `${title} - Audit` : 'Role Audit'} />
      {!roleTemplateId && (
        <Alert severity="info" sx={{ m: 2 }}>
          No role selected. Open this page from the Roles &amp; PIM list.
        </Alert>
      )}
      {roleTemplateId && needsTenant && (
        <Alert severity="info" sx={{ m: 2 }}>
          Select a single tenant to view role audit events. All Tenants is not
          supported on this page.
        </Alert>
      )}
      {roleTemplateId && !needsTenant && !roleId && (
        <Alert severity="warning" sx={{ m: 2 }}>
          Role id must be a valid GUID.
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
      {roleId && !needsTenant && (
        <CippTablePage
          title="Role Audit"
          apiUrl="/api/ListGraphRequest"
          apiData={{
            Endpoint: 'auditLogs/directoryAudits',
            tenantFilter,
            $filter: buildRoleAuditFilter(roleId, 30),
            $orderby: 'activityDateTime desc',
            $top: 999,
            manualPagination: true,
          }}
          apiDataKey="Results"
          queryKey={`RoleAudit-${tenantFilter}-${roleId}`}
          tenantInTitle={false}
          offCanvas={offCanvas}
          mobileCard={{ primary: 'activityDisplayName' }}
          simpleColumns={[
            'activityDateTime',
            'activityDisplayName',
            'category',
            'result',
            'initiatedBy.user.userPrincipalName',
            'targetResources',
          ]}
        />
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
