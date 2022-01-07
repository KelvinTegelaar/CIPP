import React, { useEffect, useState } from 'react'
import { CCard, CCardBody, CCardHeader, CCardTitle, CCol, CRow, CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
import useQuery from '../../../hooks/useQuery'
import { useDispatch } from 'react-redux'
import { ModalService } from '../../../components'
import UserDevices from './UserDevices'
import UserDetails from './UserDetails'
import UserLastLoginDetails from './UserLastLoginDetails'
import UserCAPs from './UserCAPs'
import UserActions from './UserActions'
import UserOneDriveUsage from './UserOneDriveUsage'
import User365Management from './User365Management'
import UserEmailDetails from './UserEmailDetails'
import UserEmailUsage from './UserEmailUsage'
import UserEmailSettings from './UserEmailSettings'
import UserEmailPermissions from './UserEmailPermissions'
import UserGroups from './UserGroups'
import UserSigninLogs from './UserSigninLogs'
import { useListUserQuery } from '../../../store/api/users'

const ViewUser = (props) => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const [queryError, setQueryError] = useState(false)

  const {
    data: user = {},
    isFetching: userFetching,
    error: userError,
  } = useListUserQuery({ tenantDomain, userId })

  useEffect(() => {
    if (!userId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested user.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    }
    // unload this component's state when the component will unmount
    // return () => dispatch(unloadViewUser())
  }, [tenantDomain, userId, dispatch])

  return (
    <CCard className="page-card">
      <CCardHeader>
        <CCardTitle className="text-primary">View User Information</CCardTitle>
      </CCardHeader>
      <CCardBody>
        <br />
        {userFetching && <CSpinner />}
        {!userFetching && userError && <span>Error loading user</span>}
        {!queryError && !userFetching && (
          <>
            <CRow>
              <CCol xl={4}>
                <UserDetails tenantDomain={tenantDomain} userId={userId} />
              </CCol>
              <CCol xl={4}>
                <UserLastLoginDetails
                  tenantDomain={tenantDomain}
                  userId={userId}
                  style={{ paddingBottom: '24px' }}
                />
                <br></br>
                <UserCAPs tenantDomain={tenantDomain} userId={userId} />
              </CCol>
              <CCol xl={4}>
                <UserActions tenantDomain={tenantDomain} userId={userId} />
                <br></br>
                <User365Management tenantDomain={tenantDomain} userId={userId} />
                <br></br>
                <UserOneDriveUsage userUPN={user.userPrincipalName} tenantDomain={tenantDomain} />
              </CCol>
            </CRow>
            <br></br>
            <CRow>
              <CCol xl={4}>
                <UserEmailDetails user={user} error={userError} isFetching={userFetching} />
              </CCol>
              <CCol xl={4}>
                <UserEmailUsage userId={userId} tenantDomain={tenantDomain} />
                <br></br>
                <UserEmailPermissions userId={userId} tenantDomain={tenantDomain} />
              </CCol>
              <CCol xl={4}>
                <UserEmailSettings userId={userId} tenantDomain={tenantDomain} />
              </CCol>
            </CRow>
            <br></br>
            <CRow>
              <CCol xl={12}>
                <UserDevices userId={userId} tenantDomain={tenantDomain} />
                <br></br>
              </CCol>
            </CRow>
            <CRow>
              <CCol xl={12}>
                <UserGroups userId={userId} tenantDomain={tenantDomain} />
                <br></br>
              </CCol>
            </CRow>
            <CRow>
              <CCol xl={12}>
                <UserSigninLogs userId={userId} tenantDomain={tenantDomain} />
                <br></br>
              </CCol>
            </CRow>
          </>
        )}
      </CCardBody>
    </CCard>
  )
}

ViewUser.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewUser
