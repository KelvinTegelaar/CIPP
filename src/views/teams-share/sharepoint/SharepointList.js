import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from 'src/components/utilities/TenantSelector'
import CippDatatable from 'src/components/tables/CippDatatable'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sort: true,
    exportSelector: 'displayName',
  },
  {
    name: 'UPN',
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
    name: 'File Count (Total)',
    selector: (row) => row['FileCount'],
    sort: true,
    exportSelector: 'FileCount',
  },
  {
    name: 'Used (GB)',
    selector: (row) => row['UsedGB'],
    sort: true,
    exportSelector: 'UsedGB',
  },
  {
    name: 'Allocated (GB)',
    selector: (row) => row['Allocated'],
    sort: true,
    exportSelector: 'Allocated',
  },
]

const SharepointList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Sharepoint List</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-Sharepoint-List`}
            path="/api/ListSites?type=SharePointSiteUsage"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default SharepointList
