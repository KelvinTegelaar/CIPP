import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const DevicesList = () => {
  const [tenantColumnSet, setTenantColumn] = useState(true)
  const tenant = useSelector((state) => state.app.currentTenant)

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      cell: (row) => CellTip(row['Tenant']),
      exportSelector: 'Tenant',
      omit: tenantColumnSet,
    },
    {
      name: 'Retrieval Status',
      selector: (row) => row['CippStatus'],
      sortable: true,
      cell: (row) => CellTip(row['CippStatus']),
      exportSelector: 'CippStatus',
      omit: tenantColumnSet,
    },
    {
      selector: (row) => row['displayName'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      selector: (row) => row['deviceOwnership'],
      name: 'Device Ownership',
      sortable: true,
      cell: (row) => CellTip(row['deviceOwnership']),
      exportSelector: 'recipientType',
    },
    {
      selector: (row) => row['enrollmentType'],
      name: 'Enrollment Type',
      sortable: true,
      exportSelector: 'enrollmentType',
    },
    {
      selector: (row) => row['manufacturer'],
      name: 'Manufacturer',
      sortable: true,
      exportSelector: 'manufacturer',
    },
    {
      selector: (row) => row['model'],
      name: 'Model',
      sortable: true,
      exportSelector: 'model',
    },
    {
      selector: (row) => row['operatingSystem'],
      name: 'OS',
      sortable: true,
      exportSelector: 'operatingSystem',
    },
    {
      selector: (row) => row['operatingSystemVersion'],
      name: 'Version',
      sortable: true,
      exportSelector: 'operatingSystemVersion',
    },
    {
      selector: (row) => row['profileType'],
      name: 'Profile Type',
      sortable: true,
      exportSelector: 'profileType',
    },
  ]
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenant.defaultDomainName, tenantColumnSet])
  return (
    <CippPageList
      title="All Devices"
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Devices-List`,
        path: '/api/ListGraphRequest',
        params: {
          TenantFilter: tenant?.defaultDomainName,
          Endpoint: 'devices',
          $format: 'application/json',
        },
        columns,
      }}
    />
  )
}

export default DevicesList
