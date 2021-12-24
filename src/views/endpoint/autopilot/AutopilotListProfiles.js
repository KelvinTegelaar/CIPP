import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
} from '@coreui/react'
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
    wrap: true,
  },
  {
    selector: 'Description',
    name: 'Description',
    sortable: true,
    wrap: true,
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

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data, null, 2)}</pre>
  )

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Mobile Devices</CCardTitle>
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
