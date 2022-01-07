import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components'

//TODO: Add CellBoolean
const columns = [
  {
    selector: (row) => row['clientType'],
    name: 'Client Type',
    sortable: true,
  },
  {
    selector: (row) => row['clientVersion'],
    name: 'Client Version',
    sortable: true,
  },
  {
    selector: (row) => row['deviceAccessState'],
    name: 'Access State',
    sortable: true,
  },
  {
    selector: (row) => row['deviceFriendlyName'],
    name: 'Friendly Name',
    sortable: true,
  },
  {
    selector: (row) => row['deviceModel'],
    name: 'Model',
    sortable: true,
  },
  {
    selector: (row) => row['deviceOS'],
    name: 'OS',
    sortable: true,
  },
  {
    selector: (row) => row['deviceType'],
    name: 'Device Type',
    sortable: true,
  },
  {
    selector: (row) => row['firstSync'],
    name: 'First Sync',
    sortable: true,
  },
  {
    selector: (row) => row['lastSyncAttempt'],
    name: 'Last Sync Attempt',
    sortable: true,
  },
  {
    selector: (row) => row['lastSuccessSync'],
    name: 'Last Succesfull Sync',
    sortable: true,
  },
  {
    selector: (row) => row['status'],
    name: 'Status',
    sortable: true,
  },
]

const MobileDeviceList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Mobile Devices"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-MobileDevices-List`,
        path: '/api/ListMailboxMobileDevices',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default MobileDeviceList
