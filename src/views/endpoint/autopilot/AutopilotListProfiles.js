import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { Link } from 'react-router-dom'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const dropdown = (row, rowIndex, formatExtraData) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" variant="ghost" color="primary">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">
          <Link className="dropdown-item" to={`/endpoint/autopilot/AutopilotEditProfile}`}>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Edit Profile
          </Link>
        </CDropdownItem>
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
