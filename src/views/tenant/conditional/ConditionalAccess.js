import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    wrap: true,
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

const ConditionalAccessList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Conditional Access"
      tenantSelector={true}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-ConditionalAccess-List`,
        path: '/api/ListConditionalAccessPolicies',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default ConditionalAccessList
