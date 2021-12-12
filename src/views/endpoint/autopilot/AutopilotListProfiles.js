import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'

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
    selector: 'displayName',
    name: 'Name',
    sortable: true,
  },
  {
    selector: 'Description',
    name: 'Description',
    sortable: true,
  },
  {
    selector: 'language',
    name: 'Language',
    sortable: true,
  },
  {
    selector: 'extractHardwareHash',
    name: 'Convert to Autopilot',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: 'deviceNameTemplate',
    name: 'Device Name Template',
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const AutopilotListProfiles = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Autopilot Profile List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-AutopilotProfile-List`}
          path="/api/ListAutopilotConfig?type=ApProfile"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default AutopilotListProfiles
