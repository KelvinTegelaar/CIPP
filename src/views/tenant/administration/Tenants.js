import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog, faEdit } from '@fortawesome/free-solid-svg-icons'
import { CippPageList } from 'src/components/layout'
import { Link } from 'react-router-dom'
import { CellTip } from 'src/components/tables'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '250px',
  },
  {
    name: 'Default Domain',
    selector: (row) => row['defaultDomainName'],
    sortable: true,
    cell: (row) => CellTip(row['defaultDomainName']),
    exportSelector: 'defaultDomainName',
    minWidth: '250px',
  },
  {
    exportSelector: 'customerId',
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
    name: 'Security Portal (GDAP)',
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={`https://security.microsoft.com/?tid=${row.customerId}`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'Sharepoint Admin',
    selector: (row) => row['defaultDomainName'],
    center: true,
    cell: (row) => (
      <a
        href={`https://${row.defaultDomainName.split('.')[0]}-admin.sharepoint.com`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        <FontAwesomeIcon icon={faCog} className="me-2" />
      </a>
    ),
  },
  {
    name: 'Actions',
    center: true,
    cell: (row) => (
      <Link
        to={`/tenant/administration/tenants/Edit?tenantFilter=${row.defaultDomainName}&customerId=${row.customerId}`}
      >
        <CButton size="sm" variant="ghost" color="warning">
          <FontAwesomeIcon icon={faEdit} />
        </CButton>
      </Link>
    ),
  },
]

const TenantsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Tenants"
      tenantSelector={false}
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
