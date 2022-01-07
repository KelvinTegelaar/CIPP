import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CippPageList } from 'src/components'

const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
  },
  {
    selector: (row) => row['primarySmtpAddress'],
    name: 'Primary E-mail',
    sortable: true,
  },
  {
    selector: (row) => row['ecpenabled'],
    name: 'ECP Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
  },
  {
    selector: (row) => row['ewsenabled'],
    name: 'EWS Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
  },
  {
    selector: (row) => row['imapenabled'],
    name: 'IMAP Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
  },
  {
    selector: (row) => row['mapienabled'],
    name: 'MAPI Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
  },
  {
    selector: (row) => row['owaenabled'],
    name: 'OWA Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
  },
  {
    selector: (row) => row['popenabled'],
    name: 'POP Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
  },
  {
    selector: (row) => row['activesyncenabled'],
    name: 'ActiveSync Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    center: true,
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
