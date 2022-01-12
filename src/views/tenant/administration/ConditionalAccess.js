import React from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from '../../../components'
const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    wrap: true,
  },
  {
    name: 'State',
    selector: (row) => row['state'],
    sortable: true,
  },
  {
    name: 'Last Modified',
    selector: (row) => row['modifiedDateTime'],
    sortable: true,
  },
  {
    name: 'Client App Types',
    selector: (row) => row['clientAppTypes'],
    sortable: true,
  },
  {
    name: 'Platform Inc',
    selector: (row) => row['includePlatforms'],
    sortable: true,
  },
  {
    name: 'Platform Exc',
    selector: (row) => row['excludePlatforms'],
    sortable: true,
  },
  {
    name: 'Include Locations',
    selector: (row) => row['includeLocations'],
    sortable: true,
  },
  {
    name: 'Exclude Locations',
    selector: (row) => row['excludeLocations'],
    sortable: true,
  },
  {
    name: 'Include Users',
    selector: (row) => row['includeUsers'],
    sortable: true,
  },
  {
    name: 'Exclude Users',
    selector: (row) => row['excludeUsers'],
    sortable: true,
  },
  {
    name: 'Include Groups',
    selector: (row) => row['includeGroups'],
    sortable: true,
  },
  {
    name: 'Exclude Groups',
    selector: (row) => row['excludeGroups'],
    sortable: true,
  },
  {
    name: 'Include Applications',
    selector: (row) => row['includeApplications'],
    sortable: true,
  },
  {
    name: 'Exclude Applications',
    selector: (row) => row['excludeApplications'],
    sortable: true,
  },
  {
    name: 'Control Operator',
    selector: (row) => row['grantControlsOperator'],
    sortable: true,
  },
  {
    name: 'Built-in Controls',
    selector: (row) => row['builtInControls'],
    sortable: true,
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
