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

export default function UserEmailPermissions({
  mailbox: { details = {}, loading = false, loaded = false, error },
}) {
  let permissions = (details && details.Permissions) || []
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
        {loading && !loaded && <CSpinner />}
        {loaded && !error && (
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
        {!loaded && !loading && error && <>Error loading email permissions.</>}
        {loaded && !loading && !error && permissions.length === 0 && <>No permissions found.</>}
      </CCardBody>
    </CCard>
  )
}

UserEmailPermissions.propTypes = {
  mailbox: PropTypes.object,
}
