import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['displayName'],
    name: 'Display Name',
    sortable: true,
  },
  {
    selector: (row) => row['mail'],
    name: 'E-Mail Address',
    sortable: true,
  },
  {
    selector: (row) => row['company'],
    name: 'Company',
    sortable: true,
  },
  {
    selector: (row) => row['onPremisesSyncEnabled'],
    name: 'On Premises Sync',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
]

const ContactList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Contacts List</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListContacts"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default ContactList
