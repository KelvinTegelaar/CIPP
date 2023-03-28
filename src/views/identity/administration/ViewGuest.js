import React, { useEffect, useState } from 'react'
import { CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { CippPage } from 'src/components/layout'
import { CippMasonry, CippMasonryItem } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import UserDevices from 'src/views/identity/administration/UserDevices'
import GuestDetails from 'src/views/identity/administration/GuestDetails'
import GuestLastLoginDetails from 'src/views/identity/administration/GuestLastLoginDetails'
import UserCAPs from 'src/views/identity/administration/UserCAPs'
import UserActions from 'src/views/identity/administration/UserActions'
import User365Management from 'src/views/identity/administration/User365Management'
import UserGroups from 'src/views/identity/administration/UserGroups'
import UserSigninLogs from 'src/views/identity/administration/UserSigninLogs'
import { useListGuestQuery } from 'src/store/api/users'

const ViewGuest = (props) => {
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
  } = useListGuestQuery({ tenantDomain, userId })

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
            <GuestDetails tenantDomain={tenantDomain} userId={userId} />
          </CippMasonryItem>
          <CippMasonryItem size="single">
            <GuestLastLoginDetails tenantDomain={tenantDomain} userId={userId} />
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
          <CippMasonryItem size="triple">
            <UserDevices userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <UserGroups userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
          <CippMasonryItem size="triple">
            <UserSigninLogs userId={userId} tenantDomain={tenantDomain} />
          </CippMasonryItem>
        </CippMasonry>
      )}
    </CippPage>
  )
}

ViewGuest.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewGuest
