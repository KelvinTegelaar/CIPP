import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilEnvelopeClosed, cilSettings } from '@coreui/icons'
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
import { CellProgressBar } from '../../../components/cipp'
import { useListMailboxDetailsQuery } from '../../../store/api/mailbox'

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

export default function UserEmailUsage({ userId, tenantDomain }) {
  const { data: report, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>Email Usage</CCardTitle>
        <div>
          <CIcon icon={cilEnvelopeClosed} className="me-2" />
          <CIcon icon={cilSettings} />
        </div>
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Error loading email usage.</>}
        {!isFetching && !error && (
          <CTable>
            <CTableBody>
              {columns.map((column, index) => {
                return (
                  <CTableRow key={index}>
                    <CTableDataCell>{column.text}</CTableDataCell>
                    {!column.formatter && (
                      <CTableDataCell>{report[column.dataField] ?? 'n/a'}</CTableDataCell>
                    )}
                    {column.formatter && (
                      <CTableDataCell>
                        {column.formatter(report[column.dataField], report)}
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

UserEmailUsage.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
}
