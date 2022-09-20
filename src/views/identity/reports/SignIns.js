import { CLink } from '@coreui/react'
import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
const columns = [
  {
    name: 'Date',
    selector: (row) => row['createdDateTime'],
    sortable: true,
    exportSelector: 'createdDateTime',
  },
  {
    name: 'User Principal Name',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'Application Name',
    selector: (row) => row['clientAppUsed'],
    sortable: true,
    exportSelector: 'clientAppUsed',
  },
  {
    name: 'Authentication Requirements',
    selector: (row) => row['authenticationRequirement'],
    sortable: true,
    exportSelector: 'authenticationRequirement',
  },
  {
    name: 'Failure Reason',
    selector: (row) => row.status?.errorCode,
    sortable: true,
    exportSelector: 'status',
    cell: (row) => {
      return (
        <CLink
          target="_blank"
          href={`https://login.microsoftonline.com/error?code=${row.status?.errorCode}`}
        >
          {row.status?.errorCode}
        </CLink>
      )
    },
  },
  {
    name: 'Additional Details',
    selector: (row) => row.status?.additionalDetails,
    sortable: true,
    exportSelector: 'status',
  },
  {
    name: 'Location',
    selector: (row) => `${row.location?.city} - ${row.location?.countryOrRegion}`,
    sortable: true,
    exportSelector: 'status',
  },
]

const SignInsReport = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Sign Ins Report (last 30 days)"
      capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
      datatable={{
        columns: columns,
        path: '/api/ListSignIns',
        reportName: `${tenant?.defaultDomainName}-SignIns-Report`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default SignInsReport
