import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/utilities/TenantSelector'
import CippDatatable from '../../../components/tables/CippDatatable'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'

const columns = [
  {
    name: 'User Prinicipal Name',
    selector: (row) => row['UPN'],
    sort: true,
    exportSelector: 'UPN',
  },
  {
    name: 'Last Active',
    selector: (row) => row['LastActive'],
    sort: true,
    exportSelector: 'LastActive',
  },
  {
    name: 'Meeting Count',
    selector: (row) => row['MeetingCount'],
    sort: true,
    exportSelector: 'MeetingCount',
  },
  {
    name: 'Call Count',
    selector: (row) => row['CallCount'],
    sort: true,
    exportSelector: 'CallCount',
  },
  {
    name: 'Chat Count',
    selector: (row) => row['TeamsChat'],
    sort: true,
    exportSelector: 'TeamsChat',
  },
]

const TeamsActivityList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Teams Activity List</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-TeamActivity-List`}
            path="/api/ListTeamsActivity?type=TeamsUserActivityUser"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default TeamsActivityList
