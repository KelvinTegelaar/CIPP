import React from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardImage,
  CCardTitle,
  CCardBody,
  CListGroup,
  CListGroupItem,
  CSpinner,
} from '@coreui/react'
import avatar0 from './../../assets/images/avatars/0.jpg'
import { authApi } from '../../store/api/auth'
import ThemeSwitcher from 'src/components/cipp/ThemeSwitcher'

const ViewProfile = () => {
  const { data: profile, isLoading } = authApi.endpoints.loadClientPrincipal.useQueryState()

  return (
    <>
      <CRow xs={{ cols: 3 }} md={{ cols: 5 }} className="g-4">
        <CCol xs>
          <CCard className="w-100">
            {isLoading && <CSpinner />}
            {!isLoading && (
              <>
                <CCardImage orientation="top" src={avatar0} />
                <CCardBody>
                  <CCardTitle>{profile.clientPrincipal.userDetails}</CCardTitle>
                </CCardBody>
                <CListGroup flush>
                  <CListGroupItem>
                    Identity Provider: {profile.clientPrincipal.identityProvider}
                  </CListGroupItem>
                  <CListGroupItem>User ID: {profile.clientPrincipal.userId}</CListGroupItem>
                  <CListGroupItem>
                    Roles ({profile.clientPrincipal.userRoles.length})
                    <ul>
                      {profile.clientPrincipal.userRoles.map((r, index) => (
                        <li key={index}>{r}</li>
                      ))}
                    </ul>
                  </CListGroupItem>
                </CListGroup>
              </>
            )}
          </CCard>
        </CCol>
        <CCol xs>
          <CCard className="w-50">
            <ThemeSwitcher />
          </CCard>
        </CCol>
        <CCol xs>
          <CCard className="w-50">
            <ThemeSwitcher />
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default ViewProfile
