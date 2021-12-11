import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'

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
    name: 'State',
    selector: 'state',
    sortable: true,
  },
  {
    name: 'Last Modified',
    selector: 'modifiedDateTime',
    sortable: true,
  },
  {
    name: 'Client App Types',
    selector: 'clientAppTypes',
    sortable: true,
  },
  {
    name: 'Platform Inc',
    selector: 'includePlatforms',
    sortable: true,
  },
  {
    name: 'Platform Exc',
    selector: 'excludePlatforms',
    sortable: true,
  },
  {
    name: 'Include Locations',
    selector: 'includeLocations',
    sortable: true,
  },
  {
    name: 'Exclude Locations',
    selector: 'excludeLocations',
    sortable: true,
  },
  {
    name: 'Include Users',
    selector: 'includeUsers',
    sortable: true,
  },
  {
    name: 'Exclude Users',
    selector: 'excludeUsers',
    sortable: true,
  },
  {
    name: 'Include Groups',
    selector: 'includeGroups',
    sortable: true,
  },
  {
    name: 'Exclude Groups',
    selector: 'excludeGroups',
    sortable: true,
  },
  {
    name: 'Include Applications',
    selector: 'includeApplications',
    sortable: true,
  },
  {
    name: 'Exclude Applications',
    selector: 'excludeApplications',
    sortable: true,
  },
  {
    name: 'Control Operator',
    selector: 'grantControlsOperator',
    sortable: true,
  },
  {
    name: 'Built-in Controls',
    selector: 'builtInControls',
    sortable: true,
  },
]

const CondtionalAccessList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Conditional Access Overview</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListAPDevices"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default CondtionalAccessList
