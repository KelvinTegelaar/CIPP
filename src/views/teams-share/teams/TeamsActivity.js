import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    name: 'User Prinicipal Name',
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
    name: 'Meeting Count',
    selector: (row) => row['MeetingCount'],
    sort: true,
    exportSelector: 'MeetingCount',
  },
  {
    name: 'Call Count',
    selector: (row) => row['CallCount'],
    sort: true,
    exportSelector: 'CallCount',
  },
  {
    name: 'Chat Count',
    selector: (row) => row['TeamsChat'],
    sort: true,
    exportSelector: 'TeamsChat',
  },
]

const TeamsActivityList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Teams Activity List"
      datatable={{
        columns,
        path: '/api/ListTeamsActivity?type=TeamsUserActivityUser',
        reportName: `${tenant?.defaultDomainName}-TeamsActivity-List`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default TeamsActivityList
