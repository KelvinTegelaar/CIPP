import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faBars } from '@fortawesome/free-solid-svg-icons'

const dropdown = (row, index, column) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu style={{ position: 'fixed', right: 0, zIndex: 1000 }}>
        <CDropdownItem href="#">
          <Link
            className="dropdown-item"
            to={`/tenant/administration/tenants/Edit?TenantFilter=${row.defaultDomainName}`}
          >
            <FontAwesomeIcon icon={faCog} className="me-2" />
            Edit Tenant
          </Link>
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Default Domain',
    selector: (row) => row['defaultDomainName'],
    sortable: true,
  },
  {
    name: 'M365 Portal',
    selector: (row) => row['customerId'],
    center: true,
    cell: (row) => (
      <a
        href={`https://portal.office.com/Partner/BeginClientSession.aspx?CTID=${row.customerId}&CSDEST=o365admincenter`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'Exchange Portal',
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={`https://outlook.office365.com/ecp/?rfr=Admin_o365&exsvurl=1&delegatedOrg=${row.defaultDomainName}`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'AAD Portal',
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={`https://aad.portal.azure.com/${row.defaultDomainName}`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'Teams Portal',
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={`https://admin.teams.microsoft.com/?delegatedOrg=${row.defaultDomainName}`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'Azure Portal',
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={`https://portal.azure.com/${row.defaultDomainName}`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'MEM (Intune) Portal',
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={`https://endpoint.microsoft.com/${row.defaultDomainName}`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'Action',
    center: true,
    cell: dropdown,
  },

  // @todo not used at the moment?
  // {
  //   name: 'Domains',
  //   selector: 'defaultDomainName',
  // },
]

const TenantsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Tenant list</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-Tenants-List`}
            path="/api/ListTenants"
            columns={columns}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default TenantsList
