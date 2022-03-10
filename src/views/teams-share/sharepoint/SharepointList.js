import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    name: 'UPN',
    selector: (row) => row['UPN'],
    sortable: true,
    exportSelector: 'UPN',
  },
  {
    name: 'Last Active',
    selector: (row) => row['LastActive'],
    sortable: true,
    exportSelector: 'LastActive',
  },
  {
    name: 'File Count (Total)',
    selector: (row) => row['FileCount'],
    sortable: true,
    exportSelector: 'FileCount',
  },
  {
    name: 'Used (GB)',
    selector: (row) => row['UsedGB'],
    sortable: true,
    exportSelector: 'UsedGB',
  },
  {
    name: 'Allocated (GB)',
    selector: (row) => row['Allocated'],
    sortable: true,
    exportSelector: 'Allocated',
  },
]

const SharepointList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Sharepoint List"
      datatable={{
        columns,
        path: '/api/ListSites?type=SharePointSiteUsage',
        reportName: `${tenant?.defaultDomainName}-Sharepoint-List`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default SharepointList
