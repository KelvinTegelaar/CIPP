import React from 'react'
import {
  CRow,
  CCol,
  CCard,
  CCardTitle,
  CCardBody,
  CListGroup,
  CListGroupItem,
  CSpinner,
} from '@coreui/react'
import { useLoadClientPrincipalQuery } from 'src/store/api/auth'
import { ThemeSwitcher, UsageLocation, PageSizeSwitcher } from 'src/components/utilities'
import ReportImage from './ReportImage'
import TenantListSelector from './TenantListSelector'

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
        <CCol>
          <PageSizeSwitcher />
        </CCol>
      </CRow>
      <CRow>
        <CCol>
          <TenantListSelector />
        </CCol>
      </CRow>
      <br></br>
      <CRow>
        <CCol>{!isLoading && <UsageLocation />}</CCol>
      </CRow>
      <br></br>
      <CRow>
        <CCol>{!isLoading && <ReportImage />}</CCol>
      </CRow>
    </>
  )
}

export default CippProfile
