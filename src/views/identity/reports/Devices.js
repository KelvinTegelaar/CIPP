import React from 'react'
import { useSelector } from 'react-redux'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import {
  cellBooleanFormatter,
  cellDateFormatter,
  TenantSelector,
  CippDatatable,
} from '../../../components/cipp'

const dropdown = (row, index, column) => {
  return (
    <CDropdown>
      <CDropdownToggle color="primary">...</CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">Edit Group</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    name: 'Name',
    selector: 'displayName',
    sortable: true,
  },
  {
    name: 'Enabled',
    selector: 'accountEnabled',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Compliant',
    selector: 'isCompliant',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Manufacturer',
    selector: 'manufacturer',
    sortable: true,
  },
  {
    name: 'Model',
    selector: 'model',
    sortable: true,
  },
  {
    name: 'Operating System',
    selector: 'operatingSystem',
    sortable: true,
  },
  {
    name: 'Operating System Version',
    selector: 'operatingSystemVersion',
    sortable: true,
  },
  {
    name: 'Created',
    selector: 'createdDateTime',
    sortable: true,
    cell: cellDateFormatter({ format: 'short', showTime: false }),
  },
  {
    name: 'Approx Last SignIn',
    selector: 'approximateLastSignInDateTime',
    sortable: true,
    cell: cellDateFormatter(),
  },
  {
    name: 'Ownership',
    selector: 'deviceOwnership',
    sortable: true,
  },
  {
    name: 'Enrollment Type',
    selector: 'enrollmentType',
    sortable: true,
  },
  {
    name: 'Management Type',
    selector: 'managementType',
    sortable: true,
  },
  {
    name: 'On-Premises Sync Enabled',
    selector: 'onPremisesSyncEnabled',
    cell: cellBooleanFormatter(),
    sortable: true,
  },
  {
    name: 'Trust Type',
    selector: 'trustType',
    sortable: true,
  },
]

const DevicesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Devices</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListDevices"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default DevicesList
