import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter } from 'src/components/tables'
import { StatusIcon } from 'src/components/utilities'
const columns = [
  {
    name: 'Tenant',
    selector: (row) => row['tenantDisplayName'],
    sortable: true,
    exportSelector: 'tenantDisplayName',
  },
  {
    name: 'Device Name',
    selector: (row) => row['managedDeviceName'],
    sortable: true,
    exportSelector: 'managedDeviceName',
  },
  {
    name: 'Compliant',
    selector: (row) => row['complianceStatus'],
    sortable: true,
    cell: (row, index, column) => {
      const cell = column.selector(row)
      if (cell === 'Compliant') {
        return <StatusIcon type="finalstate" finalState="Pass" />
      }
      if (cell === 'Noncompliant') {
        return <StatusIcon type="finalstate" finalState="Fail" />
      }
      return <StatusIcon type="finalstate" finalState="Warn" />
    },
    exportSelector: 'complianceStatus',
  },
  {
    name: 'Ownership',
    selector: (row) => row['ownerType'],
    sortable: true,
    exportSelector: 'ownerType',
  },
  {
    name: 'OS',
    selector: (row) => row['osDescription'],
    sortable: true,
    exportSelector: 'osDescription',
  },
  {
    name: 'Manufacturer',
    selector: (row) => row['manufacturer'],
    sortable: true,
    exportSelector: 'manufacturer',
  },
  {
    name: 'Model',
    selector: (row) => row['model'],
    sortable: true,
    exportSelector: 'model',
  },
  {
    name: 'Last Sync',
    selector: (row) => row['lastSyncDateTime'],
    sortable: true,
    cell: cellDateFormatter(),
    exportSelector: 'lastSyncDateTime',
  },
]

const LighthouseDeviceComplianceReport = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Lighthouse - Device Compliance"
      showAllTenantSelector={true}
      datatable={{
        columns,
        path: '/api/ListAllTenantDeviceCompliance',
        reportName: `${tenant?.defaultDomainName}-Lighthouse-Device-Compliance-Report`,
        params: { TenantFilter: tenant?.customerId },
      }}
    />
  )
}

export default LighthouseDeviceComplianceReport
