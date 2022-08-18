import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const MailboxRuleList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const columns = [
    {
      selector: (row) => row['Tenant'],
      name: 'Tenant',
      sortable: true,
      exportSelector: 'Tenant',
      cell: (row) => CellTip(row['Tenant']),
    },
    {
      selector: (row) => row['Name'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['Name']),
      exportSelector: 'Name',
    },
    {
      selector: (row) => row['Description'],
      name: 'Description',
      sortable: true,
      cell: (row) => CellTip(row['Description']),
      exportSelector: 'Description',
    },
    {
      selector: (row) => row['MailboxOwnerId'],
      name: 'Mailbox',
      sortable: true,
      exportSelector: 'MailboxOwnerId',
      maxWidth: '150px',
    },
    {
      selector: (row) => row['ForwardTo'],
      name: 'Forwards To',
      sortable: true,
      exportSelector: 'ForwardTo',
    },
  ]

  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Mailbox Rules"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Mailbox-List`,
        path: '/api/ListMailboxRules',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default MailboxRuleList
