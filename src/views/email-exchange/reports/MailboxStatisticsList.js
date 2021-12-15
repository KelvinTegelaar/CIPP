import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'

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
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Mailbox Statistics</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListMailboxStatistics"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default MailboxStatsList
