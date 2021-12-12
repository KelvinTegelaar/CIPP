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
    selector: 'Displayname',
    name: 'Policy Name',
    sortable: true,
  },
  {
    selector: 'Description',
    name: 'Description',
    sortable: true,
  },
  {
    selector: 'Type',
    name: 'Type',
    sortable: true,
  },
  {
    selector: 'RAWJson',
    name: 'Raw JSON',
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]
//todo: Add expandableRow instead of raw json in table.
const AutopilotListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Available Intune Templates</h3>
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListIntuneTemplates"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default AutopilotListTemplates
