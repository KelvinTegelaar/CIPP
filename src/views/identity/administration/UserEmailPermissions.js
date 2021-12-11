import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilSettings, cilEnvelopeClosed } from '@coreui/icons'
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
import { useListMailboxDetailsQuery } from '../../../store/api/mailbox'

export default function UserEmailPermissions({ userId, tenantDomain }) {
  const { data: report, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  let permissions = (report && report.Permissions) || []
  if (!Array.isArray(permissions)) {
    permissions = [permissions]
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Email Permissions</CCardTitle>
        <div>
          <CIcon icon={cilEnvelopeClosed} className="me-2" />
          <CIcon icon={cilSettings} />
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
}
