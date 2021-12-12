import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'

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
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Basic Auth Report</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          reportName={`${tenant?.defaultDomainName}-Basic-Auth-Report`}
          path="/api/ListBasicAuth"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default BasicAuthReport
