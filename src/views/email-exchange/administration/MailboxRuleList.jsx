import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'

const MailboxRuleList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const columns = [
    {
      selector: (row) => row?.Tenant,
      name: 'Tenant',
      sortable: true,
      exportSelector: 'Tenant',
      maxWidth: '150px',
      cell: cellGenericFormatter(),
    },
    {
      selector: (row) => row?.UserPrincipalName,
      name: 'User Principal Name',
      sortable: true,
      exportSelector: 'UserPrincipalName',
      maxWidth: '200px',
      cell: cellGenericFormatter(),
    },
    {
      selector: (row) => row?.Enabled,
      name: 'Enabled',
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Enabled',
      maxWidth: '50px',
    },
    {
      selector: (row) => row?.Name,
      name: 'Display Name',
      sortable: true,
      cell: cellGenericFormatter(),
      maxWidth: '200px',
      exportSelector: 'Name',
    },
    {
      selector: (row) => row?.Description,
      name: 'Description',
      sortable: true,
      cell: cellGenericFormatter(),
      exportSelector: 'Description',
    },
    {
      selector: (row) => row?.MailboxOwnerId,
      name: 'Mailbox',
      sortable: true,
      exportSelector: 'MailboxOwnerId',
      maxWidth: '150px',
      cell: cellGenericFormatter(),
    },
    {
      selector: (row) => row?.ForwardTo,
      name: 'Forwards To',
      sortable: true,
      exportSelector: 'ForwardTo',
      cell: cellGenericFormatter(),
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
