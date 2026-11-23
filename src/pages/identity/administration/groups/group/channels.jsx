import { useRouter } from 'next/router'
import NextLink from 'next/link'
import { Alert, Box, Button, Link } from '@mui/material'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { CippIcons } from '../../../../../utils/icon-registry'
import { useSettings } from '../../../../../hooks/use-settings'
import { useDialog } from '../../../../../hooks/use-dialog'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippApiDialog } from '../../../../../components/CippComponents/CippApiDialog'
import { CippDataTable } from '../../../../../components/CippTable/CippDataTable'
import {
  CippTeamSwitcher,
  getTeamSubtitle,
  teamQueryKey,
  useCippTeam,
} from '../../../../../components/CippComponents/CippTeamHeader'
import { getTeamHeaderActions } from '../../../../../components/CippComponents/CippTeamActions'
import tabOptions from './tabOptions'

const CHANNEL_TYPES = [
  { label: 'Standard (everyone in the team)', value: 'standard' },
  { label: 'Private (chosen team members)', value: 'private' },
  { label: 'Shared (chosen people)', value: 'shared' },
]

const Page = () => {
  const router = useRouter()
  const { groupId: teamId } = router.query
  const currentTenant = useSettings().currentTenant
  const tenantFilter = router.query.tenantFilter ?? currentTenant
  const channelDialog = useDialog()
  const { groupRequest, group, isTeam, teamRequest, teamData, team, channels } =
    useCippTeam(teamId, tenantFilter)
  const teamKey = teamQueryKey(tenantFilter, teamId)
  const title = !teamId
    ? 'No team selected'
    : (group?.displayName ?? 'Loading...')

  // Teams does not let a guest own a channel.
  const ownerOptions = [
    ...(teamData?.Owners ?? []),
    ...(teamData?.Members ?? []),
  ]
    .filter((member) => member.userId && !member.roles?.includes('guest'))
    .map((member) => ({
      label: member.email
        ? `${member.displayName} (${member.email})`
        : member.displayName,
      value: member.userId,
    }))

  const channelLink = `/identity/administration/groups/group/channel?groupId=${teamId}&channelId=[id]`
  const CHANNEL_TYPE_LABELS = {
    standard: 'Standard',
    private: 'Private',
    shared: 'Shared',
  }
  const channelRows = channels.map((channel) => ({
    id: channel.id,
    displayName: channel.displayName,
    Type: CHANNEL_TYPE_LABELS[channel.membershipType] ?? channel.membershipType,
    Members:
      channel.membershipType === 'standard'
        ? 'Everyone in the team'
        : (channel.memberCount ?? ''),
    Owners: channel.owners ?? '',
    Tabs: channel.tabCount ?? '',
    Archived: channel.isArchived ? 'Yes' : 'No',
    Description: channel.description ?? '',
  }))

  const channelActions = [
    {
      label: 'View channel',
      link: channelLink,
      icon: <CippIcons.EyeIcon />,
      multiPost: false,
    },
    {
      label: 'Delete channel',
      type: 'POST',
      url: '/api/ExecTeamAction',
      icon: <CippIcons.Delete />,
      color: 'danger',
      multiPost: false,
      condition: (row) => row.displayName !== 'General',
      customDataformatter: (row) => ({
        tenantFilter,
        TeamID: teamId,
        ChannelID: row.id,
        Action: 'DeleteChannel',
      }),
      confirmText:
        'Delete the channel "[displayName]"? Its conversations are deleted with it.',
      relatedQueryKeys: [teamKey],
    },
  ]

  return (
    <HeaderedTabbedLayout
      tabOptions={tabOptions}
      title={title}
      titleControl={
        <CippTeamSwitcher
          title={title}
          teamId={teamId}
          tenantFilter={tenantFilter}
        />
      }
      subtitle={getTeamSubtitle({ group, team })}
      actions={team ? getTeamHeaderActions({ team, teamId, tenantFilter }) : []}
      actionsData={team ? { ...team, Tenant: tenantFilter } : undefined}
      queryKeys={[teamKey]}
      isFetching={!!teamId && groupRequest.isLoading}
    >
      <CippHead title={title ? `${title} - Channels` : 'Channels'} />
      {(groupRequest.isLoading || (isTeam && teamRequest.isLoading)) && (
        <CippFormSkeleton layout={[1, 1]} />
      )}
      {groupRequest.isSuccess && !isTeam && (
        <Alert severity="info" sx={{ m: 2 }}>
          This group does not have a team.
        </Alert>
      )}
      {team && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <CippDataTable
            title="Channels"
            data={channelRows}
            simpleColumns={[
              'displayName',
              'Type',
              'Members',
              'Owners',
              'Tabs',
              'Archived',
              'Description',
            ]}
            rowOpen={{ link: channelLink }}
            cellRenderers={{
              displayName: (row) => (
                <Link
                  component={NextLink}
                  href={channelLink.replace('[id]', encodeURIComponent(row.id))}
                  underline="hover"
                >
                  {row.displayName}
                </Link>
              ),
            }}
            actions={channelActions}
            isFetching={teamRequest.isFetching}
            refreshFunction={() => teamRequest.refetch()}
            cardButton={
              <Button
                startIcon={<CippIcons.Add />}
                onClick={channelDialog.handleOpen}
                disabled={team.isArchived}
              >
                Add channel
              </Button>
            }
          />
        </Box>
      )}
      <CippApiDialog
        title="Add channel"
        createDialog={channelDialog}
        row={{ Tenant: tenantFilter }}
        defaultvalues={{ MembershipType: CHANNEL_TYPES[0] }}
        fields={[
          {
            type: 'textField',
            name: 'DisplayName',
            label: 'Channel name',
            validators: { required: 'Enter a channel name' },
          },
          { type: 'textField', name: 'Description', label: 'Description' },
          {
            type: 'autoComplete',
            name: 'MembershipType',
            label: 'Channel type',
            multiple: false,
            creatable: false,
            options: CHANNEL_TYPES,
            validators: { required: 'Choose a channel type' },
          },
          {
            type: 'autoComplete',
            name: 'OwnerId',
            label: 'Channel owner (private and shared channels)',
            multiple: false,
            creatable: false,
            options: ownerOptions,
            condition: {
              field: 'MembershipType',
              compareType: 'valueNotEq',
              compareValue: 'standard',
            },
          },
        ]}
        api={{
          type: 'POST',
          url: '/api/ExecTeamAction',
          data: { TeamID: `!${teamId}`, Action: '!CreateChannel' },
          confirmText:
            'Create this channel in the team? Add more people to a private or shared channel from its page afterwards.',
          relatedQueryKeys: [teamKey],
        }}
      />
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
