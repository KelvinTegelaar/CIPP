import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip, cellDateFormatter } from 'src/components/tables'

const columns = [
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
    wrap: true,
    cell: (row) => CellTip(row['Tenant']),
    exportSelector: 'Tenant',
    maxWidth: '200px',
  },
  {
    name: 'Display Name',
    selector: (row) => row['Name'],
    sortable: true,
    wrap: true,
    cell: (row) => CellTip(row['Name']),
    exportSelector: 'Name',
  },
  {
    name: 'Application ID',
    selector: (row) => row['ApplicationID'],
    sortable: true,
    cell: (row) => CellTip(row['ApplicationID']),
    exportSelector: 'ApplicationID',
  },
  {
    name: 'Object ID',
    selector: (row) => row['ObjectID'],
    sortable: true,
    cell: (row) => CellTip(row['ObjectID']),
    exportSelector: 'ObjectID',
  },
  {
    name: 'Scope (Permissions)',
    selector: (row) => row['Scope'],
    sortable: true,
    exportSelector: 'Scope',
    cell: (row) => CellTip(row['Scope']),
  },
  {
    name: 'Permissions Granted (Local)',
    selector: (row) => row['StartTime'],
    sortable: true,
    exportSelector: 'StartTime',
    cell: cellDateFormatter(),
  },
]

const OauthList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Consented Applications"
      tenantSelector={false}
      showAllTenantSelector={false}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-ApprovedApps`,
        path: '/api/ListOAuthApps',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default OauthList
