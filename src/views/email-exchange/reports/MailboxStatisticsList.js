import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const MailboxStatsList = () => {
  const [tenantColumnSet, setTenantColumn] = useState(true)
  const tenant = useSelector((state) => state.app.currentTenant)
  const conditionalRowStyles = [
    {
      when: (row) => (row.UsedGB / row.QuotaGB) * 100 > 80 && (row.UsedGB / row.QuotaGB) * 100 < 90,
      classNames: ['mbusage-warning'],
    },
    {
      when: (row) =>
        (row.UsedGB / row.QuotaGB) * 100 > 90 && (row.UsedGB / row.QuotaGB) * 100 < 100,
      classNames: ['mbusage-danger'],
    },
  ]

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      cell: (row) => CellTip(row['Tenant']),
      exportSelector: 'Tenant',
      omit: tenantColumnSet,
    },
    {
      name: 'Retrieval Status',
      selector: (row) => row['CippStatus'],
      sortable: true,
      cell: (row) => CellTip(row['CippStatus']),
      exportSelector: 'CippStatus',
      omit: tenantColumnSet,
    },
    {
      selector: (row) => row['UPN'],
      name: 'User Prinicipal Name',
      sortable: true,
      cell: (row) => CellTip(row['UPN']),
      exportSelector: 'UPN',
      minWidth: '200px',
    },
    {
      selector: (row) => row['displayName'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      selector: (row) => row['MailboxType'],
      name: 'Mailbox Type',
      sortable: true,
      exportSelector: 'MailboxType',
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
      selector: (row) => row['QuotaGB'],
      name: 'Quota (GB)',
      sortable: true,
      exportSelector: 'QuotaGB',
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
      cell: cellBooleanFormatter({ colourless: true }),
      exportSelector: 'HasArchive',
    },
  ]
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenantColumnSet])
  return (
    <CippPageList
      title="Mailbox Statistics"
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-MailboxStatistics-List`,
        path: '/api/ListMailboxStatistics',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
        tableProps: {
          conditionalRowStyles: conditionalRowStyles,
        },
      }}
    />
  )
}

export default MailboxStatsList
