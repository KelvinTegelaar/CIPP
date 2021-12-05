import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilSettings } from '@coreui/icons'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableRow,
} from '@coreui/react'
import CellProgressBar from '../../../components/cipp/CellProgressBar'

const columns = [
  {
    text: 'Total Items',
    dataField: 'ItemCount',
  },
  {
    text: 'Total Size',
    dataField: 'TotalItemSize',
    formatter: (cell) => String(`${cell} GB`),
  },
  {
    text: 'Prohibit Send',
    dataField: 'ProhibitSendQuota',
    formatter: (cell) => String(`${cell} GB`),
  },
  {
    text: 'Total Send & Receive',
    dataField: 'ProhibitSendReceiveQuota',
    formatter: (cell) => String(`${cell} GB`),
  },
  {
    text: 'Usage',
    dataField: 'Aliases',
    formatter: (cell, row) =>
      CellProgressBar({
        // round to 2 decimal places
        value: Math.round((row.TotalItemSize / row.ProhibitSendReceiveQuota) * 100 * 100) / 100,
        reverse: true,
      }),
  },
]

export default function UserEmailUsage({
  mailbox: { details = {}, loading = false, loaded = false, error },
}) {
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        Email Usage
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
              {columns.map((column, index) => {
                return (
                  <CTableRow key={index}>
                    <CTableDataCell>{column.text}</CTableDataCell>
                    {!column.formatter && (
                      <CTableDataCell>{details[column.dataField] ?? 'n/a'}</CTableDataCell>
                    )}
                    {column.formatter && (
                      <CTableDataCell>
                        {column.formatter(details[column.dataField], details)}
                      </CTableDataCell>
                    )}
                  </CTableRow>
                )
              })}
            </CTableBody>
          </CTable>
        )}
        {!loaded && !loading && error && <>Error loading email details</>}
      </CCardBody>
    </CCard>
  )
}

UserEmailUsage.propTypes = {
  mailbox: PropTypes.object,
}
