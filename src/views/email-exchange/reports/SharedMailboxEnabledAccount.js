import React from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['UserPrincipalName'],
    name: 'User Prinicipal Name',
    sortable: true,
    cell: (row) => CellTip(row['UserPrincipalName']),
    exportSelector: 'UserPrincipalName',
    minWidth: '200px',
  },
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '200px',
  },
  {
    selector: (row) => row['givenName'],
    name: 'First Name',
    sortable: true,
    cell: (row) => CellTip(row['givenName']),
    exportSelector: 'givenName',
    minWidth: '200px',
  },
  {
    selector: (row) => row['surname'],
    name: 'Surname',
    sortable: true,
    cell: (row) => CellTip(row['surname']),
    exportSelector: 'surname',
    minWidth: '200px',
  },
  {
    selector: (row) => row['accountEnabled'],
    name: 'Account Enabled',
    sortable: true,
    cell: (row) => CellTip(row['accountEnabled']),
    exportSelector: 'accountEnabled',
  },
]

const SharedMailboxEnabledAccount = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Shared Mailbox with Enabled Account"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-SharedMailboxEnabledAccount-List`,
        path: '/api/ListSharedMailboxAccountEnabled',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default SharedMailboxEnabledAccount
