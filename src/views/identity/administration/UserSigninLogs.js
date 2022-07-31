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
import { CellTip, cellBooleanFormatter, cellDateFormatter } from 'src/components/tables'
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

function timeConversion(s) {
  let AMPM = s.slice(-2)
  let timeArr = s.slice(0, -2).split(':')
  if (AMPM === 'AM' && timeArr[0] === '12') {
    // catching edge-case of 12AM
    timeArr[0] = '00'
  } else if (AMPM === 'PM') {
    // everything with PM can just be mod'd and added with 12 - the max will be 23
    timeArr[0] = (timeArr[0] % 12) + 12
  }
  return timeArr.join(':')
}

//This is so dirty but I need to do this to solve the inconsistent dates
//between macos and windows
function FixDate(date) {
  if (date === null) {
    return null
  }
  try {
    var noLinesDate = date.toString().replace(/\n/g, '').trim()
    if (noLinesDate.toString().includes('AM') || noLinesDate.toString().includes('PM')) {
      var onlyTime = noLinesDate.slice(-11)
      if (onlyTime[0] === ' ') {
        onlyTime = '0' + onlyTime.replace(' ', '').replace(' ', '')
      }
      onlyTime = timeConversion(onlyTime.replace(' ', '').replace(' ', ''))
      noLinesDate = noLinesDate.slice(0, -11) + ' ' + onlyTime
    }
    return noLinesDate + 'Z'
  } catch {
    console.error('error returning date')
    return 'error'
  }
}

function ConvertErrorCode(row) {
  try {
    return row['LoginStatus']
      .toString()
      .replace('50126', '50126 (Invalid username or password)')
      .replace(
        '70044',
        '70044 (The session has expired or is invalid due to sign-in frequency checks by conditional access)',
      )
      .replace('50089', '50089 (Flow token expired)')
      .replace('53003', '53003 (Access has been blocked by Conditional Access policies)')
      .replace(
        '50140',
        '50140 (This error occurred due to "Keep me signed in" interrupt when the user was signing-in)',
      )
      .replace('50097', '50097 (Device authentication required)')
      .replace(
        '65001',
        "65001 (Application X doesn't have permission to access application Y or the permission has been revoked)",
      )
      .replace(
        '50053',
        '50053 (Account is locked because user tried to sign in too many times with an incorrect user ID or password)',
      )
      .replace('50020', '50020 (The user is unauthorized)')
      .replace(
        '50125',
        '50125 (Sign-in was interrupted due to a password reset or password registration entry)',
      )
      .replace('50074', '50074 (User did not pass the MFA challenge)')
      .replace('50133', '50133 (Session is invalid due to expiration or recent password change)')
      .replace('530002', '530002 (Your device is required to be compliant to access this resource)')
      .replace('9001011', '9001011 (Device policy contains unsupported required device state)')
  } catch {
    return null
  }
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
      name: 'Date (Local)',
      selector: (row) => FixDate(row['Date']),
      exportSelector: 'Date',
      minWidth: '145px',
      cell: cellDateFormatter(),
    },
    {
      name: 'Application',
      selector: (row) => row['Application'],
      exportSelector: 'Application',
      cell: (row) => CellTip(row['Application']),
      minWidth: '230px',
    },
    {
      name: 'Login Status',
      selector: (row) => ConvertErrorCode(row),
      exportSelector: 'LoginStatus',
      cell: (row) => CellTip(ConvertErrorCode(row)),
      minWidth: '230px',
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
      cell: (row) => CellTip(row['Town']),
    },
    {
      name: 'State',
      selector: (row) => row['State'],
      exportSelector: 'State',
      cell: (row) => CellTip(row['State']),
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
      cell: cellBooleanFormatter(),
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
      cell: (row) => CellTip(row['Browser']),
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
