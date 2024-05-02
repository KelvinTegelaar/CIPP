import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'

const PartnerRelationships = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [tenantColumnSet, setTenantColumn] = React.useState(false)
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenant.defaultDomainName, tenantColumnSet])

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row.Tenant,
      sortable: true,
      exportSelector: 'Tenant',
      omit: tenantColumnSet,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Partner',
      selector: (row) => row.TenantInfo?.displayName,
      sortable: true,
      exportSelector: 'TenantInfo/displayName',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Service Provider',
      selector: (row) => row['isServiceProvider'],
      sortable: true,
      exportSelector: 'isServiceProvider',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Multi Tenant',
      selector: (row) => row['isInMultiTenantOrganization'],
      sortable: true,
      exportSelector: 'isInMultiTenantOrganization',
      cell: cellGenericFormatter(),
    },
    {
      name: 'Partner Info',
      selector: (row) => row['TenantInfo'],
      sortable: true,
      exportSelector: 'TenantInfo',
      cell: cellGenericFormatter(),
    },
  ]
  return (
    <div>
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Partner Relationships"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `Partner-Relationships`,
          path: '/api/ListGraphRequest',
          params: {
            Endpoint: 'policies/crossTenantAccessPolicy/partners',
            ReverseTenantLookup: true,
            TenantFilter: tenant.customerId,
          },
        }}
      />
    </div>
  )
}

export default PartnerRelationships
