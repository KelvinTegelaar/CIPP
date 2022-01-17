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
import avatar0 from 'src/assets/images/avatars/0.jpg'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { ThemeSwitcher, UsageLocation } from 'src/components/utilities'

const CippProfile = () => {
  const { data: profile, isFetching, isLoading } = useLoadClientPrincipalQuery()

  return (
    <>
      <CRow xs={{ gutter: 3 }}>
        <CCol>
          <CCard>
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
        <CCol>
          <ThemeSwitcher />
        </CCol>
      </CRow>
      <br></br>
      <CRow>
        <CCol>
          <UsageLocation />
        </CCol>
      </CRow>
    </>
  )
}

export default CippProfile
