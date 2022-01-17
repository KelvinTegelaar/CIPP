import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

const OneDriveList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sort: true,
      exportSelector: 'displayName',
    },
    {
      name: 'UPN',
      selector: (row) => row['UPN'],
      sort: true,
      exportSelector: 'UPN',
    },
    {
      name: 'Last Active',
      selector: (row) => row['LastActive'],
      sort: true,
      exportSelector: 'LastActive',
    },
    {
      name: 'File Count (Total)',
      selector: (row) => row['FileCount'],
      sort: true,
      exportSelector: 'FileCount',
    },
    {
      name: 'Used (GB)',
      selector: (row) => row['UsedGB'],
      sort: true,
      exportSelector: 'UsedGB',
    },
    {
      name: 'Allocated (GB)',
      selector: (row) => row['Allocated'],
      sort: true,
      exportSelector: 'Allocated',
    },
  ]
  return (
    <CippPageList
      title="OneDrive List"
      datatable={{
        columns,
        path: '/api/ListSites?type=OneDriveUsageAccount',
        reportName: `${tenant?.defaultDomainName}-OneDrive-Report`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default OneDriveList
