import React from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CSpinner,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptop } from '@fortawesome/free-solid-svg-icons'
import { setModalContent } from '../../../store/features/modal'
import { useListUserSigninLogsQuery } from '../../../store/api/users'
import DataTable from 'react-data-table-component'
import cellGetProperty from '../../../components/cipp/cellGetProperty'

const rowStyle = (row, rowIndex) => {
  const style = {}
  if (row.OverallLoginStatus !== 'Success') {
    // @TODO this is dumb
    style.backgroundColor = '#e55353'
  }

  return style
}

export default function UserSigninLogs({ userId, tenantDomain }) {
  const dispatch = useDispatch()
  const {
    data: list = [],
    isFetching,
    error,
  } = useListUserSigninLogsQuery({ userId, tenantDomain })

  const mapped = list.map((val) => ({ ...val, tenantDomain }))

  const handleClickAppliedCAPs = ({ row }) => {
    dispatch(
      setModalContent({
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
        visible: true,
      }),
    )
  }

  const columns = [
    {
      name: 'Date',
      selector: (row) => row['Date'],
    },
    {
      name: 'Application',
      selector: (row) => row['Application'],
    },
    {
      name: 'Login Status',
      selector: (row) => row['LoginStatus'],
    },
    {
      name: 'Conditional Access Status',
      selector: (row) => row['ConditionalAccessStatus'],
      // @TODO someone make these either return 'success' or 'Success' not both
      cell: cellBooleanFormatter,
    },
    {
      name: 'Overall Login Status',
      selector: (row) => row['OverallLoginStatus'],
      // @TODO someone make these either return 'success' or 'Success' not both
      cell: cellBooleanFormatter,
    },
    {
      name: 'IP Address',
      selector: (row) => row['IPAddress'],
    },
    {
      name: 'Town',
      selector: (row) => row['Town'],
    },
    {
      name: 'State',
      selector: (row) => row['State'],
    },
    {
      name: 'Country',
      selector: (row) => row['Country'],
    },
    {
      name: 'Device',
      selector: (row) => row['Device'],
    },
    {
      name: 'Device Compliant',
      selector: (row) => row['OverallLoginStatus'],
    },
    {
      name: 'OS',
      selector: (row) => row['OS'],
    },
    {
      name: 'Browser',
      selector: (row) => row['Browser'],
    },
    {
      name: 'Applied CAPs',
      selector: (row) => row['AppliedCAPs'],
      formatter: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)
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
    <CCard className="options-card">
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>User Sign in Logs</CCardTitle>
        <FontAwesomeIcon icon={faLaptop} />
      </CCardHeader>
      <CCardBody>
        {!isFetching && error && <span>Error loading user sign-in logs</span>}
        {!error && isFetching && <CSpinner />}
        {!isFetching && !error && (
          <DataTable
            keyField="id"
            columns={columns}
            data={mapped}
            striped
            bordered={false}
            dense
            rowStyle={rowStyle}
            wrapperClasses="table-responsive"
          />
        )}
      </CCardBody>
    </CCard>
  )
}

UserSigninLogs.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
}
