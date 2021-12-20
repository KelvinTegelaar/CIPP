import React from 'react'
import {
  CCard,
  CCardImage,
  CCardTitle,
  CCardBody,
  CListGroup,
  CListGroupItem,
  CSpinner,
} from '@coreui/react'
import avatar0 from './../../assets/images/avatars/0.jpg'
import { useLoadClientPrincipalQuery } from '../../store/api/auth'

const ViewProfile = () => {
  const { data: profile, isFetching } = useLoadClientPrincipalQuery()

  return (
    <CCard style={{ width: '30rem' }}>
      {isFetching && <CSpinner />}
      {!isFetching && (
        <>
          <CCardImage orientation="top" src={avatar0} />
          <CCardBody>
            <CCardTitle>Identity: {profile.clientPrincipal?.userDetails}</CCardTitle>
          </CCardBody>
          <CListGroup flush>
            <CListGroupItem>
              Identity Provider: {profile.clientPrincipal?.identityProvider}
            </CListGroupItem>
            <CListGroupItem>User ID: {profile.clientPrincipal?.userId}</CListGroupItem>
            <CListGroupItem>
              Roles ({profile.clientPrincipal?.userRoles.length})
              <ul>
                {profile.clientPrincipal?.userRoles.map((r, index) => (
                  <li key={index}>{r}</li>
                ))}
              </ul>
            </CListGroupItem>
          </CListGroup>
        </>
      )}
    </CCard>
  )
}

export default ViewProfile
