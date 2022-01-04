import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faUserFriends, faUsers } from '@fortawesome/free-solid-svg-icons'
import {
  CCard,
  CCardHeader,
  CCardBody,
  CCardText,
  CRow,
  CCol,
  CSpinner,
  CCardTitle,
  CButton,
} from '@coreui/react'
import { useLoadVersionsQuery } from 'src/store/api/app'
import StatusIcon from 'src/components/cipp/StatusIcon'

const Home = () => {
  const { data: versions, isLoading } = useLoadVersionsQuery()
  return (
    <div>
      <h3>Dashboard</h3>
      <CRow xs={{ cols: 1, gutter: 4 }} md={{ cols: 2 }}>
        <CCol xs>
          <CCard>
            <CCardHeader>
              <CCardTitle>Quick Create</CCardTitle>
            </CCardHeader>
            <CCardBody className="text-center">
              <CCardText>
                Ready to add a new user, group or team for any managed tenant? Click the buttons below to jump to the relevant wizard. 
              </CCardText>
              <CButton className="m-1" color="primary" href='/identity/administration/users/add'>
                <FontAwesomeIcon icon={faUser} className='pe-1' /> Add a User
              </CButton>
              <CButton className="m-1" color="primary" href='/identity/administration/groups/add'>
                <FontAwesomeIcon icon={faUserFriends} className='pe-1' /> Add a Group
              </CButton>
              <CButton className="m-1" color="primary" href='/teams-share/teams/add-team'>
                <FontAwesomeIcon icon={faUsers} className='pe-1' /> Add a Team
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs>
          <CCard className="mb-3" style={{ maxWidth: '18rem' }}>
            <CCardHeader>
              <CCardTitle>
                <StatusIcon type='negatedboolean' status={versions?.OutOfDateCIPP} />CIPP Version
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <p>
                Latest: {!isLoading ? versions.RemoteCIPPVersion : <CSpinner size="sm" />}
              </p>
              <p>
                Current: {!isLoading ? versions.LocalCIPPVersion : <CSpinner size="sm" />}
              </p>
              {!isLoading && !versions.OutOfDateCIPP ? (
                <p class="text-success">You're running the latest and greatest version of CIPP!</p>
              ) : (
                <p class="text-danger">Your CIPP version is out of date!</p>
              )}
            </CCardBody>
          </CCard>
          <CCard className="mb-3" style={{ maxWidth: '18rem' }}>
            <CCardHeader>
              <CCardTitle>
                <StatusIcon type='negatedboolean' status={versions?.OutOfDateCIPPAPI} />CIPP API Version
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <p>
                Latest: {!isLoading ? versions.RemoteCIPPAPIVersion : <CSpinner size="sm" />}
              </p>
              <p>
                Current: {!isLoading ? versions.LocalCIPPAPIVersion : <CSpinner size="sm" />}
              </p>
              {!isLoading && !versions.OutOfDateCIPPAPI ? (
                <p class="text-success">You're running the latest and greatest version of CIPP API!</p>
              ) : (
                <p class="text-danger">Your CIPP API version is out of date!</p>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Home
