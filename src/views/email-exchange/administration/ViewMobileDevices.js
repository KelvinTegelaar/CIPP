import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'

import useQuery from 'src/hooks/useQuery'

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
  let query = useQuery()
  const userId = query.get('UserID')
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Mobile Devices</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName} Mailbox list`}
            path="/api/ListMailboxMobileDevices"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName, mailbox: userId }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default MobileDeviceList
