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
    selector: (row) => row['displayName'],
    sort: true,
  },
  {
    name: 'UPN',
    selector: (row) => row['UPN'],
    sort: true,
  },
  {
    name: 'Last Active',
    selector: (row) => row['LastActive'],
    sort: true,
  },
  {
    name: 'File Count (Total)',
    selector: (row) => row['FileCount'],
    sort: true,
  },
  {
    name: 'Used (GB)',
    selector: (row) => row['UsedGB'],
    sort: true,
  },
  {
    name: 'Allocated (GB)',
    selector: (row) => row['Allocated'],
    sort: true,
  },
]

const SharepointList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Sharepoint List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListSites?type=SharePointSiteUsage"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default SharepointList
