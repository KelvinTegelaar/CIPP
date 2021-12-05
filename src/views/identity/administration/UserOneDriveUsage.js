import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
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
import CIcon from '@coreui/icons-react'
import { cilClock, cilFolder } from '@coreui/icons'
import CellProgressBar from '../../../components/cipp/CellProgressBar'
import { listOneDriveUsage } from '../../../store/modules/identity'

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
/**
 {
    "UPN": "user@domain.com",
    "displayName": "First last",
    "LastActive": "2021-12-30",
    "FileCount": "12345",
    "UsedGB": 12.8,
    "URL": "https://my-domain.sharepoint.com/personal/user_domain_com",
    "Allocated": 1024
  }
 */

export default function UserOneDriveUsage({ userUPN, tenantDomain }) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(listOneDriveUsage({ userUPN, tenantDomain }))
  }, [])

  const {
    report = {},
    loading = false,
    loaded = false,
    error = undefined,
  } = useSelector((state) => state.identity.oneDrive) ?? {}

  const noUsage = Object.keys(report).length === 0 ?? false

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        One Drive Details
        <CIcon icon={cilFolder} />
      </CCardHeader>
      <CCardBody>
        {loading && !loaded && <CSpinner />}
        {loaded && !error && !noUsage && (
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
        {loaded && !loading && noUsage && <>No usage reported</>}
        {!loaded && !loading && error && <>Error loading user</>}
      </CCardBody>
    </CCard>
  )
}

UserOneDriveUsage.propTypes = {
  userUPN: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
}
