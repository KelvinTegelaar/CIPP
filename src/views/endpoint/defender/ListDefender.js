import React from 'react'
import { useSelector } from 'react-redux'
import { cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['managedDeviceName'],
    name: 'Device Name',
    sortable: true,
    exportSelector: 'managedDeviceName',
  },
  {
    selector: (row) => row['malwareProtectionEnabled'],
    name: 'Malware Protection Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'malwareProtectionEnabled',
  },
  {
    selector: (row) => row['realTimeProtectionEnabled'],
    name: 'Real Time Protection Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'realTimeProtectionEnabled',
  },
  {
    selector: (row) => row['networkInspectionSystemEnabled'],
    name: 'Network Inspection Enabled',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'networkInspectionSystemEnabled',
  },
  {
    selector: (row) => row['managedDeviceHealthState'],
    name: 'Last reported Health State',
    sortable: true,
    exportSelector: 'managedDeviceHealthState',
  },
  {
    selector: (row) => row['quickScanOverdue'],
    name: 'Quick Scan overdue',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'quickScanOverdue',
  },
  {
    selector: (row) => row['fullScanOverdue'],
    name: 'Full Scan overdue',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'fullScanOverdue',
  },
  {
    selector: (row) => row['signatureUpdateOverdue'],
    name: 'Signature Update Required',
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'signatureUpdateOverdue',
  },
  {
    selector: (row) => row['rebootRequired'],
    name: 'Reboot Required',
    cell: cellBooleanFormatter(),
    sortable: true,
    exportSelector: 'rebootRequired',
  },
  {
    selector: (row) => row['attentionRequired'],
    name: 'Attention Required',
    cell: cellBooleanFormatter(),
    sortable: true,
    exportSelector: 'attentionRequired',
  },
]

const DefenderState = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Defender Status"
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-DefenderStatus-List`,
        path: '/api/ListDefenderState',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default DefenderState
