import React from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    selector: (row) => row['managedDeviceName'],
    name: 'Device Name',
    sortable: true,
    cell: (row) => CellTip(row['managedDeviceName']),
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
    cell: cellBooleanFormatter({ warning: true, reverse: true, colourless: true }),
    exportSelector: 'quickScanOverdue',
  },
  {
    selector: (row) => row['fullScanOverdue'],
    name: 'Full Scan overdue',
    sortable: true,
    cell: cellBooleanFormatter({ warning: true, reverse: true, colourless: true }),
    exportSelector: 'fullScanOverdue',
  },
  {
    selector: (row) => row['signatureUpdateOverdue'],
    name: 'Signature Update Required',
    sortable: true,
    cell: cellBooleanFormatter({ warning: true, reverse: true, colourless: true }),
    exportSelector: 'signatureUpdateOverdue',
  },
  {
    selector: (row) => row['rebootRequired'],
    name: 'Reboot Required',
    cell: cellBooleanFormatter({ warning: true, reverse: true, colourless: true }),
    sortable: true,
    exportSelector: 'rebootRequired',
  },
  {
    selector: (row) => row['attentionRequired'],
    name: 'Attention Required',
    cell: cellBooleanFormatter({ warning: true, reverse: true, colourless: true }),
    sortable: true,
    exportSelector: 'attentionRequired',
  },
]

const DefenderState = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Defender Status"
      capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-DefenderStatus-List`,
        path: '/api/ListDefenderState',
        columns,
        params: { TenantFilter: tenant?.customerId },
      }}
    />
  )
}

export default DefenderState
