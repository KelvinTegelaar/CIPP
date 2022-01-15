import React, { useEffect, useState } from 'react'
import { CContainer, CCol, CRow, CSpinner } from '@coreui/react'
import PropTypes from 'prop-types'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { CippPage } from 'src/components/layout/CippPage'
import { ModalService } from 'src/components/utilities/ModalRoot'
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
import { useListUserQuery } from 'src/store/api/users'

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
  }, [tenantDomain, userId, dispatch])

  return (
    <CippPage tenantSelector={false} title="View User Information">
      {userFetching && <CSpinner />}
      {!userFetching && userError && <span>Error loading user</span>}
      {!queryError && !userFetching && (
        <CContainer fluid={true}>
          <CRow xl={{ cols: 3 }} lg={{ cols: 2 }} xs={{ cols: 1, gutter: 4 }}>
            <CCol xl={5} lg={6} xs>
              <UserDetails tenantDomain={tenantDomain} userId={userId} />
            </CCol>
            <CCol xl={4} lg={6} xs>
              <UserLastLoginDetails tenantDomain={tenantDomain} userId={userId} className="mb-4" />
              <UserCAPs tenantDomain={tenantDomain} userId={userId} />
            </CCol>
            <CCol xl={3} lg={12} xs>
              <UserActions tenantDomain={tenantDomain} userId={userId} className="mb-4" />
              <User365Management tenantDomain={tenantDomain} userId={userId} />
            </CCol>
            <CCol xs>
              <UserOneDriveUsage userUPN={user.userPrincipalName} tenantDomain={tenantDomain} />
            </CCol>
            <CCol xs>
              <UserEmailDetails user={user} error={userError} isFetching={userFetching} />
            </CCol>
            <CCol xs>
              <UserEmailUsage userId={userId} tenantDomain={tenantDomain} />
            </CCol>
            <CCol xs>
              <UserEmailPermissions userId={userId} tenantDomain={tenantDomain} />
            </CCol>
            <CCol xs>
              <UserEmailSettings userId={userId} tenantDomain={tenantDomain} />
            </CCol>
          </CRow>
          <CRow xs={{ cols: 1, gutter: 4 }}>
            <CCol xs>
              <UserDevices userId={userId} tenantDomain={tenantDomain} />
              <UserGroups userId={userId} tenantDomain={tenantDomain} />
              <UserSigninLogs userId={userId} tenantDomain={tenantDomain} />
            </CCol>
          </CRow>
        </CContainer>
      )}
    </CippPage>
  )
}

ViewUser.propTypes = {
  params: PropTypes.object,
  location: PropTypes.object,
}

export default ViewUser
