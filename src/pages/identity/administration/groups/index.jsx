import { Button } from '@mui/material'
import { CippIcons } from '../../../../utils/icon-registry'
import { CippTablePage } from '../../../../components/CippComponents/CippTablePage.jsx'
import { Layout as DashboardLayout } from '../../../../layouts/index'
import Link from 'next/link'
import { Stack } from '@mui/system'
import { useSettings } from '../../../../hooks/use-settings'
import { useCippReportDB } from '../../../../components/CippComponents/CippReportDBControls'
import { getRowTenant } from '../../../../utils/resolve-row-templates'

const Page = () => {
  const pageTitle = 'Groups'
  const { currentTenant } = useSettings()
  const tenantQuery =
    currentTenant === 'AllTenants' ? '[Tenant]' : currentTenant
  const nestedTenantQuery =
    currentTenant === 'AllTenants' ? '[parent.Tenant]' : currentTenant

  const reportDB = useCippReportDB({
    apiUrl: '/api/ListGroups',
    queryKey: 'ListGroups',
    cacheName: 'Groups',
    syncTitle: 'Sync Groups Report',
    allowToggle: true,
    defaultCached: false,
    allowAllTenantSync: true,
    cacheColumns: ['CacheTimestamp'],
    serverPagination: true,
  })

  const actions = [
    {
      label: 'View Group',
      link: `/identity/administration/groups/group?groupId=[id]&tenantFilter=${tenantQuery}`,
      pinned: true,
      color: 'info',
      icon: <CippIcons.EyeIcon />,
      multiPost: false,
    },
    {
      //tested
      label: 'Edit Group',
      link: '/identity/administration/groups/edit?groupId=[id]&groupType=[groupType]',
      pinned: true,
      multiPost: false,
      icon: <CippIcons.Edit />,
      color: 'success',
    },
    {
      label: 'Add Member',
      type: 'POST',
      url: '/api/EditGroup',
      icon: <CippIcons.PersonAdd />,
      customDataformatter: (row, action, formData) => {
        // Members picked in the dialog already carry {label, value: id, addedFields}
        const addMember = [...(formData.AddMember ?? [])]
        // CSV rows only carry a userPrincipalName; without a value the backend
        // resolves the directory object id itself
        ;(formData.bulkMember ?? []).forEach((csvRow) => {
          const upnKey = Object.keys(csvRow).find(
            (key) => key.trim().toLowerCase() === 'userprincipalname'
          )
          const userPrincipalName = upnKey ? csvRow[upnKey]?.trim() : undefined
          if (userPrincipalName) {
            addMember.push({
              label: userPrincipalName,
              addedFields: { userPrincipalName: userPrincipalName },
            })
          }
        })

        // Handle multiple groups - return an array of requests (one per group)
        const selectedGroups = Array.isArray(row) ? row : [row]
        return selectedGroups.map((group) => ({
          AddMember: addMember,
          tenantFilter: getRowTenant(group, currentTenant),
          groupId: group.id,
          groupName: group.displayName,
          groupType: group.groupType,
        }))
      },
      fields: [
        {
          type: 'autoComplete',
          name: 'AddMember',
          label: 'Select users to add as members',
          multiple: true,
          creatable: false,
          api: {
            url: '/api/ListGraphRequest',
            data: {
              Endpoint: 'users',
              $select: 'id,displayName,userPrincipalName',
              $top: 999,
              $count: true,
            },
            dataKey: 'Results',
            labelField: (user) => `${user.displayName} (${user.userPrincipalName})`,
            valueField: 'id',
            addedField: {
              userPrincipalName: 'userPrincipalName',
              displayName: 'displayName',
            },
            queryKey: 'ListUsersAutoComplete',
            showRefresh: true,
          },
          validators: {
            validate: (value, formValues) =>
              (Array.isArray(value) && value.length > 0) ||
              (Array.isArray(formValues.bulkMember) && formValues.bulkMember.length > 0) ||
              'Select at least one user or upload a CSV',
          },
        },
        {
          type: 'CSVReader',
          name: 'bulkMember',
        },
      ],
      confirmText:
        'Select the users to add as members to [displayName], or drop a CSV file with a userPrincipalName column to bulk add members.',
      // Manual member adds are rejected on dynamic and on-prem synced groups
      condition: (row) => !row?.membershipRule && row?.onPremisesSyncEnabled !== true,
      multiPost: false,
      allowResubmit: true,
    },
    {
      label: 'Set Global Address List Visibility',
      type: 'POST',
      url: '/api/ExecGroupsHideFromGAL',
      icon: <CippIcons.EyeIcon />,
      data: {
        ID: 'mail',
        GroupType: 'groupType',
      },
      fields: [
        {
          type: 'radio',
          name: 'HidefromGAL',
          label: 'Global Address List Visibility',
          options: [
            { label: 'Hidden', value: true },
            { label: 'Shown', value: false },
          ],
          validators: { required: 'Please select a visibility option' },
        },
      ],
      confirmText:
        'Are you sure you want to hide this group from the global address list? Remember this will not work if the group is AD Synched.',
      multiPost: false,
    },
    {
      label: 'Set Group Visibility',
      type: 'POST',
      url: '/api/EditGroup',
      icon: <CippIcons.Visibility />,
      data: {
        groupId: 'id',
        groupType: 'groupType',
        groupName: 'displayName',
      },
      // Pre-select when all selected rows share Public or Private (not HiddenMembership)
      defaultvalues: (row) => {
        const states = [
          ...new Set((Array.isArray(row) ? row : [row]).map((r) => r?.visibility)),
        ]
        return states.length === 1 && (states[0] === 'Public' || states[0] === 'Private')
          ? { visibility: states[0] }
          : {}
      },
      fields: [
        {
          type: 'radio',
          name: 'visibility',
          label: 'Group Visibility',
          options: [
            { label: 'Public', value: 'Public' },
            { label: 'Private', value: 'Private' },
          ],
          validators: { required: 'Please select a visibility option' },
        },
      ],
      confirmText:
        'Are you sure you want to set the visibility for [displayName]? This only applies to Microsoft 365 groups.',
      condition: (row) => row?.groupType === 'Microsoft 365',
      // Mixed selections run against the M365 subset instead of disabling the action
      bulkFilterEligible: true,
      multiPost: false,
    },
    {
      label: 'Only allow messages from people inside the organisation',
      type: 'POST',
      url: '/api/ExecGroupsDeliveryManagement',
      icon: <CippIcons.Lock />,
      data: {
        ID: 'mail',
        GroupType: 'groupType',
        OnlyAllowInternal: true,
      },
      confirmText:
        'Are you sure you want to only allow messages from people inside the organisation? Remember this will not work if the group is AD Synched.',
      multiPost: false,
    },
    {
      label: 'Allow messages from people inside and outside the organisation',
      type: 'POST',
      icon: <CippIcons.LockOpen />,
      url: '/api/ExecGroupsDeliveryManagement',
      data: {
        ID: 'mail',
        GroupType: 'groupType',
        OnlyAllowInternal: false,
      },
      confirmText:
        'Are you sure you want to allow messages from people inside and outside the organisation? Remember this will not work if the group is AD Synched.',
      multiPost: false,
    },
    {
      label: 'Set Source of Authority',
      type: 'POST',
      url: '/api/ExecSetCloudManaged',
      icon: <CippIcons.CloudSync />,
      data: {
        ID: 'id',
        displayName: 'displayName',
        type: '!Group',
      },
      // Pre-select the current source of authority; leave unselected when the
      // selected rows have mixed states
      defaultvalues: (row) => {
        const states = [
          ...new Set(
            (Array.isArray(row) ? row : [row]).map((r) => r?.onPremisesSyncEnabled === true)
          ),
        ]
        return states.length === 1 ? { isCloudManaged: String(!states[0]) } : {}
      },
      fields: [
        {
          type: 'radio',
          name: 'isCloudManaged',
          label: 'Source of Authority',
          options: [
            { label: 'Cloud Managed', value: true },
            { label: 'On-Premises Managed', value: false },
          ],
          validators: {
            required: 'Please select a source of authority',
            validate: (value, formValues, row) => {
              const states = [
                ...new Set(
                  (Array.isArray(row) ? row : [row]).map((r) => r?.onPremisesSyncEnabled === true)
                ),
              ]
              if (states.length === 1 && String(value) === String(!states[0])) {
                return 'Source of authority is unchanged'
              }
              return true
            },
          },
        },
      ],
      confirmText:
        "Are you sure you want to change the source of authority for '[displayName]'? Setting it to On-Premises Managed will take until the next sync cycle to show the change.",
      multiPost: false,
      // Only meaningful for groups that are on-premises managed (convert to cloud) or
      // were synced at some point (revert to on-premises); hide for cloud-native groups
      condition: (row) =>
        row?.onPremisesSyncEnabled === true || !!row?.onPremisesSamAccountName,
    },
    {
      label: 'Create template based on group',
      type: 'POST',
      url: '/api/AddGroupTemplate',
      icon: <CippIcons.GroupSharp />,
      data: {
        displayName: 'displayName',
        description: 'description',
        groupType: 'calculatedGroupType',
        membershipRules: 'membershipRule',
        allowExternal: 'allowExternal',
        username: 'mailNickname',
      },
      confirmText: 'Are you sure you want to create a template based on this group?',
      multiPost: false,
    },
    {
      label: 'Create Team from Group',
      type: 'POST',
      url: '/api/AddGroupTeam',
      icon: <CippIcons.GroupAdd />,
      data: {
        GroupId: 'id',
      },
      confirmText:
        'Are you sure you want to create a Team from this group? Note: The group must be at least 15 minutes old for this to work.',
      multiPost: false,
      defaultvalues: {
        TeamSettings: {
          memberSettings: {
            allowCreatePrivateChannels: false,
            allowCreateUpdateChannels: true,
            allowDeleteChannels: false,
            allowAddRemoveApps: false,
            allowCreateUpdateRemoveTabs: false,
            allowCreateUpdateRemoveConnectors: false,
          },
          messagingSettings: {
            allowUserEditMessages: true,
            allowUserDeleteMessages: true,
            allowOwnerDeleteMessages: false,
            allowTeamMentions: false,
            allowChannelMentions: false,
          },
          funSettings: {
            allowGiphy: true,
            giphyContentRating: 'strict',
            allowStickersAndMemes: false,
            allowCustomMemes: false,
          },
        },
      },
      fields: [
        {
          type: 'heading',
          name: 'memberSettingsHeading',
          label: 'Member Settings',
        },
        {
          type: 'switch',
          name: 'TeamSettings.memberSettings.allowCreatePrivateChannels',
          label: 'Allow members to create private channels',
        },
        {
          type: 'switch',
          name: 'TeamSettings.memberSettings.allowCreateUpdateChannels',
          label: 'Allow members to create and update channels',
        },
        {
          type: 'switch',
          name: 'TeamSettings.memberSettings.allowDeleteChannels',
          label: 'Allow members to delete channels',
        },
        {
          type: 'switch',
          name: 'TeamSettings.memberSettings.allowAddRemoveApps',
          label: 'Allow members to add and remove apps',
        },
        {
          type: 'switch',
          name: 'TeamSettings.memberSettings.allowCreateUpdateRemoveTabs',
          label: 'Allow members to create, update and remove tabs',
        },
        {
          type: 'switch',
          name: 'TeamSettings.memberSettings.allowCreateUpdateRemoveConnectors',
          label: 'Allow members to create, update and remove connectors',
        },
        {
          type: 'heading',
          name: 'messagingSettingsHeading',
          label: 'Messaging Settings',
        },
        {
          type: 'switch',
          name: 'TeamSettings.messagingSettings.allowUserEditMessages',
          label: 'Allow users to edit their messages',
        },
        {
          type: 'switch',
          name: 'TeamSettings.messagingSettings.allowUserDeleteMessages',
          label: 'Allow users to delete their messages',
        },
        {
          type: 'switch',
          name: 'TeamSettings.messagingSettings.allowOwnerDeleteMessages',
          label: 'Allow owners to delete messages',
        },
        {
          type: 'switch',
          name: 'TeamSettings.messagingSettings.allowTeamMentions',
          label: 'Allow @team mentions',
        },
        {
          type: 'switch',
          name: 'TeamSettings.messagingSettings.allowChannelMentions',
          label: 'Allow @channel mentions',
        },
        {
          type: 'heading',
          name: 'funSettingsHeading',
          label: 'Fun Settings',
        },
        {
          type: 'switch',
          name: 'TeamSettings.funSettings.allowGiphy',
          label: 'Allow Giphy',
        },
        {
          type: 'select',
          name: 'TeamSettings.funSettings.giphyContentRating',
          label: 'Giphy content rating',
          options: [
            { value: 'strict', label: 'Strict' },
            { value: 'moderate', label: 'Moderate' },
          ],
        },
        {
          type: 'switch',
          name: 'TeamSettings.funSettings.allowStickersAndMemes',
          label: 'Allow stickers and memes',
        },
        {
          type: 'switch',
          name: 'TeamSettings.funSettings.allowCustomMemes',
          label: 'Allow custom memes',
        },
      ],
      condition: (row) => row?.calculatedGroupType === 'm365',
    },
    {
      label: 'Delete Group',
      type: 'POST',
      url: '/api/ExecGroupsDelete',
      icon: <CippIcons.Delete />,
      data: {
        ID: 'id',
        GroupType: 'groupType',
        DisplayName: 'displayName',
      },
      confirmText: 'Are you sure you want to delete [displayName]?',
      multiPost: false,
    },
  ]
  const offCanvas = {
    extendedInfoFields: [
      'displayName',
      'userPrincipalName',
      'id',
      'mail',
      'description',
      'mailEnabled',
      'securityEnabled',
      'visibility',
      'assignedLicenses',
      'licenseProcessingState.state',
      'onPremisesSamAccountName',
      'membershipRule',
      'onPremisesSyncEnabled',
    ],
    actions: actions,
  }
  return (
    <>
      <CippTablePage
        title={pageTitle}
        cardButton={
          <Stack direction="row" spacing={1} sx={{
            alignItems: "center"
          }}>
            <Button component={Link} href="groups/add" startIcon={<CippIcons.GroupAdd />}>
              Add Group
            </Button>
            <Button
              component={Link}
              href="/identity/administration/group-templates/deploy"
              startIcon={<CippIcons.RocketLaunch />}
            >
              Deploy Group Template
            </Button>
          </Stack>
        }
        dataSourceControls={reportDB.controls}
        apiUrl={reportDB.resolvedApiUrl}
        apiData={reportDB.resolvedApiData}
        apiDataKey={reportDB.apiDataKey}
        // Paged cache reads arrive in table walk order, not sorted like the unpaged report.
        defaultSorting={[{ id: 'displayName', desc: false }]}
        queryKey={
          reportDB.useReportDB ? reportDB.resolvedQueryKey : `groups-${currentTenant}`
        }
        actions={actions}
        offCanvas={offCanvas}
        rowOpen={{
          link: `/identity/administration/groups/group?groupId=[id]&tenantFilter=${tenantQuery}`,
          condition: (row) => Boolean(row?.id),
        }}
        simpleColumns={[
          ...reportDB.cacheColumns,
          ...(reportDB.isAllTenants && reportDB.useReportDB ? ['Tenant'] : []),
          'displayName',
          'description',
          'mail',
          'mailEnabled',
          'mailNickname',
          'groupType',
          'assignedLicenses',
          'licenseProcessingState.state',
          'visibility',
          'onPremisesSamAccountName',
          'membershipRule',
          'onPremisesSyncEnabled',
          'members',
          'owners',
        ]}
        subTables={[
          {
            id: 'members',
            header: 'Members',
            label: 'View members',
            cachedColumn: 'membersCsv',
            table: {
              title: 'Members of [displayName]',
              queryKey: 'group-members-[id]',
              api: {
                url: '/api/ListGroups',
                data: { groupID: '[id]', members: true, groupType: '[groupType]' },
                dataKey: 'members',
              },
              simpleColumns: ['displayName', 'userPrincipalName', 'mail', '@odata.type'],
              actions: [
                {
                  label: 'View User',
                  link: `/identity/administration/users/user?userId=[id]&tenantFilter=${nestedTenantQuery}`,
                  pinned: true,
                  color: 'info',
                  icon: <CippIcons.EyeIcon />,
                  condition: (row) =>
                    !row?.['@odata.type'] || row['@odata.type'] === '#microsoft.graph.user',
                },
                {
                  label: 'View Group',
                  link: `/identity/administration/groups/group?groupId=[id]&tenantFilter=${nestedTenantQuery}`,
                  pinned: true,
                  color: 'info',
                  icon: <CippIcons.EyeIcon />,
                  condition: (row) => row?.['@odata.type'] === '#microsoft.graph.group',
                },
                {
                  label: 'Remove Member',
                  type: 'POST',
                  url: '/api/ExecGroupMembers',
                  icon: <CippIcons.PersonRemove />,
                  data: { action: '!removeMember', groupId: 'parent.id', users: 'id' },
                  confirmText: 'Remove [displayName] from [parent.displayName]?',
                  condition: (row) =>
                    !row?.parent?.dynamicGroupBool && !row?.parent?.membershipRule,
                },
              ],
              cardButton: {
                label: 'Add Members',
                icon: <CippIcons.GroupAdd />,
                url: '/api/ExecGroupMembers',
                allowResubmit: true,
                relatedQueryKeys: 'group-members-[id]',
                confirmText: 'Add members to [displayName]?',
                condition: (row) => !row?.dynamicGroupBool && !row?.membershipRule,
                data: { action: '!addMember', groupId: 'id' },
                fields: [
                  {
                    type: 'autoComplete',
                    name: 'users',
                    label: 'Add Members',
                    multiple: true,
                    creatable: false,
                    csvColumn: 'userPrincipalName',
                    api: {
                      url: '/api/ListUsersAndGroups',
                      dataKey: 'Results',
                      valueField: 'id',
                      labelField: 'displayName',
                      descriptionField: 'userPrincipalName',
                    },
                  },
                ],
              },
            },
          },
          {
            id: 'owners',
            header: 'Owners',
            label: 'View owners',
            cachedColumn: 'ownersCsv',
            table: {
              title: 'Owners of [displayName]',
              queryKey: 'group-owners-[id]',
              api: {
                url: '/api/ListGroups',
                data: { groupID: '[id]', owners: true, groupType: '[groupType]' },
                dataKey: 'owners',
              },
              simpleColumns: ['displayName', 'userPrincipalName', 'mail'],
              actions: [
                {
                  label: 'View User',
                  link: `/identity/administration/users/user?userId=[id]&tenantFilter=${nestedTenantQuery}`,
                  pinned: true,
                  color: 'info',
                  icon: <CippIcons.EyeIcon />,
                  condition: (row) =>
                    !row?.['@odata.type'] || row['@odata.type'] === '#microsoft.graph.user',
                },
                {
                  label: 'Remove Owner',
                  type: 'POST',
                  url: '/api/ExecGroupMembers',
                  icon: <CippIcons.PersonRemove />,
                  data: { action: '!removeOwner', groupId: 'parent.id', users: 'id' },
                  confirmText: 'Remove [displayName] as owner of [parent.displayName]?',
                },
              ],
              cardButton: {
                label: 'Add Owners',
                icon: <CippIcons.GroupAdd />,
                url: '/api/ExecGroupMembers',
                allowResubmit: true,
                relatedQueryKeys: 'group-owners-[id]',
                confirmText: 'Add owners to [displayName]?',
                data: { action: '!addOwner', groupId: 'id' },
                fields: [
                  {
                    type: 'autoComplete',
                    name: 'users',
                    label: 'Add Owners',
                    multiple: true,
                    creatable: false,
                    csvColumn: 'userPrincipalName',
                    api: {
                      url: '/api/ListGraphRequest',
                      dataKey: 'Results',
                      valueField: 'id',
                      labelField: 'displayName',
                      descriptionField: 'userPrincipalName',
                      data: {
                        Endpoint: 'users',
                        manualPagination: true,
                        $select: 'id,userPrincipalName,displayName',
                        $count: true,
                        $orderby: 'displayName',
                        $top: 999,
                      },
                    },
                  },
                ],
              },
            },
          },
        ]}
      />
      {reportDB.syncDialog}
    </>
  );
}

Page.getLayout = (page) => <DashboardLayout>{page}</DashboardLayout>

export default Page
