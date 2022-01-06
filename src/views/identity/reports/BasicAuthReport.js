import React from 'react'
import { useSelector } from 'react-redux'
import { CippPage } from 'src/components/CippPage'
import CippDatatable from 'src/components/cipp/CippDatatable'
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
    <CippPage title="Basic Auth Report">
      {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
      <CippDatatable
        reportName={`${tenant?.defaultDomainName}-Basic-Auth-Report`}
        path="/api/ListBasicAuth"
        columns={columns}
        params={{ TenantFilter: tenant?.defaultDomainName }}
      />
    </CippPage>
  )
}

export default BasicAuthReport
