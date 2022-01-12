import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CippPageList } from '../../../components'
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
    selector: (row) => row['displayName'],
    name: 'Name',
    sortable: true,
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
  },
  {
    selector: (row) => row['installProgressTimeoutInMinutes'],
    name: 'Installation Timeout (Minutes)',
    sortable: true,
  },
  {
    selector: (row) => row['showInstallationProgress'],
    name: 'Show Installation Progress',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['blockDeviceSetupRetryByUser'],
    name: 'Block Retries',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['allowDeviceResetOnInstallFailure'],
    name: 'Allow reset on failure',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['allowDeviceUseOnInstallFailure'],
    name: 'Allow usage on failure',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
]

const AutopilotListESP = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Autopilot Status Pages"
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-AutopilotStatusPages-List`,
        path: '/api/ListAutopilotConfig?type=ESP',
        columns,
        params: {
          TenantFilter: tenant?.defaultDomainName,
        },
      }}
    />
  )
}

export default AutopilotListESP
