import { CLink } from '@coreui/react'
import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

const Altcolumns = [
  {
    name: 'Tenant',
    selector: (row) => row['tenantDisplayName'],
    sortable: true,
    exportSelector: 'tenantDisplayName',
  },
  {
    name: 'User Principal Name',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    name: 'Last sign in time',
    selector: (row) => row['lastNonInteractiveSignInDateTime'],
    sortable: true,
    exportSelector: 'lastNonInteractiveSignInDateTime',
  },
  {
    name: 'Assigned Licenses Count',
    selector: (row) => row['numberOfAssignedLicenses'],
    sortable: true,
    exportSelector: 'numberOfAssignedLicenses',
  },
  {
    name: 'Last updated at',
    selector: (row) => row['lastRefreshedDateTime'],
    sortable: true,
    exportSelector: 'lastRefreshedDateTime',
  },
]
const InActiveUserReport = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Inactive users (6 months)"
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      datatable={{
        columns: Altcolumns,
        path: '/api/ListInactiveAccounts',
        reportName: `${tenant?.defaultDomainName}-ListInactiveAccounts`,
        params: { TenantFilter: tenant?.customerId },
      }}
    />
  )
}

export default InActiveUserReport
