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
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useListUserQuery } from 'src/store/api/users'

const columns = [
  {
    text: 'Last Sign in Date',
    dataField: 'LastSigninDate',
  },
  {
    text: 'Last Sign in Application',
    dataField: 'LastSigninApplication',
  },
  {
    text: 'Last Sign in Status',
    dataField: 'LastSigninStatus',
  },
  {
    text: 'Last Sign in Result',
    dataField: 'LastSigninResult',
  },
  {
    text: 'Last Sign in Failure Reason',
    dataField: 'LastSigninFailureReason',
  },
]

export default function UserLastLoginDetails({ tenantDomain, userId, className }) {
  const { data: user = {}, isFetching, error } = useListUserQuery({ tenantDomain, userId })

  return (
    <CCard className={`options-card ${className}`}>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Last Login Details</CCardTitle>
        <FontAwesomeIcon icon={faClock} />
      </CCardHeader>
      <CCardBody>
        {!isFetching && error && <span>Error loading user details</span>}
        {!error && isFetching && <CSpinner />}
        {!isFetching && !error && (
          <CTable>
            <CTableBody>
              {columns.map((column, index) => (
                <CTableRow key={index}>
                  <CTableDataCell>{column.text}</CTableDataCell>
                  <CTableDataCell>{user[column.dataField] ?? 'n/a'}</CTableDataCell>
                </CTableRow>
              ))}
            </CTableBody>
          </CTable>
        )}
      </CCardBody>
    </CCard>
  )
}

UserLastLoginDetails.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
