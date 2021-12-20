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
  CButton,
  CButtonGroup,
} from '@coreui/react'
import avatar0 from './../../assets/images/avatars/0.jpg'
import { useLoadClientPrincipalQuery } from '../../store/api/auth'
import ThemeSwitcher from 'src/components/cipp/ThemeSwitcher'

const ViewProfile = () => {
  const { data: profile, isFetching, isLoading } = useLoadClientPrincipalQuery()

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
          <br></br>
          <CCard style={{ width: '18rem' }} className="p-2">
            <CCardBody>
              <CCardTitle>Table Size</CCardTitle>
            </CCardBody>
            <CButtonGroup role="group" aria-label="Basic example">
              <CButton>25</CButton>
              <CButton color={'secondary'}>50</CButton>
              <CButton color={'secondary'}>100</CButton>
              <CButton color={'secondary'}>200</CButton>
              <CButton color={'secondary'}>500</CButton>
            </CButtonGroup>
          </CCard>
          <br></br>
          <CCard style={{ width: '18rem' }} className="p-2">
            <CCardBody>
              <CCardTitle>Default Home Page</CCardTitle>
            </CCardBody>
            <CButtonGroup role="group" aria-label="Basic example">
              <CButton>25</CButton>
              <CButton color={'secondary'}>50</CButton>
              <CButton color={'secondary'}>100</CButton>
              <CButton color={'secondary'}>200</CButton>
              <CButton color={'secondary'}>500</CButton>
            </CButtonGroup>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default ViewProfile
