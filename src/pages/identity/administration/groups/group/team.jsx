import { useRouter } from 'next/router'
import { Alert, Box } from '@mui/material'
import { Grid } from '@mui/system'
import { Layout as DashboardLayout } from '../../../../../layouts/index'
import { HeaderedTabbedLayout } from '../../../../../layouts/HeaderedTabbedLayout'
import { useSettings } from '../../../../../hooks/use-settings'
import CippFormSkeleton from '../../../../../components/CippFormPages/CippFormSkeleton'
import { CippHead } from '../../../../../components/CippComponents/CippHead'
import { CippPropertyListCard } from '../../../../../components/CippCards/CippPropertyListCard'
import {
  CippTeamSwitcher,
  TEAM_SETTING_GROUPS,
  getTeamSubtitle,
  teamQueryKey,
  useCippTeam,
} from '../../../../../components/CippComponents/CippTeamHeader'
import { getTeamHeaderActions } from '../../../../../components/CippComponents/CippTeamActions'
import tabOptions from './tabOptions'

const Page = () => {
  const router = useRouter()
  const { groupId: teamId } = router.query
  const currentTenant = useSettings().currentTenant
  const tenantFilter = router.query.tenantFilter ?? currentTenant
  const { groupRequest, group, isTeam, teamRequest, teamData, team, channels } =
    useCippTeam(teamId, tenantFilter)
  const teamKey = teamQueryKey(tenantFilter, teamId)

  const title = !teamId
    ? 'No team selected'
    : (group?.displayName ?? 'Loading...')
  const owners = teamData?.Owners ?? []
  const others = teamData?.Members ?? []
  const guests = others.filter((member) => member.roles?.includes('guest'))
  const countOf = (type) =>
    channels.filter((channel) => channel.membershipType === type).length

  const summaryItems = [
    { label: 'Visibility', value: group?.visibility ?? 'Unknown' },
    { label: 'Description', value: group?.description || 'None' },
    {
      label: 'Owners',
      value: owners.length
        ? owners.map((owner) => owner.displayName).join(', ')
        : 'None',
    },
    { label: 'Members', value: `${others.length - guests.length}` },
    { label: 'Guests', value: `${guests.length}` },
    {
      label: 'Channels',
      value: `${countOf('standard')} standard, ${countOf('private')} private, ${countOf('shared')} shared`,
    },
    { label: 'Archived', value: team?.isArchived ? 'Yes' : 'No' },
  ]

  const settingItems = (section, settings) => [
    ...settings.map(([name, label]) => ({
      label,
      value: team?.[section]?.[name] ? 'Allowed' : 'Not allowed',
    })),
    ...(section === 'funSettings'
      ? [
          {
            label: 'Giphy content rating',
            value:
              team?.funSettings?.giphyContentRating === 'strict'
                ? 'Strict'
                : 'Moderate',
          },
        ]
      : []),
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
      <CippHead title={title ? `${title} - Team` : 'Team'} />
      {(groupRequest.isLoading || (isTeam && teamRequest.isLoading)) && (
        <CippFormSkeleton layout={[2, 2]} />
      )}
      {groupRequest.isSuccess && !isTeam && (
        <Alert severity="info" sx={{ m: 2 }}>
          This group does not have a team. Use Create Team from Group on the
          group&apos;s page to add one.
        </Alert>
      )}
      {teamRequest.isError && (
        <Alert severity="error" sx={{ m: 2 }}>
          Could not load the team. Microsoft Teams may still be setting it up;
          try again in a few minutes.
        </Alert>
      )}
      {team && (
        <Box sx={{ flexGrow: 1, py: 4 }}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, md: 4 }}>
              <CippPropertyListCard
                title="Team"
                propertyItems={summaryItems}
                isFetching={teamRequest.isFetching}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 8 }}>
              <Grid container spacing={2}>
                {TEAM_SETTING_GROUPS.map(
                  ({ title: groupTitle, section, settings }) => (
                    <Grid key={section} size={{ xs: 12, lg: 6 }}>
                      <CippPropertyListCard
                        title={groupTitle}
                        propertyItems={settingItems(section, settings)}
                        isFetching={teamRequest.isFetching}
                      />
                    </Grid>
                  )
                )}
              </Grid>
            </Grid>
          </Grid>
        </Box>
      )}
    </HeaderedTabbedLayout>
  )
}

Page.getLayout = (page) => (
  <DashboardLayout usesTenant={false}>{page}</DashboardLayout>
)

export default Page
