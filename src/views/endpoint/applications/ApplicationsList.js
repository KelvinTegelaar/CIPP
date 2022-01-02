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
  CCardTitle,
  CCardHeader,
  CCardBody,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import { faUser, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const dropdown = (row, rowIndex, formatExtraData) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu style={{ position: 'fixed', right: 0, zIndex: 1000 }}>
        <CDropdownItem href="#">
          <Link className="dropdown-item" to={`/endpoint/MEM/EditMEMApplication`}>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Edit Application
          </Link>
        </CDropdownItem>
        <CDropdownItem href="#">Assign to All Users</CDropdownItem>
        <CDropdownItem href="#">Assign to All Devices</CDropdownItem>
        <CDropdownItem href="#">Assign Globally (All Users / All Devices)</CDropdownItem>
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
    selector: 'publishingState',
    name: 'Published',
    sortable: true,
  },
  {
    selector: 'installCommandLine',
    name: 'installCommandLine',
    sortable: true,
  },
  {
    selector: 'uninstallCommandLine',
    name: 'uninstallCommandLine',
    sortable: true,
  },
  {
    name: 'Action',
    cell: dropdown,
  },
]

const ApplicationsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Applications List</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-Applications-List`}
            path="/api/ListApps"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default ApplicationsList
