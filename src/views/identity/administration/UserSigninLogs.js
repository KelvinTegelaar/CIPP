import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { listUserSigninLogs } from '../../../store/modules/users'
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
import BootstrapTable from 'react-bootstrap-table-next'
import CellBoolean from '../../../components/cipp/CellBoolean'
import CIcon from '@coreui/icons-react'
import { cilLaptop } from '@coreui/icons'
import { setModalContent, showModal } from '../../../store/modules/modal'

const formatter = (cell) => CellBoolean({ cell })

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
  const signin = useSelector((store) => store.users.userSignInLogs)

  const { list = [], loading = false, loaded = false, error = undefined } = signin ?? {}

  useEffect(() => {
    dispatch(listUserSigninLogs({ tenantDomain, userId }))
  }, [])

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
      }),
    )
    dispatch(showModal())
  }

  const columns = [
    {
      text: 'Date',
      dataField: 'Date',
    },
    {
      text: 'Application',
      dataField: 'Application',
    },
    {
      text: 'Login Status',
      dataField: 'LoginStatus',
    },
    {
      text: 'Conditional Access Status',
      dataField: 'ConditionalAccessStatus',
      // @TODO someone make these either return 'success' or 'Success' not both
      formatter: (cell) => CellBoolean({ cell: cell === 'success' }),
    },
    {
      text: 'Overall Login Status',
      dataField: 'OverallLoginStatus',
      // @TODO someone make these either return 'success' or 'Success' not both
      formatter: (cell) => CellBoolean({ cell: cell === 'Success' }),
    },
    {
      text: 'IP Address',
      dataField: 'IPAddress',
    },
    {
      text: 'Town',
      dataField: 'Town',
    },
    {
      text: 'State',
      dataField: 'State',
    },
    {
      text: 'Country',
      dataField: 'Country',
    },
    {
      text: 'Device',
      dataField: 'Device',
    },
    {
      text: 'Device Compliant',
      isDummyField: true,
      formatter: (cell, row) => formatter(row.OverallLoginStatus),
    },
    {
      text: 'OS',
      dataField: 'OS',
    },
    {
      text: 'Browser',
      dataField: 'Browser',
    },
    {
      text: 'Applied CAPs',
      dataField: 'AppliedCAPs',
      formatter: (cell, row) => {
        if (!cell) {
          return
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
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>User Sign in Logs</CCardTitle>
        <CIcon icon={cilLaptop} />
      </CCardHeader>
      <CCardBody>
        {loading && !loaded && <CSpinner />}
        {!loading && loaded && (
          <BootstrapTable
            keyField="id"
            columns={columns}
            data={mapped}
            striped
            bordered={false}
            condensed
            rowStyle={rowStyle}
            wrapperClasses="table-responsive"
          />
        )}
        {error && <div>Error loading sign-in logs</div>}
      </CCardBody>
    </CCard>
  )
}

UserSigninLogs.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
}
