import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CCard, CCardHeader, CCardTitle, CCardBody } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
//future version dropdown
// const dropdown = (row, rowIndex, formatExtraData) => {
//   return (
//     <CDropdown>
//       <CDropdownToggle size="sm" color="link">
//         <FontAwesomeIcon icon={faBars} />
//       </CDropdownToggle>
//       <CDropdownMenu style={{ position: 'fixed', right: 0, zIndex: 1000 }}>
//         <CDropdownItem href="#">
//           <Link className="dropdown-item" to={`/endpoint/autopilot/AutopilotEditStatusPage}`}>
//             <FontAwesomeIcon icon={faUser} className="me-2" />
//             Edit Status Page
//           </Link>
//         </CDropdownItem>
//       </CDropdownMenu>
//     </CDropdown>
//   )
// }

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
]

const AutopilotListESP = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Autopilot Status Pages</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-AutopilotStatusPages-List`}
            path="/api/ListAutopilotConfig?type=ESP"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AutopilotListESP
