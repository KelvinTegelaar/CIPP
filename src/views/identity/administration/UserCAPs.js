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
import { useListUserConditionalAccessPoliciesQuery } from '../../../store/api/users'

export default function UserCAPs({ tenantDomain, userId }) {
  const {
    data: list,
    isFetching,
    error,
  } = useListUserConditionalAccessPoliciesQuery({ tenantDomain, userId })
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Applied Conditional Access Policies</CCardTitle>
        <CIcon icon={cilLockLocked} />
      </CCardHeader>
      <CCardBody>
        {!isFetching && error && <span>Error loading user details</span>}
        {!error && isFetching && <CSpinner />}
        {!isFetching && !error && (
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
      </CCardBody>
    </CCard>
  )
}

UserCAPs.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
}
