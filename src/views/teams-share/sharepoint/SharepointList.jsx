import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const columns = [
  {
    name: 'URL',
    selector: (row) => row['URL'],
    sortable: true,
    cell: (row) => CellTip(row['URL']),
    exportSelector: 'URL',
  },
  {
    name: 'Owner',
    selector: (row) => row['displayName'],
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    maxWidth: '300px',
  },
  {
    name: 'Last Active',
    selector: (row) => row['LastActive'],
    sortable: true,
    exportSelector: 'LastActive',
    maxWidth: '120px',
  },
  {
    name: 'File Count (Total)',
    selector: (row) => row['FileCount'],
    sortable: true,
    exportSelector: 'FileCount',
    maxWidth: '120px',
  },
  {
    name: 'Used (GB)',
    selector: (row) => row['UsedGB'],
    sortable: true,
    exportSelector: 'UsedGB',
    maxWidth: '120px',
  },
  {
    name: 'Allocated (GB)',
    selector: (row) => row['Allocated'],
    sortable: true,
    exportSelector: 'Allocated',
    maxWidth: '70px',
  },
  {
    name: 'Root Template',
    selector: (row) => row['Template'],
    sortable: true,
    cell: (row) => CellTip(row['Template']),
    exportSelector: 'Template',
    maxWidth: '200px',
  },
]

const SharepointList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="SharePoint List"
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
