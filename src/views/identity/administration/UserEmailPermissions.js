import React from 'react'
import PropTypes from 'prop-types'
import { faCog, faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import { useListMailboxDetailsQuery } from 'src/store/api/mailbox'

export default function UserEmailPermissions({ userId, tenantDomain, className }) {
  const { data: report, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  let permissions = (report && report.Permissions) || []
  if (!Array.isArray(permissions)) {
    permissions = [permissions]
  }

  return (
    <CCard className={`options-card ${className}`}>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Email Permissions</CCardTitle>
        <div>
          <FontAwesomeIcon icon={faEnvelope} className="me-2" />
          <FontAwesomeIcon icon={faCog} />
        </div>
      </CCardHeader>
      <CCardBody>
        {!isFetching && error && <span>Error loading email permissions.</span>}
        {!isFetching && !error && permissions.length === 0 && <span>No permissions found.</span>}
        {!error && isFetching && <CSpinner />}
        {!isFetching && !error && (
          <CTable>
            <CTableBody>
              {permissions.map((value, index) => {
                return (
                  <CTableRow key={index}>
                    <CTableDataCell>{value.User ?? 'n/a'}</CTableDataCell>
                    <CTableDataCell>{value.AccessRights ?? 'n/a'}</CTableDataCell>
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

UserEmailPermissions.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
