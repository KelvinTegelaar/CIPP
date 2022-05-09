import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import useQuery from 'src/hooks/useQuery'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['clientType'],
    name: 'Client Type',
    sortable: true,
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
    exportSelector: 'deviceFriendlyName',
  },
  {
    selector: (row) => row['deviceModel'],
    name: 'Model',
    sortable: true,
    exportSelector: 'deviceModel',
  },
  {
    selector: (row) => row['deviceOS'],
    name: 'OS',
    sortable: true,
    exportSelector: 'deviceOS',
  },
  {
    selector: (row) => row['deviceType'],
    name: 'Device Type',
    sortable: true,
    exportSelector: 'deviceType',
  },
  {
    selector: (row) => row['firstSync'],
    name: 'First Sync',
    sortable: true,
    exportSelector: 'firstSync',
  },
  {
    selector: (row) => row['lastSyncAttempt'],
    name: 'Last Sync Attempt',
    sortable: true,
    exportSelector: 'lastSyncAttempt',
  },
  {
    selector: (row) => row['lastSuccessSync'],
    name: 'Last Succesfull Sync',
    sortable: true,
    exportSelector: 'lastSuccessSync',
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
