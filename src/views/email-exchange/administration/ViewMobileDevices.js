import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import useQuery from 'src/hooks/useQuery'
import { CellTip, cellDateFormatter } from 'src/components/tables'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['clientType'],
    name: 'Client Type',
    sortable: true,
    cell: (row) => CellTip(row['clientType']),
    exportSelector: 'clientType',
  },
  {
    selector: (row) => row['clientVersion'],
    name: 'Client Version',
    sortable: true,
    exportSelector: 'clientVersion',
  },
  {
    selector: (row) => row['deviceAccessState'],
    name: 'Access State',
    sortable: true,
    exportSelector: 'deviceAccessState',
  },
  {
    selector: (row) => row['deviceFriendlyName'],
    name: 'Friendly Name',
    sortable: true,
    cell: (row) => CellTip(row['deviceFriendlyName']),
    exportSelector: 'deviceFriendlyName',
  },
  {
    selector: (row) => row['deviceModel'],
    name: 'Model',
    sortable: true,
    cell: (row) => CellTip(row['deviceModel']),
    exportSelector: 'deviceModel',
  },
  {
    selector: (row) => row['deviceOS'],
    name: 'OS',
    sortable: true,
    cell: (row) => CellTip(row['deviceOS']),
    exportSelector: 'deviceOS',
  },
  {
    selector: (row) => row['deviceType'],
    name: 'Device Type',
    sortable: true,
    cell: (row) => CellTip(row['deviceType']),
    exportSelector: 'deviceType',
  },
  {
    selector: (row) => row['firstSync'],
    name: 'First Sync',
    sortable: true,
    exportSelector: 'firstSync',
    cell: cellDateFormatter(),
  },
  {
    selector: (row) => row['lastSyncAttempt'],
    name: 'Last Sync Attempt',
    sortable: true,
    exportSelector: 'lastSyncAttempt',
    cell: cellDateFormatter(),
  },
  {
    selector: (row) => row['lastSuccessSync'],
    name: 'Last Succesfull Sync',
    sortable: true,
    exportSelector: 'lastSuccessSync',
    cell: cellDateFormatter(),
  },
  {
    selector: (row) => row['status'],
    name: 'Status',
    sortable: true,
    exportSelector: 'status',
  },
]

const MobileDeviceList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  let query = useQuery()
  const userId = query.get('userId')
  return (
    <CippPageList
      tenantSelector={false}
      title="Mobile Devices"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-MobileDevices-List`,
        path: '/api/ListMailboxMobileDevices',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName, mailbox: userId },
      }}
    />
  )
}

export default MobileDeviceList
