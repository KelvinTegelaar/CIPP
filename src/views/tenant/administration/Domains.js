import React from 'react'
import { useSelector } from 'react-redux'
import { TenantSelector } from 'src/components/utilities'
import { CippDatatable } from 'src/components/tables'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    exportSelector: 'displayName',
  },
  {
    name: 'State',
    selector: (row) => row['state'],
    sortable: true,
    exportSelector: 'state',
  },
  {
    name: 'Last Modified',
    selector: (row) => row['modifiedDateTime'],
    sortable: true,
    exportSelector: 'modifiedDateTime',
  },
  {
    name: 'Client App Types',
    selector: (row) => row['clientAppTypes'],
    sortable: true,
    exportSelector: 'clientAppTypes',
  },
  {
    name: 'Platform Inc',
    selector: (row) => row['includePlatforms'],
    sortable: true,
    exportSelector: 'includePlatforms',
  },
  {
    name: 'Platform Exc',
    selector: (row) => row['excludePlatforms'],
    sortable: true,
    exportSelector: 'excludePlatforms',
  },
  {
    name: 'Include Locations',
    selector: (row) => row['includeLocations'],
    sortable: true,
    exportSelector: 'includeLocations',
  },
  {
    name: 'Exclude Locations',
    selector: (row) => row['excludeLocations'],
    sortable: true,
    exportSelector: 'excludeLocations',
  },
  {
    name: 'Include Users',
    selector: (row) => row['includeUsers'],
    sortable: true,
    exportSelector: 'includeUsers',
  },
  {
    name: 'Exclude Users',
    selector: (row) => row['excludeUsers'],
    sortable: true,
    exportSelector: 'excludeUsers',
  },
  {
    name: 'Include Groups',
    selector: (row) => row['includeGroups'],
    sortable: true,
    exportSelector: 'includeGroups',
  },
  {
    name: 'Exclude Groups',
    selector: (row) => row['excludeGroups'],
    sortable: true,
    exportSelector: 'excludeGroups',
  },
  {
    name: 'Include Applications',
    selector: (row) => row['includeApplications'],
    sortable: true,
    exportSelector: 'includeApplications',
  },
  {
    name: 'Exclude Applications',
    selector: (row) => row['excludeApplications'],
    sortable: true,
    exportSelector: 'excludeApplications',
  },
  {
    name: 'Control Operator',
    selector: (row) => row['grantControlsOperator'],
    sortable: true,
    exportSelector: 'grantControlsOperator',
  },
  {
    name: 'Built-in Controls',
    selector: (row) => row['builtInControls'],
    sortable: true,
    exportSelector: 'builtInControls',
  },
]

const RolesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Domains</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-Domains-List`}
            path="/api/ListAPDevices"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default RolesList
