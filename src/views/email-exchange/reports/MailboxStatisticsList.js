import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CippPageList } from 'src/components'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['UPN'],
    name: 'User Prinicipal Name',
    sortable: true,
  },
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
  },
  {
    selector: (row) => row['LastActive'],
    name: 'Last Active',
    sortable: true,
  },
  {
    selector: (row) => row['UsedGB'],
    name: 'Used Space(GB)',
    sortable: true,
  },
  {
    selector: (row) => row['ItemCount'],
    name: 'Item Count (Total)',
    sortable: true,
  },
  {
    selector: (row) => row['HasArchive'],
    name: 'Archiving Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
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
