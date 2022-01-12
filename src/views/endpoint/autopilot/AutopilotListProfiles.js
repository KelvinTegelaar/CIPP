import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CippPageList } from '../../../components'
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
    <CippPageList
      title="Autopilot Profiles"
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-AutopilotProfile-List`,
        columns,
        path: '/api/ListAutopilotConfig?type=ApProfile',
        params: {
          TenantFilter: tenant?.defaultDomainName,
        },
        tableProps: {
          expandableRows: true,
          expandableRowsComponent: ExpandedComponent,
          expandOnRowClicked: true,
        },
      }}
    />
  )
}

export default AutopilotListProfiles
