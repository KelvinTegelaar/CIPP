import { CLink } from '@coreui/react'
import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'
const reverseSort = (rowA, rowB) => {
  const a = rowA.createdDateTime.toLowerCase()
  const b = rowB.createdDateTime.toLowerCase()

  if (a > b) {
    return -1
  }

  if (b > a) {
    return 1
  }

  return 0
}

const columns = [
  {
    name: 'Date',
    selector: (row) => row['createdDateTime'],
    sortable: true,
    exportSelector: 'createdDateTime',
    sortFunction: reverseSort,
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
    selector: (row) => row.errorCode,
    sortable: true,
    exportSelector: 'errorCode',
    cell: (row) => {
      return (
        <CLink
          target="_blank"
          href={`https://login.microsoftonline.com/error?code=${row.errorCode}`}
        >
          {row.status?.errorCode}
        </CLink>
      )
    },
  },
  {
    name: 'Additional Details',
    selector: (row) => row.additionalDetails,
    sortable: true,
    exportSelector: 'additionalDetails',
    cell: (row) => CellTip(row['additionalDetails']),
  },
  {
    name: 'Location',
    selector: (row) => row.locationcipp,
    sortable: true,
    exportSelector: 'locationcipp',
    cell: (row) => CellTip(row['locationcipp']),
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
