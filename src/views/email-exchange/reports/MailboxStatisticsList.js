import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['UPN'],
    name: 'User Prinicipal Name',
    sortable: true,
    exportSelector: 'UPN',
  },
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['LastActive'],
    name: 'Last Active',
    sortable: true,
    exportSelector: 'LastActive',
  },
  {
    selector: (row) => row['UsedGB'],
    name: 'Used Space(GB)',
    sortable: true,
    exportSelector: 'UsedGB',
  },
  {
    selector: (row) => row['ItemCount'],
    name: 'Item Count (Total)',
    sortable: true,
    exportSelector: 'ItemCount',
  },
  {
    selector: (row) => row['HasArchive'],
    name: 'Archiving Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'HasArchive',
  },
]

const MailboxStatsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Mailbox Statistics"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-MailboxStatistics-List`,
        path: '/api/ListMailboxStatistics',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default MailboxStatsList
