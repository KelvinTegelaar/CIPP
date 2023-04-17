import React from 'react'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const columns = [
  {
    name: 'Tenant',
    selector: (row) => row['TenantName'],
    sortable: true,
    exportSelector: 'TenantName',
  },
  {
    name: 'ID',
    selector: (row) => row['issueId'],
    sortable: true,
    exportSelector: 'issueId',
  },
  {
    name: 'Service',
    selector: (row) => row['service'],
    sortable: true,
    exportSelector: 'service',
  },
  {
    name: 'Type',
    selector: (row) => row['type'],
    sortable: true,
    exportSelector: 'type',
  },
  {
    name: 'Description',
    selector: (row) => row['desc'],
    sortable: true,
    cell: (row) => CellTip(row['desc']),
    exportSelector: 'desc',
  },
]

const ServiceHealth = () => {
  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Service Health"
      tenantSelector={false}
      datatable={{
        columns,
        path: '/api/ListServiceHealth',
        reportName: `Service-Health-Report`,
      }}
    />
  )
}

export default ServiceHealth
