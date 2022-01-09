import React from 'react'
import PropTypes from 'prop-types'
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
import { cellBooleanFormatter, CippDatatable } from '../../../components/cipp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptop } from '@fortawesome/free-solid-svg-icons'
import { ModalService } from '../../../components'
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
      selector: 'Date',
    },
    {
      name: 'Application',
      selector: 'Application',
    },
    {
      name: 'Login Status',
      selector: 'LoginStatus',
    },
    {
      name: 'Conditional Access Status',
      dataField: 'ConditionalAccessStatus',
      // @TODO someone make these either return 'success' or 'Success' not both
      cell: cellBooleanFormatter,
    },
    {
      name: 'Overall Login Status',
      dataField: 'OverallLoginStatus',
      // @TODO someone make these either return 'success' or 'Success' not both
      cell: cellBooleanFormatter,
    },
    {
      name: 'IP Address',
      dataField: 'IPAddress',
    },
    {
      name: 'Town',
      dataField: 'Town',
    },
    {
      name: 'State',
      dataField: 'State',
    },
    {
      name: 'Country',
      dataField: 'Country',
    },
    {
      name: 'Device',
      dataField: 'Device',
    },
    {
      name: 'Device Compliant',
      dataField: 'OverallLoginStatus',
    },
    {
      name: 'OS',
      dataField: 'OS',
    },
    {
      name: 'Browser',
      dataField: 'Browser',
    },
    {
      name: 'Applied CAPs',
      dataField: 'AppliedCAPs',
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
          <CippDatatable
            path="/api/ListUserSigninLogs"
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
