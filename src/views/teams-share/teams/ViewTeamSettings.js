import React, { useEffect, useState } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CListGroup,
  CListGroupItem,
  CRow,
  CSpinner,
} from '@coreui/react'
import PropTypes from 'prop-types'
import useQuery from '../../../hooks/useQuery'
import { useDispatch } from 'react-redux'
import { CippPage, ModalService } from '../../../components'
import { useListTeamSitesQuery } from 'src/store/api/sharepoint'
import { CippTable } from 'src/components/cipp'

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
    isSuccess,
  } = useListTeamSitesQuery({ tenantDomain, groupId })

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
    <CippPage tenantSelector={false} title="View group Information">
      <CCardBody>
        {groupFetching && <CSpinner />}
        {!groupFetching && groupError && <span>Error loading group</span>}
        {!queryError && !groupFetching && (
          <>
            <CRow>
              <CCol xl={4}>
                <CCard>
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Teams info
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      {isSuccess &&
                        group[0].TeamInfo.map((teamInfo) => (
                          <>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <>Display Name:</> <>{teamInfo.displayName}</>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <>Description:</> <>{teamInfo.description}</>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <>Archived:</> <>{teamInfo.isArchived ? 'Yes' : 'No'}</>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <>Creation Date:</> <>{teamInfo.createdDateTime}</>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <>Visibility:</> <>{teamInfo.visibility}</>
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <>Direct URL:</>
                              <>
                                <a href={teamInfo.displayName}>URL</a>
                              </>
                            </CListGroupItem>
                          </>
                        ))}
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol xl={4}>
                <CCard>
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Member Policies
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      {isSuccess && (
                        <>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Can edit and remove Apps: </>
                            <>
                              {group[0].TeamInfo[0].memberSettings.allowAddRemoveApps
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Can create private Channels: </>
                            <>
                              {group[0].TeamInfo[0].memberSettings.allowCreatePrivateChannels
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Can create and edit Channels: </>
                            <>
                              {group[0].TeamInfo[0].memberSettings.allowCreateUpdateChannels
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Can create and edit Connectors: </>
                            <>
                              {group[0].TeamInfo[0].memberSettings.allowCreateUpdateRemoveConnectors
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Can create and edit Tabs: </>
                            <>
                              {group[0].TeamInfo[0].memberSettings.allowCreateUpdateRemoveTab
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Can delete channels: </>
                            <>
                              {group[0].TeamInfo[0].memberSettings.allowDeleteChannels
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                        </>
                      )}
                    </CListGroup>
                  </CCardBody>
                </CCard>
                <br></br>
                <CCard>
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Guest Policies
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      {isSuccess && (
                        <>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Guests can create Channels : </>
                            <>
                              {group[0].TeamInfo[0].guestSettings.allowCreateUpdateChannels
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Guests can delete Channels : </>
                            <>
                              {group[0].TeamInfo[0].guestSettings.allowDeleteChannels
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                        </>
                      )}
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>
              <CCol xl={4}>
                <CCard>
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Messagging settings
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    <CListGroup flush>
                      {isSuccess && (
                        <>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Allow @Channel Mentions: </>
                            <>
                              {group[0].TeamInfo[0].guestSettings.allowChannelMentions
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Allow @Team mentions : </>
                            <>
                              {group[0].TeamInfo[0].guestSettings.allowTeamMentions ? 'Yes' : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Allow owners to delete messages: </>
                            <>
                              {group[0].TeamInfo[0].guestSettings.allowOwnerDeleteMessages
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Allow users to delete messages: </>
                            <>
                              {group[0].TeamInfo[0].guestSettings.allowUserDeleteMessages
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Allow users to edit messages: </>
                            <>
                              {group[0].TeamInfo[0].guestSettings.allowUserEditMessages
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Allow GIFs : </>
                            <>{group[0].TeamInfo[0].funSettings.allowGiphy ? 'Yes' : 'No'}</>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>Allow Stickers and Memes : </>
                            <>
                              {group[0].TeamInfo[0].funSettings.allowStickersAndMemes
                                ? 'Yes'
                                : 'No'}
                            </>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <>GIF Content Rating: </>
                            <>{group[0].TeamInfo[0].funSettings.giphyContentRating}</>
                          </CListGroupItem>
                        </>
                      )}
                    </CListGroup>
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            <br></br>
            <CRow>
              <CCol xl={8}>
                MEDIUM
                <br></br>
              </CCol>
              <CCol xl={8}>
                MEDIUM
                <br></br>
              </CCol>
            </CRow>
            <CRow>
              <CCol xl={8}>
                MEDIUM
                <br></br>
                <CCol xl={8}>
                  MEDIUM
                  <br></br>
                </CCol>
              </CCol>
            </CRow>
          </>
        )}
      </CCardBody>
    </CippPage>
  )
}

ViewTeamSettings.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewTeamSettings
