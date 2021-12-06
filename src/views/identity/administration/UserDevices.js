import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { listUserDevices } from '../../../store/modules/identity'
import { CCard, CCardBody, CCardHeader, CCardTitle, CLink } from '@coreui/react'
import BootstrapTable from 'react-bootstrap-table-next'
import CellBoolean from '../../../components/cipp/CellBoolean'
import CIcon from '@coreui/icons-react'
import { cilLaptop } from '@coreui/icons'
import CellNullText from '../../../components/cipp/CellNullText'

const formatter = (cell) => CellBoolean({ cell })
const nullFormatter = (cell) => CellNullText({ cell })

const columns = [
  {
    text: 'Display Name',
    dataField: 'displayName',
    formatter: (cell, row) => {
      if (row.EPMID === null) {
        return row.displayName ?? 'n/a'
      } else {
        return (
          <CLink
            target="_blank"
            href={`https://endpoint.microsoft.com/${row.tenantDomain}#blade/Microsoft_Intune_Devices/DeviceSettingsMenuBlade/overview/mdmDeviceId/${row.EPMID}`}
          >
            {row.displayName}
          </CLink>
        )
      }
    },
  },
  {
    text: 'Enabled',
    dataField: 'accountEnabled',
    formatter,
  },
  {
    text: 'Compliant',
    dataField: 'isCompliant',
    formatter,
  },
  {
    text: 'Manufacturer',
    dataField: 'manufacturer',
    formatter: (cell) => CellNullText({ cell }),
  },
  {
    text: 'Model',
    dataField: 'model',
    formatter: (cell) => CellNullText({ cell }),
  },
  {
    text: 'Operating System',
    dataField: 'operatingSystem',
    formatter: nullFormatter,
  },
  {
    text: 'OS Version',
    dataField: 'operatingSystemVersion',
    formatter: nullFormatter,
  },
  {
    text: 'Created',
    dataField: 'createdDateTime',
    formatter: nullFormatter,
  },
  {
    text: 'Approx Last SignIn',
    dataField: 'approximateLastSignInDateTime',
    formatter: nullFormatter,
  },
  {
    text: 'Ownership',
    dataField: 'deviceOwnership',
    formatter: (cell) => CellNullText({ cell }),
  },
  {
    text: 'Enrollment Type',
    dataField: 'enrollmentType',
    formatter: (cell) => CellNullText({ cell }),
  },
  {
    text: 'Management Type',
    dataField: 'managementType',
    formatter: (cell) => CellNullText({ cell }),
  },
  {
    text: 'On-Premises Sync Enabled',
    dataField: 'onPremisesSyncEnabled',
    formatter: (cell) => CellBoolean({ cell }),
  },
  {
    text: 'Trust Type',
    dataField: 'trustType',
    formatter: nullFormatter,
  },
]

export default function UserDevices({ userId, tenantDomain }) {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(listUserDevices({ tenantDomain, userId }))
  }, [])

  const { devices = [], loading, loaded, error } = useSelector((store) => store.identity.devices)

  // inject tenant domain into devices for column render
  const mapped = devices.map((device) => ({ ...device, tenantDomain }))

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>User Devices</CCardTitle>
        <CIcon icon={cilLaptop} />
      </CCardHeader>
      <CCardBody>
        {!loading && loaded && (
          <BootstrapTable
            keyField="ID"
            columns={columns}
            data={mapped}
            striped
            bordered={false}
            condensed
            wrapperClasses="table-responsive"
          />
        )}
        {error && <div>Error loading devices</div>}
      </CCardBody>
    </CCard>
  )
}

UserDevices.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
}
