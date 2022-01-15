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
import { faFolder } from '@fortawesome/free-solid-svg-icons'
import { CellProgressBar } from 'src/components/tables/CellProgressBar'
import { useListOneDriveUsageQuery } from 'src/store/api/oneDrive'

const columns = [
  {
    text: 'Site URL',
    dataField: 'URL',
  },
  {
    text: 'Usage',
    formatter: (cell, row) => {
      return `${row.UsedGB} / ${row.Allocated}`
    },
  },
  {
    text: 'Percent',
    dataField: 'LastSigninStatus',
    formatter: (cell, row) => {
      return CellProgressBar({
        value: Math.round((row.UsedGB / row.Allocated) * 100),
        reverse: true,
      })
    },
  },
  {
    text: 'Files',
    dataField: 'FileCount',
  },
  {
    text: 'Last Active',
    dataField: 'LastActive',
  },
]

export default function UserOneDriveUsage({ userUPN, tenantDomain, className }) {
  const {
    data: report = [],
    isFetching,
    error,
  } = useListOneDriveUsageQuery({ userUPN, tenantDomain })

  const noUsage = Object.keys(report).length === 0 ?? false

  return (
    <CCard className={`options-card ${className}`}>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>OneDrive Details</CCardTitle>
        <FontAwesomeIcon icon={faFolder} />
      </CCardHeader>
      <CCardBody>
        {!error && isFetching && <CSpinner />}
        {!isFetching && error && <span>Error loading usage report</span>}
        {!isFetching && noUsage && <>No usage reported</>}
        {!isFetching && !error && !noUsage && (
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

UserOneDriveUsage.propTypes = {
  userUPN: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
  className: PropTypes.string,
}
