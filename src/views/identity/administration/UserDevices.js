import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardHeader, CCardTitle, CLink, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faLaptop } from '@fortawesome/free-solid-svg-icons'
import { CippDatatable } from '../../../components/cipp'

import { cellBooleanFormatter, cellNullTextFormatter } from '../../../components/cipp'
import { useListUserDevicesQuery } from '../../../store/api/devices'

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
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
    name: (row) => row['Enabled'],
    selector: (row) => row['accountEnabled'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Compliant',
    selector: (row) => row['isCompliant'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Manufacturer',
    selector: (row) => row['manufacturer'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Model',
    selector: (row) => row['model'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Operating System',
    selector: (row) => row['operatingSystem'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'OS Version',
    selector: (row) => row['operatingSystemVersion'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Created',
    selector: (row) => row['createdDateTime'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Approx Last SignIn',
    selector: (row) => row['approximateLastSignInDateTime'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Ownership',
    selector: (row) => row['deviceOwnership'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Enrollment Type',
    selector: (row) => row['enrollmentType'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'Management Type',
    selector: (row) => row['managementType'],
    cell: cellNullTextFormatter(),
  },
  {
    name: 'On-Premises Sync Enabled',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Trust Type',
    selector: (row) => row['trustType'],
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
          <CippDatatable
            path="/api/ListUserDevices"
            params={{ tenantFilter: tenantDomain, userId }}
            keyField="id"
            columns={columns}
            data={mapped}
            striped
            bordered={false}
            dense
            responsive={true}
            disablePDFExport={true}
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
