import React from 'react'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { faUsers, faCog, faLaptop } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CLink } from '@coreui/react'
import PropTypes from 'prop-types'

export default function User365Management({ tenantDomain, userId }) {
  return (
    <CCard className="options-card">
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>M365 Management</CCardTitle>
        <FontAwesomeIcon icon={faCog} />
      </CCardHeader>
      <CCardBody>
        <CLink
          className="dropdown-item"
          href={`https://portal.azure.com/${tenantDomain}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${userId}`}
          target="_blank"
        >
          <FontAwesomeIcon icon={faUsers} className="me-2" />
          View in Azure AD
        </CLink>
        <CLink
          className="dropdown-item"
          href={`https://endpoint.microsoft.com/${tenantDomain}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${userId}`}
          target="_blank"
        >
          <FontAwesomeIcon icon={faLaptop} className="me-2" />
          View in Endpoint Manager (Intune)
        </CLink>
      </CCardBody>
    </CCard>
  )
}

User365Management.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
}
