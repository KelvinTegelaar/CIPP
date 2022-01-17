import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    selector: (row) => row['primarySmtpAddress'],
    name: 'Primary E-mail',
    sortable: true,
    exportSelector: 'primarySmtpAddress',
  },
  {
    selector: (row) => row['ecpenabled'],
    name: 'ECP Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
    exportSelector: 'ecpenabled',
  },
  {
    selector: (row) => row['ewsenabled'],
    name: 'EWS Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
    exportSelector: 'ewsenabled',
  },
  {
    selector: (row) => row['imapenabled'],
    name: 'IMAP Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
    exportSelector: 'imapenabled',
  },
  {
    selector: (row) => row['mapienabled'],
    name: 'MAPI Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
    exportSelector: 'mapienabled',
  },
  {
    selector: (row) => row['owaenabled'],
    name: 'OWA Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
    exportSelector: 'owaenabled',
  },
  {
    selector: (row) => row['popenabled'],
    name: 'POP Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
    exportSelector: 'popenabled',
  },
  {
    selector: (row) => row['activesyncenabled'],
    name: 'ActiveSync Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
    exportSelector: 'activesyncenabled',
  },
]

const MailboxCASList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Mailbox Client Access Settings"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-ClientAccessSettings-List`,
        path: '/api/ListMailboxCAS',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default MailboxCASList
