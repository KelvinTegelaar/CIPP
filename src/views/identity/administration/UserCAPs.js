import React from 'react'
import PropTypes from 'prop-types'
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
import CIcon from '@coreui/icons-react'
import { cilLockLocked } from '@coreui/icons'

export default function UserCAPs({ cap: { list = [], loading, loaded, error } = {} }) {
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Applied Conditional Access Policies</CCardTitle>
        <CIcon icon={cilLockLocked} />
      </CCardHeader>
      <CCardBody>
        {loading && !loaded && <CSpinner />}
        {loaded && !error && (
          <CTable>
            <CTableBody>
              {list.map((policy, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{policy.displayName ?? 'n/a'}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
        {!loaded && !loading && error && <>Error loading user CAPs</>}
      </CCardBody>
    </CCard>
  )
}

UserCAPs.propTypes = {
  cap: PropTypes.object,
}
