import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CCard, CCardHeader, CCardTitle, CCardBody } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
//future version dropdown:
// const dropdown = (row, rowIndex, formatExtraData) => {
//   return (
//     <CDropdown>
//       <CDropdownToggle size="sm" color="link">
//         <FontAwesomeIcon icon={faBars} />
//       </CDropdownToggle>
//       <CDropdownMenu style={{ position: 'fixed', right: 0, zIndex: 1000 }}>
//         <CDropdownItem href="#">
//           <Link className="dropdown-item" to={`/endpoint/autopilot/AutopilotEditProfile}`}>
//             <FontAwesomeIcon icon={faUser} className="me-2" />
//             Edit Profile
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
    wrap: true,
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    wrap: true,
  },
  {
    selector: (row) => row['language'],
    name: 'Language',
    sortable: true,
  },
  {
    selector: (row) => row['extractHardwareHash'],
    name: 'Convert to Autopilot',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['deviceNameTemplate'],
    name: 'Device Name Template',
    sortable: true,
  },
]

const AutopilotListProfiles = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Autopilot Profiles</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            tableProps={{
              expandableRows: true,
              expandableRowsComponent: ExpandedComponent,
              expandOnRowClicked: true,
            }}
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-AutopilotProfile-List`}
            path="/api/ListAutopilotConfig?type=ApProfile"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AutopilotListProfiles
