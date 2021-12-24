import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { cellBooleanFormatter } from '../../../components/cipp'
import {
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
} from '@coreui/react'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['UPN'],
    name: 'User Principal Name',
    sortable: true,
  },
  {
    selector: (row) => row['AccountEnabled'],
    name: 'Account Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['PerUser'],
    name: 'Per user MFA Status',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['MFARegistration'],
    name: 'Registered for Conditional MFA',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['CoveredByCA'],
    name: 'Enforced via Conditional Access',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    selector: (row) => row['CoveredBySD'],
    name: 'Enforced via Security Defaults',
    sortable: true,
    cell: cellBooleanFormatter(),
  },
]

const MFAList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">MFA Report</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-MFAReport-List`}
            path="/api/ListMFAUsers"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default MFAList
