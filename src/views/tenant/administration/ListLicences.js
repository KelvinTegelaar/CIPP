import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const columns = [
  {
    name: 'Tenant',
    selector: (row) => row['Tenant'],
    sortable: true,
    cell: (row) => CellTip(row['Tenant']),
    wrap: true,
    exportSelector: 'Tenant',
  },
  {
    name: 'license',
    selector: (row) => row['License'],
    sortable: true,
    cell: (row) => CellTip(row['License']),
    exportSelector: 'License',
    minWidth: '300px',
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
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Licenses Report"
      tenantSelector={false}
      showAllTenantSelector={false}
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
