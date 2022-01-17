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
import { StatusIcon } from 'src/components/utilities'
import { Link } from 'react-router-dom'

const Home = () => {
  const { data: versions, isLoading, isSuccess } = useLoadVersionsQuery()
  return (
    <div>
      <h3>Dashboard</h3>
      <CRow>
        <CCol xs={'auto'}>
          <CCard>
            <CCardHeader>
              <CCardTitle>Quick Create</CCardTitle>
            </CCardHeader>
            <CCardBody className="text-center">
              <CCardText>
                Ready to add a new user, group or team for any managed tenant? Click the buttons
                below to jump to the relevant wizard.
              </CCardText>
              <Link to="/identity/administration/users/add">
                <CButton className="m-1" color="primary">
                  <FontAwesomeIcon icon={faUser} className="pe-1" /> Add a User
                </CButton>
              </Link>
              <Link to="/identity/administration/groups/add">
                <CButton className="m-1" color="primary">
                  <FontAwesomeIcon icon={faUserFriends} className="pe-1" /> Add a Group
                </CButton>
              </Link>
              <Link to="/teams-share/teams/add-team">
                <CButton className="m-1" color="primary">
                  <FontAwesomeIcon icon={faUsers} className="pe-1" /> Add a Team
                </CButton>
              </Link>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol xs={'auto'}>
          <CCard className="mb-3" style={{ maxWidth: '18rem' }}>
            <CCardHeader>
              <CCardTitle>
                <StatusIcon type="negatedboolean" status={versions?.OutOfDateCIPP} />
                CIPP Version
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <div>Latest: {!isLoading ? versions.RemoteCIPPVersion : <CSpinner size="sm" />}</div>
              <div>Current: {!isLoading ? versions.LocalCIPPVersion : <CSpinner size="sm" />}</div>
              {isSuccess &&
                (!versions.OutOfDateCIPP ? (
                  <p className="text-success">
                    You&apos;re running the latest and greatest version of CIPP!
                  </p>
                ) : (
                  <p className="text-danger">Your CIPP version is out of date!</p>
                ))}
            </CCardBody>
          </CCard>
          <CCard className="mb-3" style={{ maxWidth: '18rem' }}>
            <CCardHeader>
              <CCardTitle>
                <StatusIcon type="negatedboolean" status={versions?.OutOfDateCIPPAPI} />
                CIPP API Version
              </CCardTitle>
            </CCardHeader>
            <CCardBody>
              <div>
                Latest: {!isLoading ? versions?.RemoteCIPPAPIVersion : <CSpinner size="sm" />}
              </div>
              <div>
                Current: {!isLoading ? versions?.LocalCIPPAPIVersion : <CSpinner size="sm" />}
              </div>
              {isSuccess &&
                (!versions.OutOfDateCIPPAPI ? (
                  <p className="text-success">
                    You&apos;re running the latest and greatest version of CIPP API!
                  </p>
                ) : (
                  <p className="text-danger">Your CIPP API version is out of date!</p>
                ))}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Home
