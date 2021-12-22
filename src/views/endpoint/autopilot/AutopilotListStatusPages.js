import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { Link } from 'react-router-dom'
import { faUser, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const dropdown = (row, rowIndex, formatExtraData) => {
  return (
    <CDropdown style={{ position: 'fixed', zIndex: 1000 }}>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">
          <Link className="dropdown-item" to={`/endpoint/autopilot/AutopilotEditStatusPage}`}>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Edit Status Page
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
    selector: 'installProgressTimeoutInMinutes',
    name: 'Installation Timeout (Minutes)',
    sortable: true,
  },
  {
    selector: 'showInstallationProgress',
    name: 'Show Installation Progress',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: 'blockDeviceSetupRetryByUser',
    name: 'Block Retries',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: 'allowDeviceResetOnInstallFailure',
    name: 'Allow reset on failure',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: 'allowDeviceUseOnInstallFailure',
    name: 'Allow usage on failure',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const AutopilotListESP = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Autopilot Status Page List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-AutopilotStatusPages-List`}
          path="/api/ListAutopilotConfig?type=ESP"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default AutopilotListESP
