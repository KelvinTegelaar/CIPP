import React, { useEffect, useState } from 'react'
import CIcon from '@coreui/icons-react'
import { cilClock, cilCog, cilContact, cilFolder } from '@coreui/icons'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'

import useQuery from '../../../hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
import { setModalContent, showModal } from '../../../store/modules/modal'
import {
  listOneDriveUsage,
  listUser,
  listUserConditionalAccessPolicies,
  listUserMailboxDetails,
  unloadViewUser,
} from '../../../store/modules/identity'
import UserDevices from './UserDevices'
import UserDetails from './UserDetails'
import UserLastLoginDetails from './UserLastLoginDetails'
import UserCAPs from './UserCAPs'
import UserActions from './UserActions'
import OneDriveList from '../../teams-share/onedrive/OneDriveList'
import UserOneDriveUsage from './UserOneDriveUsage'
import User365Management from './User365Management'
import UserEmailDetails from './UserEmailDetails'
import UserEmailUsage from './UserEmailUsage'
import UserEmailSettings from './UserEmailSettings'
import UserEmailPermissions from './UserEmailPermissions'
import UserGroups from './UserGroups'
import UserSigninLogs from './UserSigninLogs'

const ViewUser = (props) => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const identity = useSelector((store) => store.identity)

  const {
    user = {},
    loading: userLoading = false,
    loaded: userLoaded,
    error: userError,
  } = identity.user

  const [queryError, setQueryError] = useState(false)

  useEffect(() => {
    if (!userId || !tenantDomain) {
      dispatch(
        setModalContent({
          body: 'Error invalid request, could not load requested user.',
          title: 'Invalid Request',
        }),
      )
      dispatch(showModal())
      setQueryError(true)
    } else {
      dispatch(listUser({ tenantDomain, userId }))
      dispatch(listUserConditionalAccessPolicies({ tenantDomain, userId }))
      dispatch(listUserMailboxDetails({ tenantDomain, userId }))
    }
    // unload this component's state when the component will unmount
    return () => dispatch(unloadViewUser())
  }, [])

  return (
    <CCard className="bg-white rounded p-5">
      {!queryError && (
        <>
          <CRow>
            <CCol xl={4}>
              <UserDetails user={identity.user} />
            </CCol>
            <CCol xl={4}>
              <UserLastLoginDetails user={identity.user} style={{ paddingBottom: '24px' }} />
              <UserCAPs cap={identity.cap} />
            </CCol>
            <CCol xl={4}>
              <UserActions
                displayName={user.displayName}
                tenantDomain={tenantDomain}
                userId={userId}
                userEmail={user.mail}
              />
              <User365Management tenantDomain={tenantDomain} userId={userId} />
              {/* we need the UPN before we can load OneDrive */}
              {!userLoading && userLoaded && (
                <UserOneDriveUsage userUPN={user.userPrincipalName} tenantDomain={tenantDomain} />
              )}
            </CCol>
          </CRow>

          <CRow>
            <CCol xl={4}>
              <UserEmailDetails user={identity.user} />
            </CCol>
            <CCol xl={4}>
              {identity.mailbox && identity.mailbox.loaded && (
                <>
                  <UserEmailUsage mailbox={identity.mailbox} />
                  <UserEmailPermissions mailbox={identity.mailbox} />
                </>
              )}
            </CCol>
            <CCol xl={4}>
              {identity.mailbox && identity.mailbox.loaded && (
                <UserEmailSettings mailbox={identity.mailbox} />
              )}
            </CCol>
          </CRow>

          <CRow>
            <CCol xl={12}>
              <UserDevices userId={userId} tenantDomain={tenantDomain} />
            </CCol>
          </CRow>
          <CRow>
            <CCol xl={12}>
              <UserGroups userId={userId} tenantDomain={tenantDomain} />
            </CCol>
          </CRow>
          <CRow>
            <CCol xl={12}>
              <UserSigninLogs userId={userId} tenantDomain={tenantDomain} />
            </CCol>
          </CRow>
        </>
      )}
    </CCard>
  )
}

ViewUser.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewUser
