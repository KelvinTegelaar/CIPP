import React from 'react'
import { useSelector } from 'react-redux'
import TenantSelector from '../../../components/cipp/TenantSelector'
import CippDatatable from '../../../components/cipp/CippDatatable'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
} from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
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

const CondtionalAccessList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <TenantSelector />
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Conditional Access</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-ConditionalAccess-List`}
            path="/api/ListConditionalAccessPolicies"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default CondtionalAccessList
