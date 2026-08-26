import { Layout as DashboardLayout } from '../../../../layouts/index.js'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import CippFormComponent from '../../../../components/CippComponents/CippFormComponent'
import { usePermissions } from '../../../../hooks/use-permissions'
import { PersonRemove } from '@mui/icons-material'

const RemoveRoleMembersForm = ({ formHook, row }) => {
  const memberOptions = (row?.Members ?? []).map((member) => ({
    label: member.userPrincipalName
      ? `${member.displayName} (${member.userPrincipalName})`
      : member.displayName,
    value: member.id,
    addedFields: {
      displayName: member.displayName,
      userPrincipalName: member.userPrincipalName,
    },
  }))

  return (
    <CippFormComponent
      type="autoComplete"
      name="Users"
      label="Members to remove"
      multiple={true}
      creatable={false}
      formControl={formHook}
      options={memberOptions}
      validators={{ required: 'Please select at least one member to remove' }}
    />
  )
}

const Page = () => {
  const pageTitle = 'Roles'
  const { checkPermissions } = usePermissions()
  const canWriteRole = checkPermissions(['Identity.Role.ReadWrite'])

  const actions = [
    {
      label: 'Remove Members',
      type: 'POST',
      icon: <PersonRemove />,
      url: '/api/ExecRemoveAdminRole',
      children: ({ formHook, row }) => (
        <RemoveRoleMembersForm formHook={formHook} row={row} />
      ),
      data: {
        RoleId: 'Id',
        RoleTemplateId: 'roleTemplateId',
        RoleName: 'DisplayName',
      },
      confirmText: 'Select the members to remove from [DisplayName].',
      allowResubmit: true,
      hideBulk: true,
      // Custom roles have no roleTemplateId and no removal path via directoryRoles
      condition: (row) =>
        canWriteRole &&
        (row?.Members ?? []).length > 0 &&
        !!row?.roleTemplateId,
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'DisplayName', // Role Group Name
      'isBuiltIn', // Built-in vs custom role
      'Members', // Member Names
    ],
    actions: actions,
  }

  const columns = [
    'DisplayName', // Role Name
    'Description', // Description
    'Members', // Members
    'isBuiltIn', // Built-in vs custom role
  ]

  return (
    <CippTablePage
      title={pageTitle}
      apiUrl="/api/ListRoles"
      actions={actions}
      offCanvas={offCanvas}
      simpleColumns={columns}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)

export default Page
