import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import {
  CellBytes,
  CellBytesToPercentage,
  cellBytesFormatter,
} from 'src/components/tables/CellBytes'

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
      selector: (row) => row['userPrincipalName'],
      name: 'User Prinicipal Name',
      sortable: true,
      cell: (row) => CellTip(row['userPrincipalName']),
      exportSelector: 'userPrincipalName',
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
      selector: (row) => row[' recipientType'],
      name: 'Mailbox Type',
      sortable: true,
      cell: (row) => CellTip(row['recipientType']),
      exportSelector: 'recipientType',
    },
    {
      selector: (row) => row['lastActivityDate'],
      name: 'Last Active',
      sortable: true,
      exportSelector: 'lastActivityDate',
    },
    {
      selector: (row) => row['storageUsedInBytes'],
      cell: cellBytesFormatter(),
      name: 'Used Space (GB)',
      sortable: true,
      exportSelector: 'storageUsedInBytes',
      exportFormatter: CellBytes,
    },
    {
      selector: (row) => row['prohibitSendReceiveQuotaInBytes'],
      cell: cellBytesFormatter(),
      name: 'Quota (GB)',
      sortable: true,
      exportSelector: 'prohibitSendReceiveQuotaInBytes',
      exportFormatter: CellBytes,
    },
    {
      selector: (row) =>
        Math.round((row.storageUsedInBytes / row.prohibitSendReceiveQuotaInBytes) * 100 * 10) / 10,
      name: 'Quota Used(%)',
      sortable: true,
      exportSelector: 'CippStatus',
      exportFormatter: CellBytesToPercentage,
      exportFormatterArgs: {
        value: 'storageUsedInBytes',
        dividedBy: 'prohibitSendReceiveQuotaInBytes',
      },
    },
    {
      selector: (row) => row['itemCount'],
      name: 'Item Count (Total)',
      sortable: true,
      exportSelector: 'itemCount',
    },
    {
      selector: (row) => row['hasArchive'],
      name: 'Archiving Enabled',
      sortable: true,
      cell: cellBooleanFormatter({ colourless: true }),
      exportSelector: 'hasArchive',
    },
  ]
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenant.defaultDomainName, tenantColumnSet])
  return (
    <CippPageList
      title="Mailbox Statistics"
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-MailboxStatistics-List`,
        path: '/api/ListGraphRequest',
        params: {
          TenantFilter: tenant?.defaultDomainName,
          Endpoint: "reports/getMailboxUsageDetail(period='D7')",
          $format: 'application/json',
        },
        columns,
        tableProps: {
          conditionalRowStyles: conditionalRowStyles,
        },
      }}
    />
  )
}

export default MailboxStatsList
