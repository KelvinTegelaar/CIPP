import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed } from '@coreui/icons'
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

export default function UserEmailDetails({ user, loading, loaded, error }) {
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Email Details</CCardTitle>
        <CIcon icon={cilEnvelopeClosed} />
      </CCardHeader>
      <CCardBody>
        {loading && !loaded && <CSpinner />}
        {loaded && !error && (
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
        {!loaded && !loading && error && <>Error loading user</>}
      </CCardBody>
    </CCard>
  )
}

UserEmailDetails.propTypes = {
  user: PropTypes.object,
  loading: PropTypes.bool,
  loaded: PropTypes.bool,
  error: PropTypes.any,
}
