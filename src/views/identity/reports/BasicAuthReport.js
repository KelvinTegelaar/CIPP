import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
const columns = [
  {
    name: 'User Principal Name',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'Basic Auth',
    selector: (row) => row['clientAppUsed'],
    sortable: true,
    exportSelector: 'clientAppUsed',
  },
]

const BasicAuthReport = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Basic Auth Report"
      datatable={{
        columns,
        path: '/api/ListBasicAuth',
        reportName: `${tenant?.defaultDomainName}-Basic-Auth-Report`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default BasicAuthReport
