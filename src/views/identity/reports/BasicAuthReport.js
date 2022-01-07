import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/CippPage'
const columns = [
  {
    name: 'User Principal Name',
    selector: (row) => row['UPN'],
    sortable: true,
  },
  {
    name: 'Basic Auth',
    selector: (row) => row['BasicAuth'],
    sortable: true,
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
