import React from 'react'
import { useSelector } from 'react-redux'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faBars } from '@fortawesome/free-solid-svg-icons'
import { CippPageList } from 'src/components'

const Dropdown = (row, index, column) => {
  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu style={{ position: 'fixed', right: 0, zIndex: 1000 }}>
        <CDropdownItem
          href={`/tenant/administration/tenants/Edit?TenantFilter=${row.defaultDomainName}`}
        >
          <FontAwesomeIcon icon={faCog} className="me-2" />
          Edit Tenant
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
    cell: Dropdown,
  },
]

const TenantsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Tenants"
      datatable={{
        keyField: 'id',
        columns,
        reportName: `${tenant.tenantId}-Tenants-List`,
        path: '/api/ListTenants',
      }}
    />
  )
}

export default TenantsList
