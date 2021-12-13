import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const dropdown = (row, index, column) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" variant="ghost" color="primary">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">Delete Stnadard</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}
const columns = [
  {
    name: 'Tenant Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Standard',
    selector: (row) => row['standardName'],
    sortable: true,
  },
  {
    name: 'Applied By',
    selector: (row) => row['appliedBy'],
    sortable: true,
  },
  {
    name: 'Action',
    cell: dropdown,
  },
]

const TenantsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Applied Standards</h3>

        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListStandards"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default TenantsList
