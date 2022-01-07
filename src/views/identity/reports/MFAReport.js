import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CippPageList } from 'src/components/CippPage'

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
    <CippPageList
      title="MFA Report"
      datatable={{
        columns,
        path: '/api/ListMFAUsers',
        reportName: `${tenant?.defaultDomainName}-MFAReport-List`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default MFAList
