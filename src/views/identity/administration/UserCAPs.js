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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { useListUserConditionalAccessPoliciesQuery } from 'src/store/api/users'

export default function UserCAPs({ tenantDomain, userId, className = null }) {
  const {
    data: list,
    isFetching,
    error,
  } = useListUserConditionalAccessPoliciesQuery({ tenantDomain, userId })
  return (
    <CCard className={`options-card ${className}`}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <CCardTitle>Applied Conditional Access Policies</CCardTitle>
        <FontAwesomeIcon icon={faKey} />
      </CCardHeader>
      <CCardBody>
        {!isFetching && error && <span>Error loading user details</span>}
        {!error && isFetching && <CSpinner />}
        {!isFetching && !error && (
          <CTable responsive>
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
  className: PropTypes.string,
}
