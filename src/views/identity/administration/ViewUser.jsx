import React, { useEffect, useState } from 'react'
import { CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { CippPage, CippMasonry, CippMasonryItem } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import UserDevices from 'src/views/identity/administration/UserDevices'
import UserDetails from 'src/views/identity/administration/UserDetails'
import UserLastLoginDetails from 'src/views/identity/administration/UserLastLoginDetails'
import UserCAPs from 'src/views/identity/administration/UserCAPs'
import UserActions from 'src/views/identity/administration/UserActions'
import UserOneDriveUsage from 'src/views/identity/administration/UserOneDriveUsage'
import User365Management from 'src/views/identity/administration/User365Management'
import UserEmailDetails from 'src/views/identity/administration/UserEmailDetails'
import UserEmailUsage from 'src/views/identity/administration/UserEmailUsage'
import UserEmailSettings from 'src/views/identity/administration/UserEmailSettings'
import UserEmailPermissions from 'src/views/identity/administration/UserEmailPermissions'
import UserGroups from 'src/views/identity/administration/UserGroups'
import UserSigninLogs from 'src/views/identity/administration/UserSigninLogs'
import UserMailboxRuleList from 'src/views/identity/administration/UserMailboxRuleList'
import { useListUserQuery } from 'src/store/api/users'

const ViewUser = (props) => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const userEmail = query.get('userEmail')
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
  }, [tenantDomain, userId, dispatch])

  return (
    <CippPage tenantSelector={false} title="View User Information">
      {userFetching && <CSpinner />}
      {!userFetching && userError && <span>Error loading user</span>}
      {!queryError && !userFetching && (
        <CippMasonry>
          <CippMasonryItem size="double">
            <UserDetails tenantDomain={tenantDomain} userId={userId} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserLastLoginDetails tenantDomain={tenantDomain} userId={userId} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserCAPs tenantDomain={tenantDomain} userId={userId} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserActions tenantDomain={tenantDomain} userId={userId} userEmail={userEmail} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <User365Management tenantDomain={tenantDomain} userId={userId} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserOneDriveUsage userUPN={user.userPrincipalName} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserEmailDetails user={user} error={userError} isFetching={userFetching} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserEmailUsage userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserEmailPermissions userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <UserEmailSettings userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <UserDevices userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <UserGroups userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <UserSigninLogs userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <UserMailboxRuleList userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
        </CippMasonry>
      )}
    </CippPage>
  )
}

ViewUser.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewUser
