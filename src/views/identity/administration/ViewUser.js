import React, { useEffect, useState } from 'react'
import { CCard, CCol, CRow } from '@coreui/react'
import PropTypes from 'prop-types'

import useQuery from '../../../hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
import { setModalContent, showModal } from '../../../store/modules/modal'
import {
  listUser,
  listUserConditionalAccessPolicies,
  unloadViewUser,
} from '../../../store/modules/users'
import { listUserMailboxDetails } from '../../../store/modules/mailbox'
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

const ViewUser = (props) => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const users = useSelector((state) => state.users) || {}
  const mailbox = useSelector((state) => state.mailbox) || {}

  const { user = {}, loading: userLoading = false, loaded: userLoaded, error: userError } = users
  const {
    details: { loaded: mailboxLoaded = false },
  } = mailbox
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
              <UserDetails user={users.user} />
            </CCol>
            <CCol xl={4}>
              <UserLastLoginDetails user={users.user} style={{ paddingBottom: '24px' }} />
              <UserCAPs cap={users.userCAPs} />
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
              <UserEmailDetails user={users.user} />
            </CCol>
            <CCol xl={4}>
              {mailboxLoaded && (
                <>
                  <UserEmailUsage mailbox={mailbox.details} />
                  <UserEmailPermissions mailbox={mailbox.details} />
                </>
              )}
            </CCol>
            <CCol xl={4}>{mailboxLoaded && <UserEmailSettings mailbox={mailbox.details} />}</CCol>
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
      {userError && <span>Error loading user</span>}
    </CCard>
  )
}

ViewUser.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewUser
