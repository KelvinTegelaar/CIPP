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
  CCardHeader,
} from '@coreui/react'
import avatar0 from './../../assets/images/avatars/0.jpg'
import { useLoadClientPrincipalQuery } from '../../store/api/auth'
import ThemeSwitcher from 'src/components/cipp/ThemeSwitcher'

const ViewProfile = () => {
  const { data: profile, isFetching, isLoading } = useLoadClientPrincipalQuery()

  return (
    <>
      <CRow>
        <CCol className="col-3">
          <CCard>
            <CCardHeader>Profile</CCardHeader>
            {(isFetching || isLoading) && <CSpinner />}
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
        <CCol className="col-3">
          <ThemeSwitcher />
        </CCol>
      </CRow>
    </>
  )
}

export default ViewProfile
