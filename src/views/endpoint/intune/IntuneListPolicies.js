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
    selector: (row) => row['displayName'],
    name: 'Name',
    sortable: true,
  },
  {
    selector: (row) => row['PolicyTypeName'],
    name: 'Profile Type',
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const IntuneList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Intune Policy List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Applications-List`}
          path="/api/ListIntunePolicy?type=ESP"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default IntuneList
