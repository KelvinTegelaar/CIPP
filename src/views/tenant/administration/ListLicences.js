import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
    wrap: true,
    exportSelector: 'Tenant',
  },
  {
    name: 'license',
    selector: (row) => row['License'],
    sortable: true,
    exportSelector: 'License',
  },
  {
    name: 'Used',
    selector: (row) => row['CountUsed'],
    sortable: true,
    exportSelector: 'CountUsed',
  },
  {
    name: 'Available',
    selector: (row) => row['CountAvailable'],
    sortable: true,
    exportSelector: 'CountAvailable',
  },
  {
    name: 'Total',
    selector: (row) => row['TotalLicenses'],
    sortable: true,
    exportSelector: 'TotalLicenses',
  },
]

const LicenseList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Licenses Report"
      tenantSelector={true}
      showAllTenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-licenses`,
        path: '/api/ListLicenses',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default LicenseList
