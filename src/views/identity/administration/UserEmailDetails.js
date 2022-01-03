import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
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

const columns = [
  {
    text: 'Primary Email',
    dataField: 'mail',
  },
  {
    text: 'Other Email Addresses',
    dataField: 'otherMails',
    formatter: (cell) => {
      if (cell && cell.length > 0) {
        return cell.join(', ')
      }
      return 'n/a'
    },
  },
  {
    text: 'Proxy Addresses',
    dataField: 'Aliases',
  },
]

export default function UserEmailDetails({ user, isFetching, error }) {
  return (
    <CCard className="options-card">
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Email Details</CCardTitle>
        <FontAwesomeIcon icon={faEnvelope} />
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Error loading user</>}
        {!isFetching && !error && (
          <CTable>
            <CTableBody>
              {columns.map((column, index) => {
                return (
                  <CTableRow key={index}>
                    <CTableDataCell>{column.text}</CTableDataCell>
                    {!column.formatter && (
                      <CTableDataCell>{user[column.dataField] ?? 'n/a'}</CTableDataCell>
                    )}
                    {column.formatter && (
                      <CTableDataCell>
                        {column.formatter(user[column.dataField], user)}
                      </CTableDataCell>
                    )}
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

UserEmailDetails.propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  error: PropTypes.any,
}
