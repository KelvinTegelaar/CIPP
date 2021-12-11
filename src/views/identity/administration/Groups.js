import React from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useSelector } from 'react-redux'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import CippDatatable from '../../../components/cipp/CippDatatable'
import cellGetProperty from '../../../components/cipp/cellGetProperty'
import { cellBooleanFormatter } from '../../../components/cipp'

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
    name: 'Name',
    selector: 'displayName',
    sortable: true,
  },
  {
    name: 'Group Type',
    selector: 'calculatedGroupType',
    sortable: true,
  },
  {
    name: 'Dynamic Group',
    selector: 'dynamicGroupBool',
    cell: cellBooleanFormatter(),
    sortable: true,
  },
  {
    name: 'Teams Enabled',
    selector: 'teamsEnabled',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'On-Prem Sync',
    selector: 'onPremisesSyncEnabled',
    cell: cellBooleanFormatter({ warning: true }),
  },
  {
    name: 'Email',
    selector: 'mail',
    sortable: true,
  },
  {
    name: 'Action',
    cell: dropdown,
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
