import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['serialNumber'],
    name: 'User Principal Name',
    sortable: true,
  },
  {
    selector: (row) => row['model'],
    name: 'Account Enabled',
    sortable: true,
  },
  {
    selector: (row) => row['manufacturer'],
    name: 'Per user MFA Status',
    sortable: true,
  },
  {
    selector: (row) => row['groupTag'],
    name: 'Registered for Conditional MFA',
    sortable: true,
  },
  {
    selector: (row) => row['enrollmentState'],
    name: 'Enforced via Conditional Access',
    sortable: true,
  },
  {
    selector: (row) => row['enrollmentState'],
    name: 'Enforced via Security Defaults',
    sortable: true,
  },
]

const MFAList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Multi Facor Authentication Report</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          keyField="id"
          reportName={`${tenant?.defaultDomainName}-Autopilot-List`}
          path="/api/ListMFAUsers"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default MFAList
