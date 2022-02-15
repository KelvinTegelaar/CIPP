import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['UPN'],
    name: 'User Principal Name',
    sortable: true,
    exportSelector: 'UPN',
  },
  {
    selector: (row) => row['AccountEnabled'],
    name: 'Account Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'AccountEnabled',
  },
  {
    selector: (row) => row['PerUser'],
    name: 'Per user MFA Status',
    sortable: true,
    exportSelector: 'PerUser',
  },
  {
    selector: (row) => row['MFARegistration'],
    name: 'Registered for Conditional MFA',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'MFARegistration',
  },
  {
    selector: (row) => row['CoveredByCA'],
    name: 'Enforced via Conditional Access',
    sortable: true,
    exportSelector: 'CoveredByCA',
  },
  {
    selector: (row) => row['CoveredBySD'],
    name: 'Enforced via Security Defaults',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'CoveredBySD',
  },
]

const conditionalRowStyles = [
  {
    when: (row) =>
      row.AccountEnabled &&
      row.PerUser === 'Disabled' &&
      !row.MFARegistration &&
      row.CoveredByCA === 'None' &&
      !row.CoveredBySD,
    style: {
      //backgroundColor: 'var(--cui-danger)',
      //border: '2px solid var(--cui-warning)',
      //color: 'var(--cui-warning)',
    },
    classNames: ['no-mfa'],
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
        tableProps: {
          conditionalRowStyles: conditionalRowStyles,
        },
      }}
    />
  )
}

export default MFAList
