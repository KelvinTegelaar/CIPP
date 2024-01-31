import React from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '200px',
  },
  {
    selector: (row) => row['primarySmtpAddress'],
    name: 'Primary E-mail',
    sortable: true,
    cell: (row) => CellTip(row['primarySmtpAddress']),
    exportSelector: 'primarySmtpAddress',
    minWidth: '200px',
  },
  {
    selector: (row) => row['ecpenabled'],
    name: 'ECP Enabled',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    center: true,
    exportSelector: 'ecpenabled',
  },
  {
    selector: (row) => row['ewsenabled'],
    name: 'EWS Enabled',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    center: true,
    exportSelector: 'ewsenabled',
  },
  {
    selector: (row) => row['imapenabled'],
    name: 'IMAP Enabled',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    center: true,
    exportSelector: 'imapenabled',
  },
  {
    selector: (row) => row['mapienabled'],
    name: 'MAPI Enabled',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    center: true,
    exportSelector: 'mapienabled',
  },
  {
    selector: (row) => row['owaenabled'],
    name: 'OWA Enabled',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    center: true,
    exportSelector: 'owaenabled',
  },
  {
    selector: (row) => row['popenabled'],
    name: 'POP Enabled',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    center: true,
    exportSelector: 'popenabled',
  },
  {
    selector: (row) => row['activesyncenabled'],
    name: 'ActiveSync Enabled',
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
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
