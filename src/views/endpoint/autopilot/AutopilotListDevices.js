import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const dropdown = (row, rowIndex, formatExtraData) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">Delete Device</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    selector: 'serialNumber',
    name: 'Serial',
    sortable: true,
  },
  {
    selector: 'model',
    name: 'Model',
    sortable: true,
  },
  {
    selector: 'manufacturer',
    name: 'Manufacturer',
    sortable: true,
  },
  {
    selector: 'groupTag',
    name: 'Group Tag',
    sortable: true,
  },
  {
    selector: 'enrollmentState',
    name: 'Enrollment',
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const AutopilotListDevices = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Autopilot Device List</h3>
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

export default AutopilotListDevices
