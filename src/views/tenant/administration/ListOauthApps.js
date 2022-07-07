import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
    wrap: true,
    exportSelector: 'Tenant',
  },
  {
    name: 'Display Name',
    selector: (row) => row['Name'],
    sortable: true,
    wrap: true,
    exportSelector: 'Name',
  },
  {
    name: 'Application ID',
    selector: (row) => row['ID'],
    sortable: true,
    exportSelector: 'ID',
  },
  {
    name: 'Scope (Permissions)',
    selector: (row) => row['Scope'],
    sortable: true,
    exportSelector: 'Scope',
  },
  {
    name: 'Permissions Granted at',
    selector: (row) => row['StartTime'],
    sortable: true,
    exportSelector: 'StartTime',
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
