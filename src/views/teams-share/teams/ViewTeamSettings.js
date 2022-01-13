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

  const ownerAndUserColumns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
    },
    {
      name: 'Mail',
      selector: (row) => row['mail'],
    },
  ]

  const detailColumns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
    },
    {
      name: 'Description',
      selector: (row) => row['description'],
    },
    {
      name: 'Created at',
      selector: (row) => row['createdDateTime'],
    },
    {
      name: 'Favorite by default',
      selector: (row) => row['isFavoriteByDefault'],
    },
    {
      name: 'Channel URL',
      selector: (row) => `<a href=${row['isFavoriteByDefault']}>URL</a>`,
    },
    {
      name: 'Email',
      selector: (row) => row['email'],
    },
  ]

  const appColumns = [
    {
      name: 'Display Name',
      selector: (row) => row.teamsAppDefinition['displayName'],
    },
    {
      name: 'Description',
      selector: (row) => row.teamsAppDefinition['description'],
    },
    {
      name: 'Version',
      selector: (row) => row.teamsAppDefinition['version'],
    },
    {
      name: 'Created by',
      selector: (row) => row.teamsAppDefinition['createdBy'],
    },
  ]

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
                              <h7>Display Name:</h7> {teamInfo.displayName}
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <h7>Description:</h7> {teamInfo.description}
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <h7>Archived:</h7> {teamInfo.isArchived ? 'Yes' : 'No'}
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <h7>Creation Date:</h7> {teamInfo.createdDateTime}
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <h7>Visibility:</h7> {teamInfo.visibility}
                            </CListGroupItem>
                            <CListGroupItem className="d-flex justify-content-between align-items-center">
                              <h7>Direct URL:</h7>
                              <a href={teamInfo.webUrl}>URL</a>
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
                            <h7>Can edit and remove Apps: </h7>
                            {group[0].TeamInfo[0].memberSettings.allowAddRemoveApps ? 'Yes' : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Can create private Channels: </h7>
                            {group[0].TeamInfo[0].memberSettings.allowCreatePrivateChannels
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Can create and edit Channels: </h7>
                            {group[0].TeamInfo[0].memberSettings.allowCreateUpdateChannels
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Can create and edit Connectors: </h7>
                            {group[0].TeamInfo[0].memberSettings.allowCreateUpdateRemoveConnectors
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Can create and edit Tabs: </h7>
                            {group[0].TeamInfo[0].memberSettings.allowCreateUpdateRemoveTab
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Can delete channels: </h7>
                            {group[0].TeamInfo[0].memberSettings.allowDeleteChannels ? 'Yes' : 'No'}
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
                            <h7>Guests can create Channels : </h7>
                            {group[0].TeamInfo[0].guestSettings.allowCreateUpdateChannels
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Guests can delete Channels : </h7>
                            {group[0].TeamInfo[0].guestSettings.allowDeleteChannels ? 'Yes' : 'No'}
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
                            <h7>Allow @Channel Mentions: </h7>
                            {group[0].TeamInfo[0].messagingSettings.allowChannelMentions
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Allow @Team mentions : </h7>
                            {group[0].TeamInfo[0].messagingSettings.allowTeamMentions
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Allow owners to delete messages: </h7>
                            {group[0].TeamInfo[0].messagingSettings.allowOwnerDeleteMessages
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Allow users to delete messages: </h7>
                            {group[0].TeamInfo[0].messagingSettings.allowUserDeleteMessages
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Allow users to edit messages: </h7>
                            {group[0].TeamInfo[0].messagingSettings.allowUserEditMessages
                              ? 'Yes'
                              : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Allow GIFs : </h7>
                            <>{group[0].TeamInfo[0].funSettings.allowGiphy ? 'Yes' : 'No'}</>
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>Allow Stickers and Memes : </h7>
                            {group[0].TeamInfo[0].funSettings.allowStickersAndMemes ? 'Yes' : 'No'}
                          </CListGroupItem>
                          <CListGroupItem className="d-flex justify-content-between align-items-center">
                            <h7>GIF Content Rating: </h7>
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
              <CCol xl={6}>
                <CCard className="h-100">
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Team Owners
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    {isSuccess && (
                      <CippTable
                        keyField="ID"
                        columns={ownerAndUserColumns}
                        data={group[0].Owners}
                        striped
                        responsive={true}
                        tableProps={{ subHeaderComponent: false, pagination: false }}
                        wrapperClasses="table-responsive"
                        reportName="none"
                      />
                    )}
                  </CCardBody>
                </CCard>
                <br></br>
              </CCol>
              <CCol xl={6}>
                <CCard className="h-100">
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Team Members
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    {isSuccess && (
                      <CippTable
                        keyField="ID"
                        columns={ownerAndUserColumns}
                        data={group[0].Members}
                        striped
                        responsive={true}
                        tableProps={{ subHeaderComponent: false, pagination: false }}
                        wrapperClasses="table-responsive"
                        reportName="none"
                      />
                    )}
                  </CCardBody>
                </CCard>
                <br></br>
              </CCol>
            </CRow>
            <CRow>
              <br></br>
              <CCol xl={6}>
                <CCard>
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Channels
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    {isSuccess && (
                      <CippTable
                        keyField="ID"
                        columns={detailColumns}
                        data={group[0].ChannelInfo}
                        striped
                        responsive={true}
                        tableProps={{ subHeaderComponent: false, pagination: false }}
                        wrapperClasses="table-responsive"
                        reportName="none"
                      />
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
              <br></br>
              <CCol xl={6}>
                <CCard>
                  <CCardHeader>
                    <CCardTitle className="text-primary d-flex justify-content-between">
                      Installed Applications
                    </CCardTitle>
                  </CCardHeader>
                  <CCardBody>
                    {isSuccess && (
                      <CippTable
                        keyField="ID"
                        columns={appColumns}
                        data={group[0].InstalledApps}
                        striped
                        responsive={true}
                        tableProps={{ subHeaderComponent: false, pagination: false }}
                        wrapperClasses="table-responsive"
                        reportName="none"
                      />
                    )}
                  </CCardBody>
                </CCard>
                <br></br>
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
