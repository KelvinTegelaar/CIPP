import React from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useSelector } from 'react-redux'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import CippDatatable from '../../../components/cipp/CippDatatable'

const dropdown = (cell, row, rowIndex, formatExtraData) => {
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
    text: 'Name',
    dataField: 'displayName',
    sort: true,
  },
  {
    text: 'Group Type',
    dataField: 'groupTypes',
    sort: true,
  },
  {
    text: 'Security Group',
    dataField: 'securityEnabled',
    sort: true,
  },
  {
    text: 'Email',
    dataField: 'mail',
    sort: true,
  },
  {
    text: 'Action',
    isDummyField: true,
    formatter: dropdown,
  },
]

const Groups = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Groups</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          reportName={`${tenant?.defaultDomainName}-Groups`}
          path="/api/ListGroups"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default Groups
