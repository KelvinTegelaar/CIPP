import Link from 'next/link'
import { Button } from '@mui/material'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { CippAdministrativeUnitUsageDialog } from '../../../../components/CippComponents/CippAdministrativeUnitUsageDialog'
import { deviceMemberApi } from '../../../../components/CippFormPages/CippAdministrativeUnitForm'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import { useSettings } from '../../../../hooks/use-settings'
import { usePermissions } from '../../../../hooks/use-permissions'

const isAssigned = (row) => row?.membershipType !== 'Dynamic'

const memberToRequest = (option) => ({
  value: option.value,
  label: option.label,
})

const Page = () => {
  const tenantFilter = useSettings().currentTenant
  const { checkPermissions } = usePermissions()
  const canWrite = checkPermissions(['Identity.Role.ReadWrite'])
  const queryKey = `AdministrativeUnits-${tenantFilter}`

  const addMemberFields = [
    {
      type: 'autoComplete',
      name: 'UsersAndGroups',
      label: 'Users or groups',
      multiple: true,
      creatable: false,
      api: {
        url: '/api/ListUsersAndGroups',
        dataKey: 'Results',
        valueField: 'id',
        labelField: 'displayName',
        descriptionField: 'userPrincipalName',
      },
    },
    {
      type: 'autoComplete',
      name: 'Devices',
      label: 'Devices',
      multiple: true,
      creatable: false,
      api: deviceMemberApi(tenantFilter),
      validators: {
        validate: (value, values) =>
          (Array.isArray(value) && value.length > 0) ||
          (Array.isArray(values.UsersAndGroups) &&
            values.UsersAndGroups.length > 0) ||
          'Select at least one user, group or device',
      },
    },
  ]

  const addMembersRequest = (row, formData) => ({
    tenantFilter,
    action: 'addMember',
    ID: row.id,
    displayName: row.displayName,
    members: [
      ...(formData.UsersAndGroups ?? []),
      ...(formData.Devices ?? []),
    ].map(memberToRequest),
  })

  const actions = [
    {
      label: 'Edit Administrative Unit',
      link: '/identity/administration/administrative-units/edit?id=[id]',
      icon: <CippIcons.Edit />,
      color: 'success',
      pinned: true,
      multiPost: false,
      condition: () => canWrite,
    },
    {
      label: 'Where is this used',
      icon: <CippIcons.Search />,
      color: 'info',
      hideBulk: true,
      multiPost: false,
      customComponent: (row, { drawerVisible, setDrawerVisible }) => (
        <CippAdministrativeUnitUsageDialog
          unit={Array.isArray(row) ? row[0] : row}
          tenantFilter={tenantFilter}
          open={!!drawerVisible}
          onClose={() => setDrawerVisible(false)}
        />
      ),
    },
    {
      label: 'Add Members',
      type: 'POST',
      url: '/api/ExecAdministrativeUnitMembers',
      icon: <CippIcons.PersonAdd />,
      fields: addMemberFields,
      customDataformatter: (rows, action, formData) =>
        (Array.isArray(rows) ? rows : [rows]).map((row) =>
          addMembersRequest(row, formData)
        ),
      confirmText:
        'Select the users, groups or devices to add to [displayName]. Adding a group adds the group itself, not its members.',
      relatedQueryKeys: [queryKey, 'AdministrativeUnitMembers-*'],
      condition: (row) => canWrite && isAssigned(row),
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Remove Members',
      type: 'POST',
      url: '/api/ExecAdministrativeUnitMembers',
      icon: <CippIcons.PersonRemove />,
      fields: [
        {
          type: 'autoComplete',
          name: 'RemoveMembers',
          label: 'Members to remove',
          multiple: true,
          creatable: false,
          api: {
            url: '/api/ListAdministrativeUnitMembers',
            // Plain property names resolve against the clicked row: the unit's current members.
            data: { ID: 'id' },
            processFieldData: true,
            valueField: 'id',
            labelField: (member) =>
              member.userPrincipalName
                ? `${member.displayName} (${member.userPrincipalName})`
                : `${member.displayName} (${member.type})`,
          },
          validators: {
            validate: (value) =>
              (Array.isArray(value) && value.length > 0) ||
              'Select at least one member',
          },
        },
      ],
      customDataformatter: (row, action, formData) => ({
        tenantFilter,
        action: 'removeMember',
        ID: row.id,
        displayName: row.displayName,
        members: (formData.RemoveMembers ?? []).map(memberToRequest),
      }),
      confirmText: 'Select the members to remove from [displayName].',
      relatedQueryKeys: [queryKey, 'AdministrativeUnitMembers-*'],
      condition: (row) => canWrite && isAssigned(row),
      // The picker lists one unit's members, so there is no bulk variant.
      hideBulk: true,
      allowResubmit: true,
    },
    {
      label: 'Pause dynamic membership',
      type: 'POST',
      url: '/api/EditAdministrativeUnit',
      icon: <CippIcons.Pause />,
      data: {
        ID: 'id',
        currentDisplayName: 'displayName',
        membershipRuleProcessingState: '!Paused',
      },
      confirmText:
        'Pause the membership rule of [displayName]? Members stay as they are until the rule is turned back on.',
      relatedQueryKeys: [queryKey],
      condition: (row) =>
        canWrite &&
        !isAssigned(row) &&
        row?.membershipRuleProcessingState !== 'Paused',
      multiPost: false,
    },
    {
      label: 'Resume dynamic membership',
      type: 'POST',
      url: '/api/EditAdministrativeUnit',
      icon: <CippIcons.PlayArrow />,
      data: {
        ID: 'id',
        currentDisplayName: 'displayName',
        membershipRuleProcessingState: '!On',
      },
      confirmText:
        'Turn the membership rule of [displayName] back on? Members are re-evaluated.',
      relatedQueryKeys: [queryKey],
      condition: (row) =>
        canWrite &&
        !isAssigned(row) &&
        row?.membershipRuleProcessingState === 'Paused',
      multiPost: false,
    },
    {
      label: 'Delete Administrative Unit',
      type: 'POST',
      url: '/api/RemoveAdministrativeUnit',
      icon: <CippIcons.Delete />,
      color: 'danger',
      data: { ID: 'id', displayName: 'displayName' },
      confirmText:
        'Delete [displayName]? Its members are kept, but every role assignment scoped to it stops applying. Check "Where is this used" first. The unit can be restored from Deleted Items for 30 days.',
      relatedQueryKeys: [queryKey],
      condition: () => canWrite,
      multiPost: false,
    },
  ]

  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'description',
      'id',
      'visibility',
      'membershipType',
      'membershipRule',
      'membershipRuleProcessingState',
      'isMemberManagementRestricted',
    ],
    actions,
  }

  return (
    <CippTablePage
      title="Administrative Units"
      apiUrl="/api/ListAdministrativeUnits"
      queryKey={queryKey}
      actions={actions}
      offCanvas={offCanvas}
      cardButton={
        canWrite ? (
          <Button
            component={Link}
            href="/identity/administration/administrative-units/add"
            startIcon={<CippIcons.Add />}
          >
            Add Administrative Unit
          </Button>
        ) : null
      }
      simpleColumns={[
        'displayName',
        'description',
        'membershipType',
        'membershipRule',
        'membershipRuleProcessingState',
        'visibility',
        'isMemberManagementRestricted',
        'members',
      ]}
      subTables={[
        {
          id: 'members',
          header: 'Members',
          label: 'View members',
          table: {
            title: 'Members of [displayName]',
            queryKey: 'AdministrativeUnitMembers-[id]',
            api: {
              url: '/api/ListAdministrativeUnitMembers',
              data: { ID: '[id]' },
            },
            simpleColumns: [
              'displayName',
              'type',
              'userPrincipalName',
              'mail',
              'operatingSystem',
            ],
            actions: [
              {
                label: 'View User',
                link: `/identity/administration/users/user?userId=[id]&tenantFilter=${tenantFilter}`,
                icon: <CippIcons.EyeIcon />,
                color: 'info',
                condition: (row) => row?.type === 'User',
              },
              {
                label: 'View Group',
                link: `/identity/administration/groups/group?groupId=[id]&tenantFilter=${tenantFilter}`,
                icon: <CippIcons.EyeIcon />,
                color: 'info',
                condition: (row) => row?.type === 'Group',
              },
              {
                label: 'Remove from unit',
                type: 'POST',
                url: '/api/ExecAdministrativeUnitMembers',
                icon: <CippIcons.PersonRemove />,
                customDataformatter: (rows) =>
                  (Array.isArray(rows) ? rows : [rows]).map((row) => ({
                    tenantFilter,
                    action: 'removeMember',
                    ID: row.parent.id,
                    displayName: row.parent.displayName,
                    members: [{ value: row.id, label: row.displayName }],
                  })),
                confirmText: 'Remove [displayName] from [parent.displayName]?',
                relatedQueryKeys: ['AdministrativeUnitMembers-*'],
                condition: (row) => canWrite && isAssigned(row?.parent),
                multiPost: false,
              },
            ],
            cardButton: {
              label: 'Add Members',
              icon: <CippIcons.GroupAdd />,
              url: '/api/ExecAdministrativeUnitMembers',
              relatedQueryKeys: 'AdministrativeUnitMembers-[id]',
              confirmText:
                'Add members to [displayName]? Adding a group adds the group itself, not its members.',
              condition: (row) => canWrite && isAssigned(row),
              fields: addMemberFields,
              customDataformatter: (row, action, formData) =>
                addMembersRequest(row, formData),
              allowResubmit: true,
            },
          },
        },
      ]}
    />
  )
}

Page.getLayout = (page) => (
  <DashboardLayout allTenantsSupport={false}>{page}</DashboardLayout>
)

export default Page
