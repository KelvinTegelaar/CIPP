import React, { useEffect, useState } from 'react'
import { CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { CippMasonry, CippMasonryItem, CippPage } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { useListTeamSitesQuery } from 'src/store/api/sharepoint'
import TeamDetails from 'src/views/teams-share/teams/TeamDetails'
import TeamMemberPolicies from 'src/views/teams-share/teams/TeamMemberPolicies'
import TeamGuestPolicies from './TeamGuestPolicies'
import TeamMessagingSettings from './TeamMessagingSettings'
import TeamOwners from './TeamOwners'
import TeamMembers from './TeamMembers'
import TeamChannels from './TeamChannels'
import TeamApplications from './TeamApplications'

const ViewTeamSettings = (props) => {
  const dispatch = useDispatch()
  let query = useQuery()
  const groupId = query.get('groupId')
  const tenantDomain = query.get('tenantDomain')
  const [queryError, setQueryError] = useState(false)

  const {
    data: group = {},
    isFetching: groupFetching,
    error: groupError,
  } = useListTeamSitesQuery({ tenantDomain, groupId })

  const groupInfo = group[0]
  const teamInfo = groupInfo?.TeamInfo[0]
  const team = teamInfo
  const memberSettings = teamInfo?.memberSettings
  const guestSettings = teamInfo?.guestSettings
  const messagingSettings = teamInfo?.messagingSettings
  const funSettings = teamInfo?.funSettings
  const owners = groupInfo?.Owners
  const members = groupInfo?.Members
  const channelInfo = groupInfo?.ChannelInfo
  const installedApps = groupInfo?.InstalledApps

  useEffect(() => {
    if (!groupId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested group.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    }
  }, [tenantDomain, groupId, dispatch])

  return (
    <CippPage tenantSelector={false} title="View Group Information">
      {groupFetching && <CSpinner />}
      {!groupFetching && groupError && <span>Error loading group</span>}
      {!queryError && !groupFetching && (
        <CippMasonry>
          <CippMasonryItem size="single">
            <TeamDetails team={team} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <TeamMemberPolicies memberSettings={memberSettings} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <TeamGuestPolicies guestSettings={guestSettings} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <TeamMessagingSettings
              messagingSettings={messagingSettings}
              funSettings={funSettings}
            />
          </CippMasonryItem>
          <CippMasonryItem size="double">
            <TeamOwners data={owners} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <TeamMembers data={members} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <TeamChannels data={channelInfo} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <TeamApplications data={installedApps} />
          </CippMasonryItem>
        </CippMasonry>
      )}
    </CippPage>
  )
}

ViewTeamSettings.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewTeamSettings
