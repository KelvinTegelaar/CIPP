import React from 'react'
import { CCard, CCardBody, CCardHeader } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilPeople, cilSettings, cilLaptop } from '@coreui/icons'
import { CLink } from '@coreui/react'
import PropTypes from 'prop-types'

export default function User365Management({ tenantDomain, userId }) {
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        M365 Management
        <CIcon icon={cilSettings} />
      </CCardHeader>
      <CCardBody>
        <CLink
          className="dropdown-item"
          href={`https://portal.azure.com/${tenantDomain}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${userId}`}
          target="_blank"
        >
          <CIcon icon={cilPeople} className="me-2" />
          View in Azure AD
        </CLink>
        <CLink
          className="dropdown-item"
          href={`https://endpoint.microsoft.com/${tenantDomain}/#blade/Microsoft_AAD_IAM/UserDetailsMenuBlade/Profile/userId/${userId}`}
          target="_blank"
        >
          <CIcon icon={cilLaptop} className="me-2" />
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
