import React from 'react'
import PropTypes from 'prop-types'
import { CLink } from '@coreui/react'
import { faLaptop } from '@fortawesome/free-solid-svg-icons'
import { DatatableContentCard } from 'src/components/contentcards'
import { cellBooleanFormatter, cellNullTextFormatter } from 'src/components/tables'
import { useListUserDevicesQuery } from 'src/store/api/devices'

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    exportSelector: 'displayName',
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
    exportSelector: 'accountEnabled',
  },
  {
    name: 'Compliant',
    selector: (row) => row['isCompliant'],
    cell: cellNullTextFormatter(),
    exportSelector: 'isCompliant',
  },
  {
    name: 'Manufacturer',
    selector: (row) => row['manufacturer'],
    cell: cellNullTextFormatter(),
    exportSelector: 'manufacturer',
  },
  {
    name: 'Model',
    selector: (row) => row['model'],
    cell: cellNullTextFormatter(),
    exportSelector: 'model',
  },
  {
    name: 'Operating System',
    selector: (row) => row['operatingSystem'],
    cell: cellNullTextFormatter(),
    exportSelector: 'operatingSystem',
  },
  {
    name: 'OS Version',
    selector: (row) => row['operatingSystemVersion'],
    cell: cellNullTextFormatter(),
    exportSelector: 'operatingSystemVersion',
  },
  {
    name: 'Created',
    selector: (row) => row['createdDateTime'],
    cell: cellNullTextFormatter(),
    exportSelector: 'createdDateTime',
  },
  {
    name: 'Approx Last SignIn',
    selector: (row) => row['approximateLastSignInDateTime'],
    cell: cellNullTextFormatter(),
    exportSelector: 'approximateLastSignInDateTime',
  },
  {
    name: 'Ownership',
    selector: (row) => row['deviceOwnership'],
    cell: cellNullTextFormatter(),
    exportSelector: 'deviceOwnership',
  },
  {
    name: 'Enrollment Type',
    selector: (row) => row['enrollmentType'],
    cell: cellNullTextFormatter(),
    exportSelector: 'enrollmentType',
  },
  {
    name: 'Management Type',
    selector: (row) => row['managementType'],
    cell: cellNullTextFormatter(),
    exportSelector: 'managementType',
  },
  {
    name: 'On-Premises Sync Enabled',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter(),
    exportSelector: 'onPremisessSyncEnabled',
  },
  {
    name: 'Trust Type',
    selector: (row) => row['trustType'],
    cell: cellNullTextFormatter(),
    exportSelector: 'trustType',
  },
]

export default function UserDevices({ userId, tenantDomain, className = null }) {
  const {
    data: devices = [],
    isFetching,
    error,
  } = useListUserDevicesQuery({ userId, tenantDomain })

  // inject tenant domain into devices for column render
  const mapped = devices.map((device) => ({ ...device, tenantDomain }))

  return (
    <DatatableContentCard
      title="User Devices"
      icon={faLaptop}
      datatable={{
        reportName: 'ListUserDevices',
        path: '/api/ListUserDevices',
        params: { tenantFilter: tenantDomain, userId },
        columns,
        keyField: 'id',
        responsive: true,
        dense: true,
        striped: true,
        data: mapped,
      }}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Error fetching user devices"
    />
  )
}

UserDevices.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
  className: PropTypes.string,
}
