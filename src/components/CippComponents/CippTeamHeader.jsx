import { Button } from '@mui/material'
import { CippIcons } from '../../utils/icon-registry'
import { ApiGetCall } from '../../api/ApiCall'
import { CippCopyToClipBoard } from './CippCopyToClipboard'
import { CippEntitySwitcher } from './CippEntitySwitcher'

// Shared by the group page's Team, Channels and channel pages.

export const TEAM_SETTING_GROUPS = [
  {
    title: 'Member permissions',
    section: 'memberSettings',
    settings: [
      ['allowCreateUpdateChannels', 'Create and update channels'],
      ['allowCreatePrivateChannels', 'Create private channels'],
      ['allowDeleteChannels', 'Delete channels'],
      ['allowAddRemoveApps', 'Add and remove apps'],
      ['allowCreateUpdateRemoveTabs', 'Manage tabs'],
      ['allowCreateUpdateRemoveConnectors', 'Manage connectors'],
    ],
  },
  {
    title: 'Guest permissions',
    section: 'guestSettings',
    settings: [
      ['allowCreateUpdateChannels', 'Create and update channels'],
      ['allowDeleteChannels', 'Delete channels'],
    ],
  },
  {
    title: 'Messaging',
    section: 'messagingSettings',
    settings: [
      ['allowUserEditMessages', 'Members can edit their messages'],
      ['allowUserDeleteMessages', 'Members can delete their messages'],
      ['allowOwnerDeleteMessages', 'Owners can delete any message'],
      ['allowTeamMentions', 'Team @mentions'],
      ['allowChannelMentions', 'Channel @mentions'],
    ],
  },
  {
    title: 'Fun',
    section: 'funSettings',
    settings: [
      ['allowGiphy', 'Giphy'],
      ['allowStickersAndMemes', 'Stickers and memes'],
      ['allowCustomMemes', 'Custom memes'],
    ],
  },
]

const first = (request) => {
  const results = request.data?.Results ?? request.data
  return Array.isArray(results) ? results[0] : results
}

export const teamQueryKey = (tenantFilter, teamId) =>
  `Team-${tenantFilter}-${teamId}`

export const useCippTeam = (teamId, tenantFilter) => {
  // Same request and query key as the group page, so moving between them reuses the cache
  const groupRequest = ApiGetCall({
    url: '/api/ListGraphRequest',
    data: { Endpoint: `groups/${teamId}`, tenantFilter },
    queryKey: `Group-${teamId}`,
    waiting: Boolean(teamId),
  })
  const group = first(groupRequest)
  const isTeam = group?.resourceProvisioningOptions?.includes('Team')
  const teamRequest = ApiGetCall({
    url: '/api/ListTeams',
    data: { type: 'Team', ID: teamId, tenantFilter },
    queryKey: teamQueryKey(tenantFilter, teamId),
    waiting: Boolean(teamId && isTeam),
  })
  const teamData = first(teamRequest)
  return {
    groupRequest,
    group,
    isTeam,
    teamRequest,
    teamData,
    team: teamData?.TeamInfo?.[0],
    channels: teamData?.ChannelInfo ?? [],
  }
}

export const CippTeamSwitcher = ({ title, teamId, tenantFilter }) => (
  <CippEntitySwitcher
    title={title}
    currentId={teamId}
    queryParamKey="groupId"
    entityName="team"
    api={{
      url: '/api/ListGraphRequest',
      data: {
        Endpoint: 'groups',
        tenantFilter,
        $filter: "resourceProvisioningOptions/Any(x:x eq 'Team')",
        $select: 'id,displayName,mail',
        $top: 999,
      },
      queryKey: `TeamSwitcher-${tenantFilter}`,
    }}
    getPrimary={(entry) => entry.displayName}
    getSecondary={(entry) => entry.mail}
    sortByPrimary
  />
)

export const getTeamSubtitle = ({ group, team }) =>
  group
    ? [
        {
          icon: <CippIcons.Mail />,
          text: (
            <CippCopyToClipBoard
              type="chip"
              text={group.mail || group.mailNickname || 'N/A'}
            />
          ),
        },
        ...(team?.isArchived
          ? [{ icon: <CippIcons.Archive />, text: 'Archived' }]
          : []),
        ...(team?.webUrl
          ? [
              {
                icon: <CippIcons.Launch />,
                text: (
                  <Button
                    color="muted"
                    style={{ paddingLeft: 0 }}
                    size="small"
                    href={team.webUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Open in Teams
                  </Button>
                ),
              },
            ]
          : []),
      ]
    : []
