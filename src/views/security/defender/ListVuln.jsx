import React from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['affectedDevicesCount'],
    name: '# Affected Devices',
    sortable: true,
    exportSelector: 'affectedDevicesCount',
  },
  {
    selector: (row) => row['affectedDevices'],
    name: 'Affected Devices Names',
    sortable: true,
    cell: (row) => CellTip(row['affectedDevices']),
    exportSelector: 'affectedDevices',
  },
  {
    selector: (row) => row['osPlatform'],
    name: 'Platform',
    sortable: true,
    exportSelector: 'osPlatform',
  },
  {
    selector: (row) => row['softwareVendor'],
    name: 'Vendor',
    sortable: true,
    exportSelector: 'softwareVendor',
  },
  {
    selector: (row) => row['softwareName'],
    name: 'Application Name',
    sortable: true,
    exportSelector: 'softwareName',
  },
  {
    selector: (row) => row['vulnerabilitySeverityLevel'],
    name: 'Severity',
    sortable: true,
    exportSelector: 'vulnerabilitySeverityLevel',
  },
  {
    selector: (row) => row['cvssScore'],
    name: 'CVSS Score',
    sortable: true,
    exportSelector: 'quickScanOverdue',
  },
  {
    selector: (row) => row['securityUpdateAvailable'],
    name: 'Update Available',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'securityUpdateAvailable',
  },
  {
    selector: (row) => row['exploitabilityLevel'],
    name: 'Exploit Publicly Available',
    sortable: true,
    exportSelector: 'exploitabilityLevel',
  },
  {
    selector: (row) => row['cveId'],
    name: 'CVE ID',
    sortable: true,
    exportSelector: 'cveId',
    cell: (row) => (
      <a
        href={`https://security.microsoft.com/vulnerabilities/vulnerability/${row.cveId}/recommendation?tid=${row.customerId}`}
        target="_blank"
        className="dlink"
        rel="noreferrer"
      >
        {row['cveId']}
      </a>
    ),
  },
]

const ListVuln = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Software Vulnerabilities Status"
      capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-DefenderStatus-List`,
        path: '/api/ListDefenderTVM',
        columns,
        filterlist: [
          {
            filterName: '# Affected Devices',
            filter: '"affectedDevicesCount":1',
          },
          { filterName: 'Windows 10 devices', filter: '"osPlatform":"Windows10"' },
          { filterName: 'Windows 11 devices', filter: '"osPlatform":"Windows11"' },
          { filterName: 'Vendor is Microsoft', filter: '"softwareVendor":"Microsoft"' },
          { filterName: 'High Severity', filter: '"vulnerabilitySeverityLevel":"High"' },
        ],
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default ListVuln
