import { useMemo } from 'react'
import { useRouter } from 'next/router'
import { Alert, Box, Button } from '@mui/material'
import { Grid, Stack } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useDialog } from '../../../../../hooks/use-dialog'
import { ApiGetCall } from '../../../../../api/ApiCall'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippTimeAgo } from '../../../../../components/CippComponents/CippTimeAgo'
import { CippApiDialog } from '../../../../../components/CippComponents/CippApiDialog'
import { CippPropertyListCard } from '../../../../../components/CippCards/CippPropertyListCard'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import { CippEntitySwitcher } from '../../../../../components/CippComponents/CippEntitySwitcher'
import { useCippTeam } from '../../../../../components/CippComponents/CippTeamHeader'
import { renderUrlValue } from '../../../../../utils/render-url-value'
import tabOptions from './tabOptions'

const CHANNEL_TYPES = {
  standard: 'Standard',
  private: 'Private',
  shared: 'Shared',
}
const WEBSITE_APP = 'com.microsoft.teamspace.tab.web'

const NEW_MESSAGES = [
  { label: 'Everyone', value: 'everyone' },
  { label: 'Only owners and moderators', value: 'moderators' },
]
const REPLIES = [
  { label: 'Everyone', value: 'everyone' },
  { label: 'Only the author and moderators', value: 'authorAndModerators' },
]
const ROLES = [
  { label: 'Member', value: 'Member' },
  { label: 'Owner', value: 'Owner' },
]

const first = (request) => {
  const results = request.data?.Results ?? request.data
  return Array.isArray(results) ? results[0] : results
}
const rows = (request) => {
  const results = request.data?.Results
  return Array.isArray(results) ? results : []
}
const httpsOnly = (value) =>
  !value ||
  /^https:\/\/[^\s]+$/i.test(value) ||
  'Enter an address that starts with https://'

const Page = () => {
  const router = useRouter()
  const { groupId: teamId, channelId } = router.query
  const currentTenant = useSettings().currentTenant
  const tenantFilter = router.query.tenantFilter ?? currentTenant
  const membersDialog = useDialog()
  const tabDialog = useDialog()
  const ready = Boolean(teamId && channelId)
  const channelPath = `teams/${teamId}/channels/${channelId}`
  const channelKey = `TeamChannel-${tenantFilter}-${teamId}-${channelId}`

  const { group, teamData } = useCippTeam(teamId, tenantFilter)
  const teamName = group?.displayName

  const channelRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: channelPath,
      $select:
        'id,displayName,description,membershipType,createdDateTime,webUrl,isArchived,moderationSettings',
      AsApp: true,
      tenantFilter,
    },
    queryKey: channelKey,
    waiting: ready,
  })
  const channel = first(channelRequest)
  const isGeneral = channel?.displayName === 'General'
  const hasMembers = channel && channel.membershipType !== 'standard'

  const filesRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `${channelPath}/filesFolder`,
      $select: 'webUrl',
      AsApp: true,
      tenantFilter,
    },
    queryKey: `${channelKey}-files`,
    waiting: ready,
  })
  const filesUrl = first(filesRequest)?.webUrl

  const membersKey = `${channelKey}-members`
  const membersRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: { Endpoint: `${channelPath}/members`, AsApp: true, tenantFilter },
    queryKey: membersKey,
    waiting: Boolean(ready && hasMembers),
  })
  const members = rows(membersRequest).map((member) => ({
    id: member.id,
    displayName: member.displayName,
    email: member.email,
    Role: member.roles?.includes('owner')
      ? 'Owner'
      : member.roles?.includes('guest')
        ? 'Guest'
        : 'Member',
  }))

  // People who can join a private channel: the team's own members, guests included.
  const teamMembers = [
    ...(teamData?.Owners ?? []),
    ...(teamData?.Members ?? []),
  ]
  const guestIds = new Set(
    teamMembers
      .filter((member) => member.roles?.includes('guest'))
      .map((member) => member.userId)
  )
  const teamMemberOptions = teamMembers
    .filter((member) => member.userId)
    .map((member) => ({
      label: `${member.displayName}${member.email ? ` (${member.email})` : ''}${
        guestIds.has(member.userId) ? ' - Guest' : ''
      }`,
      value: member.userId,
    }))

  const tabsKey = `${channelKey}-tabs`
  const tabsRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: {
      Endpoint: `${channelPath}/tabs`,
      $expand: 'teamsApp',
      AsApp: true,
      tenantFilter,
    },
    queryKey: tabsKey,
    waiting: ready,
  })
  // Only a website tab's own address is shown; other tabs are named by their app.
  const tabs = rows(tabsRequest).map((tab) => ({
    id: tab.id,
    displayName: tab.displayName,
    App: tab.teamsApp?.displayName ?? tab.teamsApp?.id,
    Address:
      tab.teamsApp?.id === WEBSITE_APP ? tab.configuration?.websiteUrl : '',
    isWebsite: tab.teamsApp?.id === WEBSITE_APP,
  }))

  const action = (name, extra = {}) => ({
    tenantFilter,
    TeamID: teamId,
    ChannelID: channelId,
    Action: name,
    ...extra,
  })

  const headerActions = [
    {
      label: 'Edit channel',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Edit />,
      // Teams does not let apps edit the General channel.
      hideCondition: () => isGeneral,
      condition: () => !channel?.isArchived,
      fields: [
        {
          type: 'textField',
          name: 'DisplayName',
          label: 'Channel name',
          validators: { required: 'Enter a channel name' },
        },
        { type: 'textField', name: 'Description', label: 'Description' },
      ],
      defaultvalues: (row) => ({
        DisplayName: row?.displayName,
        Description: row?.description ?? '',
      }),
      customDataformatter: (row, _action, formData) =>
        action('EditChannel', {
          // Graph rejects a rename to the current name, so only a changed name is sent.
          DisplayName:
            formData?.DisplayName !== row?.displayName
              ? formData?.DisplayName
              : undefined,
          Description: formData?.Description,
        }),
      confirmText: 'Change the channel name and description.',
      relatedQueryKeys: [channelKey, `Team-${tenantFilter}-${teamId}`],
    },
    {
      label: 'Edit moderation',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Gavel />,
      hideCondition: () => channel?.membershipType !== 'standard',
      condition: () => !channel?.isArchived,
      fields: [
        {
          type: 'autoComplete',
          name: 'NewMessages',
          label: 'Who can start a post',
          multiple: false,
          creatable: false,
          options: NEW_MESSAGES,
          validators: { required: 'Choose who can start a post' },
        },
        {
          type: 'autoComplete',
          name: 'Replies',
          label: 'Who can reply',
          multiple: false,
          creatable: false,
          options: REPLIES,
          validators: { required: 'Choose who can reply' },
        },
        { type: 'switch', name: 'AllowBots', label: 'Bots can post' },
        {
          type: 'switch',
          name: 'AllowConnectors',
          label: 'Connectors can post',
        },
      ],
      defaultvalues: (row) => {
        const settings = row?.moderationSettings
        return {
          NewMessages:
            NEW_MESSAGES.find(
              (o) => o.value === settings?.userNewMessageRestriction
            ) ?? NEW_MESSAGES[0],
          Replies:
            REPLIES.find((o) => o.value === settings?.replyRestriction) ??
            REPLIES[0],
          AllowBots: settings?.allowNewMessageFromBots ?? true,
          AllowConnectors: settings?.allowNewMessageFromConnectors ?? true,
        }
      },
      customDataformatter: (_row, _action, formData) =>
        action('SetChannelModeration', {
          NewMessages: formData?.NewMessages,
          Replies: formData?.Replies,
          AllowBots: formData?.AllowBots,
          AllowConnectors: formData?.AllowConnectors,
        }),
      confirmText: 'Choose who can post and reply in this channel.',
      relatedQueryKeys: [channelKey],
    },
    {
      label: 'Archive channel',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Archive />,
      hideCondition: () => Boolean(channel?.isArchived) || isGeneral,
      customDataformatter: () => action('ArchiveChannel'),
      confirmText:
        'Archive this channel? People can still read it, but nobody can post until it is unarchived.',
      relatedQueryKeys: [channelKey],
    },
    {
      label: 'Unarchive channel',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Unarchive />,
      hideCondition: () => !channel?.isArchived,
      customDataformatter: () => action('UnarchiveChannel'),
      confirmText: 'Unarchive this channel so people can post again?',
      relatedQueryKeys: [channelKey],
    },
    {
      label: 'Delete channel',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Delete />,
      hideCondition: () => isGeneral,
      customDataformatter: () => action('DeleteChannel'),
      confirmText:
        'Delete this channel? Its conversations are deleted with it.',
      relatedQueryKeys: [`Team-${tenantFilter}-${teamId}`],
    },
  ]
  const actionsData = useMemo(
    () => (channel ? { ...channel, Tenant: tenantFilter } : undefined),
    [channel, tenantFilter]
  )

  const memberActions = [
    {
      label: 'Make owner',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.AdminPanelSettings />,
      multiPost: false,
      // Teams does not let a guest own a channel.
      condition: (row) => row.Role === 'Member',
      customDataformatter: (row) =>
        action('SetChannelMemberRole', { MembershipId: row.id, Role: 'Owner' }),
      confirmText: 'Make [displayName] an owner of this channel?',
      relatedQueryKeys: [membersKey],
    },
    {
      label: 'Make member',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Person />,
      multiPost: false,
      condition: (row) => row.Role === 'Owner',
      customDataformatter: (row) =>
        action('SetChannelMemberRole', {
          MembershipId: row.id,
          Role: 'Member',
        }),
      confirmText:
        'Make [displayName] a member instead of an owner of this channel?',
      relatedQueryKeys: [membersKey],
    },
    {
      label: 'Remove from channel',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.PersonRemove />,
      color: 'danger',
      customDataformatter: (row) =>
        Array.isArray(row)
          ? row.map((item) =>
              action('RemoveChannelMember', { MembershipId: item.id })
            )
          : action('RemoveChannelMember', { MembershipId: row.id }),
      confirmText: 'Remove [displayName] from this channel?',
      relatedQueryKeys: [membersKey],
    },
  ]

  const tabActions = [
    {
      label: 'Rename tab',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Edit />,
      multiPost: false,
      defaultvalues: (row) => ({ DisplayName: row.displayName }),
      fields: [
        {
          type: 'textField',
          name: 'DisplayName',
          label: 'Tab name',
          validators: { required: 'Enter a tab name' },
        },
      ],
      customDataformatter: (row, _action, formData) =>
        action('EditChannelTab', {
          TabId: row.id,
          DisplayName: formData?.DisplayName,
        }),
      confirmText: 'Rename the tab "[displayName]".',
      relatedQueryKeys: [tabsKey],
    },
    {
      label: 'Change address',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Link />,
      multiPost: false,
      condition: (row) => row.isWebsite,
      defaultvalues: (row) => ({ Url: row.Address }),
      fields: [
        {
          type: 'textField',
          name: 'Url',
          label: 'Address',
          validators: { required: 'Enter an address', validate: httpsOnly },
        },
      ],
      customDataformatter: (row, _action, formData) =>
        action('EditChannelTab', { TabId: row.id, Url: formData?.Url }),
      confirmText: 'Point the tab "[displayName]" at a new address.',
      relatedQueryKeys: [tabsKey],
    },
    {
      label: 'Remove tab',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Delete />,
      color: 'danger',
      customDataformatter: (row) =>
        Array.isArray(row)
          ? row.map((item) => action('RemoveChannelTab', { TabId: item.id }))
          : action('RemoveChannelTab', { TabId: row.id }),
      confirmText: 'Remove the tab "[displayName]" from this channel?',
      relatedQueryKeys: [tabsKey],
    },
  ]

  const moderation = channel?.moderationSettings
  const labelOf = (options, value) =>
    options.find((option) => option.value === value)?.label

  const title = !ready
    ? 'No channel selected'
    : channelRequest.isError
      ? 'Channel not found'
      : (channel?.displayName ?? 'Loading...')

  const subtitle = channel
    ? [
        {
          icon: <CippIcons.Groups />,
          text: `${CHANNEL_TYPES[channel.membershipType]} channel`,
        },
        ...(teamName
          ? [
              {
                icon: <CippIcons.Business />,
                text: (
                  <Button
                    color="muted"
                    style={{ paddingLeft: 0 }}
                    size="small"
                    href={`/identity/administration/groups/group/team?groupId=${teamId}&tenantFilter=${tenantFilter}`}
                  >
                    {teamName}
                  </Button>
                ),
              },
            ]
          : []),
        ...(channel.isArchived
          ? [{ icon: <CippIcons.Archive />, text: 'Archived' }]
          : []),
        {
          icon: <CippIcons.Launch />,
          text: (
            <Button
              color="muted"
              style={{ paddingLeft: 0 }}
              size="small"
              href={channel.webUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Open in Teams
            </Button>
          ),
        },
        ...(filesUrl
          ? [
              {
                icon: <CippIcons.Folder />,
                text: (
                  <Button
                    color="muted"
                    style={{ paddingLeft: 0 }}
                    size="small"
                    href={filesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in SharePoint
                  </Button>
                ),
              },
            ]
          : []),
      ]
    : []

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      titleControl={
        <CippEntitySwitcher
          title={title}
          currentId={channelId}
          queryParamKey="channelId"
          entityName="channel"
          api={{
            url: '/api/ListGraphRequest',
            data: {
              Endpoint: `teams/${teamId}/channels`,
              $select: 'id,displayName,membershipType',
              AsApp: true,
              tenantFilter,
            },
            queryKey: `ChannelSwitcher-${tenantFilter}-${teamId}`,
          }}
          getPrimary={(entry) => entry.displayName}
          getSecondary={(entry) => CHANNEL_TYPES[entry.membershipType]}
          sortByPrimary
        />
      }
      subtitle={subtitle}
      actions={channel ? headerActions : []}
      actionsData={actionsData}
      queryKeys={[channelKey]}
      backUrl={`/identity/administration/groups/group/channels?groupId=${teamId}`}
      isFetching={ready && channelRequest.isLoading}
    >
      <CippHead title={title} />
      {!ready && (
        <Alert severity="info" sx={{ m: 2 }}>
          No channel selected. Open a channel from a team&apos;s Channels tab.
        </Alert>
      )}
      {ready && channelRequest.isLoading && (
        <CippFormSkeleton layout={[2, 2]} />
      )}
      {channelRequest.isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Could not load this channel. It may have been deleted.
        </Alert>
      )}
      {channel && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <Stack spacing={2}>
                <CippPropertyListCard
                  title="Channel"
                  propertyItems={[
                    {
                      label: 'Type',
                      value: CHANNEL_TYPES[channel.membershipType],
                    },
                    {
                      label: 'Description',
                      value: channel.description || 'None',
                    },
                    {
                      label: 'Created',
                      value: channel.createdDateTime && (
                        <CippTimeAgo data={channel.createdDateTime} />
                      ),
                    },
                    {
                      label: 'Archived',
                      value: channel.isArchived ? 'Yes' : 'No',
                    },
                    ...(isGeneral
                      ? [
                          {
                            label: 'Editing',
                            value:
                              'Teams does not let apps rename or edit the General channel.',
                          },
                        ]
                      : []),
                  ]}
                  isFetching={channelRequest.isFetching}
                />
                {channel.membershipType === 'standard' && moderation && (
                  <CippPropertyListCard
                    title="Moderation"
                    propertyItems={[
                      {
                        label: 'Who can start a post',
                        value: labelOf(
                          NEW_MESSAGES,
                          moderation.userNewMessageRestriction
                        ),
                      },
                      {
                        label: 'Who can reply',
                        value: labelOf(REPLIES, moderation.replyRestriction),
                      },
                      {
                        label: 'Bots can post',
                        value: moderation.allowNewMessageFromBots
                          ? 'Yes'
                          : 'No',
                      },
                      {
                        label: 'Connectors can post',
                        value: moderation.allowNewMessageFromConnectors
                          ? 'Yes'
                          : 'No',
                      },
                    ]}
                    isFetching={channelRequest.isFetching}
                  />
                )}
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Stack spacing={2}>
                {hasMembers && (
                  <CippDataTable
                    title="Members"
                    data={members}
                    simpleColumns={['displayName', 'email', 'Role']}
                    actions={memberActions}
                    isFetching={membersRequest.isFetching}
                    refreshFunction={() => membersRequest.refetch()}
                    cardButton={
                      <Button
                        startIcon={<CippIcons.PersonAdd />}
                        onClick={membersDialog.handleOpen}
                        disabled={channel.isArchived}
                      >
                        Add members
                      </Button>
                    }
                  />
                )}
                <CippDataTable
                  title="Tabs"
                  data={tabs}
                  simpleColumns={['displayName', 'App', 'Address']}
                  cellRenderers={{
                    Address: (row) => renderUrlValue(row.Address),
                  }}
                  actions={tabActions}
                  isFetching={tabsRequest.isFetching}
                  refreshFunction={() => tabsRequest.refetch()}
                  cardButton={
                    <Button
                      startIcon={<CippIcons.Add />}
                      onClick={tabDialog.handleOpen}
                      disabled={channel.isArchived}
                    >
                      Add website tab
                    </Button>
                  }
                />
              </Stack>
            </Grid>
          </Grid>
        </Box>
      )}
      <CippApiDialog
        title="Add members"
        createDialog={membersDialog}
        row={{ Tenant: tenantFilter }}
        defaultvalues={{ Role: ROLES[0] }}
        fields={[
          channel?.membershipType === 'private'
            ? {
                type: 'autoComplete',
                name: 'Users',
                label: 'Team members',
                multiple: true,
                creatable: false,
                options: teamMemberOptions,
                validators: { required: 'Choose at least one person' },
              }
            : {
                type: 'autoComplete',
                name: 'Users',
                label: 'People in the organisation',
                multiple: true,
                creatable: false,
                validators: { required: 'Choose at least one person' },
                api: {
                  url: '/api/ListGraphRequest',
                  dataKey: 'Results',
                  labelField: (user) =>
                    `${user.displayName} (${user.userPrincipalName})`,
                  valueField: 'id',
                  queryKey: `ChannelMemberCandidates-${tenantFilter}`,
                  data: {
                    Endpoint: 'users',
                    tenantFilter,
                    $filter: "userType eq 'Member'",
                    $select: 'id,displayName,userPrincipalName',
                    $top: 999,
                  },
                },
              },
          {
            type: 'autoComplete',
            name: 'Role',
            label: 'Role',
            multiple: false,
            creatable: false,
            options: ROLES,
            validators: {
              required: 'Choose a role',
              validate: (role, values) =>
                role?.value !== 'Owner' ||
                !(values?.Users ?? []).some((user) =>
                  guestIds.has(user?.value)
                ) ||
                'Guests cannot be channel owners. Add them as members.',
              deps: ['Users'],
            },
          },
        ]}
        api={{
          type: 'POST',
          url: '/api/ExecTeamAction',
          customDataformatter: (_row, _action, formData) =>
            (formData?.Users ?? []).map((user) =>
              action('AddChannelMember', {
                UserId: user.value,
                Role: formData?.Role,
              })
            ),
          confirmText:
            channel?.membershipType === 'private'
              ? 'Add these people to the channel? Private channel members must already be in the team.'
              : 'Add these people to the shared channel?',
          relatedQueryKeys: [membersKey],
        }}
      />
      <CippApiDialog
        title="Add website tab"
        createDialog={tabDialog}
        row={{ Tenant: tenantFilter }}
        fields={[
          {
            type: 'textField',
            name: 'DisplayName',
            label: 'Tab name',
            validators: { required: 'Enter a tab name' },
          },
          {
            type: 'textField',
            name: 'Url',
            label: 'Address',
            helperText:
              'Any https address: an external site, or a SharePoint or OneDrive link to share files.',
            validators: { required: 'Enter an address', validate: httpsOnly },
          },
        ]}
        api={{
          type: 'POST',
          url: '/api/ExecTeamAction',
          customDataformatter: (_row, _action, formData) =>
            action('AddChannelTab', {
              DisplayName: formData?.DisplayName,
              Url: formData?.Url,
            }),
          confirmText: 'Add this website tab to the channel?',
          relatedQueryKeys: [tabsKey],
        }}
      />
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
