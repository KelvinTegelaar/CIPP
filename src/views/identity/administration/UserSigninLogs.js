import React from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { cellBooleanFormatter } from 'src/components/tables'
import { DatatableContentCard } from 'src/components/contentcards'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { ModalService } from 'src/components/utilities'
import { useListUserSigninLogsQuery } from 'src/store/api/users'

const rowStyle = (row, rowIndex) => {
  const style = {}
  if (row.OverallLoginStatus !== 'Success') {
    // @TODO this is dumb
    style.backgroundColor = '#e55353'
  }

  return style
}

export default function UserSigninLogs({ userId, tenantDomain, className = null }) {
  const {
    data: list = [],
    isFetching,
    error,
  } = useListUserSigninLogsQuery({ userId, tenantDomain })

  const mapped = list.map((val) => ({ ...val, tenantDomain }))

  const handleClickAppliedCAPs = ({ row }) => {
    ModalService.open({
      body: (
        <CTable>
          <CTableHead>
            <CTableHeaderCell>Additional Details</CTableHeaderCell>
            <CTableHeaderCell>Failure Reason</CTableHeaderCell>
          </CTableHead>
          <CTableBody>
            {row &&
              row.AppliedCAPs.map((value, idx) => {
                return (
                  <CTableRow key={idx}>
                    <CTableDataCell>{value.Name}</CTableDataCell>
                    <CTableDataCell>{value.Result}</CTableDataCell>
                  </CTableRow>
                )
              })}
          </CTableBody>
        </CTable>
      ),
      title: 'Conditional Access Policies Applied',
    })
  }

  const columns = [
    {
      name: 'Date',
      selector: (row) => row['Date'],
      exportSelector: 'Date',
    },
    {
      name: 'Application',
      selector: (row) => row['Application'],
      exportSelector: 'Application',
    },
    {
      name: 'Login Status',
      selector: (row) => row['LoginStatus'],
      exportSelector: 'LoginStatus',
    },
    {
      name: 'Conditional Access Status',
      selector: (row) => row['ConditionalAccessStatus'],
      exportSelector: 'ConditionalAccessStatus',
    },
    {
      name: 'Overall Login Status',
      selector: (row) => row['OverallLoginStatus'],
      exportSelector: 'OverallLoginStatus',
    },
    {
      name: 'IP Address',
      selector: (row) => row['IPAddress'],
      exportSelector: 'IPAddress',
    },
    {
      name: 'Town',
      selector: (row) => row['Town'],
      exportSelector: 'Town',
    },
    {
      name: 'State',
      selector: (row) => row['State'],
      exportSelector: 'State',
    },
    {
      name: 'Country',
      selector: (row) => row['Country'],
      exportSelector: 'Country',
    },
    {
      name: 'Device',
      selector: (row) => row['Device'],
      exportSelector: 'Device',
    },
    {
      name: 'Device Compliant',
      selector: (row) => row['DeviceCompliant'],
      cell: cellBooleanFormatter,
      exportSelector: 'DeviceCompliant',
    },
    {
      name: 'OS',
      selector: (row) => row['OS'],
      exportSelector: 'OS',
    },
    {
      name: 'Browser',
      selector: (row) => row['Browser'],
      exportSelector: 'Browser',
    },
    {
      name: 'Applied CAPs',
      dataField: 'AppliedCAPs',
      formatter: (row, index, column) => {
        const cell = column.selector(row)
        if (!cell) {
          return null
        }
        return (
          <CButton size="sm" onClick={() => handleClickAppliedCAPs({ row })}>
            More
          </CButton>
        )
      },
    },
  ]

  return (
    <DatatableContentCard
      title="User Sign In Logs"
      icon={faKey}
      className={className}
      isFetching={isFetching}
      error={error}
      datatable={{
        reportName: 'ListUserSigninLogs',
        path: '/api/ListUserSigninLogs',
        params: { tenantFilter: tenantDomain, userId },
        columns,
        keyField: 'id',
        responsive: true,
        dense: true,
        rowStyle: rowStyle,
        striped: true,
        data: mapped,
      }}
    />
  )
}

UserSigninLogs.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
  className: PropTypes.string,
}
