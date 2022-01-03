import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardHeader, CCardTitle, CLink, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptop } from '@fortawesome/free-solid-svg-icons'
import DataTable from 'react-data-table-component'

import { cellBooleanFormatter, cellNullTextFormatter } from '../../../components/cipp'
import { useListUserDevicesQuery } from '../../../store/api/devices'

const columns = [
  {
    name: 'Display Name',
    selector: 'displayName',
    cell: (row, index, column) => {
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
    name: 'Enabled',
    selector: 'accountEnabled',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Compliant',
    selector: 'isCompliant',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Manufacturer',
    selector: 'manufacturer',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Model',
    selector: 'model',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Operating System',
    selector: 'operatingSystem',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'OS Version',
    selector: 'operatingSystemVersion',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Created',
    selector: 'createdDateTime',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Approx Last SignIn',
    selector: 'approximateLastSignInDateTime',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Ownership',
    selector: 'deviceOwnership',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Enrollment Type',
    selector: 'enrollmentType',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Management Type',
    selector: 'managementType',
    cell: cellNullTextFormatter(),
  },
  {
    name: 'On-Premises Sync Enabled',
    selector: 'onPremisesSyncEnabled',
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Trust Type',
    selector: 'trustType',
    cell: cellNullTextFormatter(),
  },
]

export default function UserDevices({ userId, tenantDomain }) {
  const {
    data: devices = [],
    isFetching,
    error,
  } = useListUserDevicesQuery({ userId, tenantDomain })

  // inject tenant domain into devices for column render
  const mapped = devices.map((device) => ({ ...device, tenantDomain }))

  return (
    <CCard className="options-card">
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>User Devices</CCardTitle>
        <FontAwesomeIcon icon={faLaptop} />
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Error loading devices</>}
        {!isFetching && !error && (
          <DataTable
            keyField="ID"
            columns={columns}
            data={mapped}
            striped
            responsive
            bordered={false}
            condensed
            wrapperClasses="table-responsive"
          />
        )}
      </CCardBody>
    </CCard>
  )
}

UserDevices.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
}
