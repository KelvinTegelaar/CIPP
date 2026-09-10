import { useRouter } from 'next/router'
import { CippIcons } from '../../../../utils/icon-registry'
import { Box } from '@mui/material'
import { useSettings } from '../../../../hooks/use-settings'
import { usePermissions } from '../../../../hooks/use-permissions'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { TabbedLayout } from '../../../../layouts/TabbedLayout'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippDataTable } from '../../../../components/CippTable/CippDataTable'
import { useCippRoleAssignmentActions } from '../../../../components/CippComponents/CippRoleAssignmentActions'
import tabOptions from './tabOptions.json'

// Drill-in panel: the role's assignments with the secure-direction actions (convert to
// eligible, grant time-bound, extend, renew, remove). The rows are embedded in the role row,
// so opening a role costs no extra request.
const RoleAssignmentsPanel = ({ row }) => {
  const actions = useCippRoleAssignmentActions({
    relatedQueryKeys: ['ListPIMRoles*', 'ListRoleAssignments*'],
  })
  return (
    <Box sx={{ mt: 2 }}>
      <CippDataTable
        title="Assignments"
        data={row?.Assignments ?? []}
        actions={actions}
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
    </Box>
  )
}

/**
 * One row per role, like the classic Roles page, with the PIM breakdown on top: how many
 * principals hold the role permanently, eligibly or time-bound, and the role's PIM policy
 * summary. Clicking a role expands it into its assignments with the secure-direction actions.
 * Single tenant reads live (roles nobody holds included); AllTenants reads the reporting
 * cache, which has no catalogue rows.
 */
const Page = () => {
  const pageTitle = 'Roles & Assignments'
  const router = useRouter()
  const currentTenant = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWriteRole = checkPermissions(['Identity.Role.ReadWrite'])
  // Deep links (alerts, the user page) narrow the list to one role or principal.
  const { roleTemplateId, principalId } = router.query
  const apiData = {}
  if (roleTemplateId) apiData.roleTemplateId = roleTemplateId
  if (principalId) apiData.principalId = principalId

  const actions = [
    {
      label: 'Create template from role settings',
      type: 'POST',
      icon: <CippIcons.PostAdd />,
      url: '/api/AddPIMRoleSettingsTemplate',
      data: {
        captureRoleId: 'RoleDefinitionId',
        captureRoleName: 'RoleDisplayName',
        tenantFilter: 'Tenant',
      },
      fields: [
        {
          type: 'textField',
          name: 'templateName',
          label: 'Template Name',
          required: true,
          validators: { required: 'A template name is required' },
        },
        {
          type: 'textField',
          name: 'description',
          label: 'Description (optional)',
        },
      ],
      confirmText:
        "Create a PIM role settings template from the current PIM settings of [RoleDisplayName]? Anything below CIPP's secure floor is raised to it, and every raised value is listed in the results.",
      relatedQueryKeys: ['ListPIMRoleSettingsTemplates*'],
      hideBulk: true,
      condition: (row) =>
        canWriteRole && !!row?.PIMCapable && !!row?.PolicySummary,
    },
  ]

  const filters = [
    {
      filterName: 'Roles with permanent admins',
      value: [{ id: 'HasPermanentMembers', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Privileged roles only',
      value: [{ id: 'IsPrivilegedRole', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Privileged roles with permanent admins',
      value: [
        { id: 'HasPermanentMembers', value: 'Yes' },
        { id: 'IsPrivilegedRole', value: 'Yes' },
      ],
      type: 'column',
    },
    {
      filterName: 'Policy below secure floor',
      value: [{ id: 'PolicyBelowFloor', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Assigned roles only',
      value: [{ id: 'IsAssigned', value: 'Yes' }],
      type: 'column',
    },
    {
      filterName: 'Roles nobody holds',
      value: [{ id: 'IsAssigned', value: 'No' }],
      type: 'column',
    },
    {
      filterName: 'Custom roles',
      value: [{ id: 'RoleIsBuiltIn', value: 'No' }],
      type: 'column',
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'RoleDisplayName',
      'RoleDescription',
      'RoleDefinitionId',
      'RoleIsBuiltIn',
      'IsPrivilegedRole',
      'MemberCount',
      'PermanentCount',
      'EligibleCount',
      'ActiveCount',
      'PolicySummary',
      'PolicyBelowFloor',
      'PIMCapable',
    ],
    children: (row) => <RoleAssignmentsPanel row={row} />,
    actions: actions,
  }

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListPIMRoles"
      apiData={apiData}
      queryKey={`ListPIMRoles-${currentTenant}`}
      actions={actions}
      offCanvas={offCanvas}
      filters={filters}
      simpleColumns={[
        'Tenant',
        'RoleDisplayName',
        'Members',
        'PermanentCount',
        'EligibleCount',
        'ActiveCount',
        'IsPrivilegedRole',
        'PolicySummary',
      ]}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={true}>
    <TabbedLayout tabOptions={tabOptions}>{page}</TabbedLayout>
  </DashboardLayout>
)

export default Page
