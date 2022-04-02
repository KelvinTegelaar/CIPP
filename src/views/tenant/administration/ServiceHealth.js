import React from 'react'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    name: 'Tenant',
    selector: (row) => row['TenantName'],
    sortable: true,
    exportSelector: 'TenantName',
  },
  {
    name: 'Incidents Open',
    selector: (row) => row['IncidentCount'],
    sortable: true,
    exportSelector: 'IncidentCount',
  },
  {
    name: 'Advisories Open',
    selector: (row) => row['AdvisoryCount'],
    sortable: true,
    exportSelector: 'AdvisoryCount',
  },
]

const ServiceHealth = () => {
  return (
    <CippPageList
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
