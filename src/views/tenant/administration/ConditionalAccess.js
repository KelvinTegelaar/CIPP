import React, { useEffect } from 'react'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import paginationFactory from 'react-bootstrap-table2-paginator'
import CellBadge from '../../../components/cipp/CellBadge'
import { useDispatch, useSelector } from 'react-redux'
import { listTenants, loadConditionalAccessPolicies } from '../../../store/modules/tenants'
import BootstrapTable from 'react-bootstrap-table-next'
import { CButton, CSpinner } from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCog } from '@coreui/icons'
import TenantSelector from '../../../components/cipp/TenantSelector'

const { SearchBar } = Search
const pagination = paginationFactory()

const columns = [
  {
    text: 'Name',
    dataField: 'displayName',
    sort: true,
  },
  {
    text: 'State',
    dataField: 'state',
    sort: true,
  },
  {
    text: 'Last Modified',
    dataField: 'modifiedDateTime',
    sort: true,
  },
  {
    text: 'Client App Types',
    dataField: 'clientAppTypes',
    sort: true,
  },
  {
    text: 'Platform Inc',
    dataField: 'includePlatforms',
    sort: true,
  },
  {
    text: 'Platform Exc',
    dataField: 'excludePlatforms',
    sort: true,
  },
  {
    text: 'Include Locations',
    dataField: 'includeLocations',
    sort: true,
  },
  {
    text: 'Exclude Locations',
    dataField: 'excludeLocations',
    sort: true,
  },
  {
    text: 'Include Users',
    dataField: 'includeUsers',
    sort: true,
  },
  {
    text: 'Exclude Users',
    dataField: 'excludeUsers',
    sort: true,
  },
  {
    text: 'Include Groups',
    dataField: 'includeGroups',
    sort: true,
  },
  {
    text: 'Exclude Groups',
    dataField: 'excludeGroups',
    sort: true,
  },
  {
    text: 'Include Applications',
    dataField: 'includeApplications',
    sort: true,
  },
  {
    text: 'Exclude Applications',
    dataField: 'excludeApplications',
    sort: true,
  },
  {
    text: 'Control Operator',
    dataField: 'grantControlsOperator',
    sort: true,
  },
  {
    text: 'Built-in Controls',
    dataField: 'builtInControls',
    sort: true,
  },
]

const ConditionalAccess = () => {
  const dispatch = useDispatch()
  const {
    tenant,
    cap: { policies, loading, loaded },
  } = useSelector((state) => state.tenants)

  const tenantSelected = tenant && tenant.defaultDomainName

  useEffect(() => {
    if (tenantSelected) {
      dispatch(loadConditionalAccessPolicies({ domain: tenantSelected.defaultDomainName }))
    }
  }, [])

  const action = (selected) =>
    dispatch(loadConditionalAccessPolicies({ domain: selected.defaultDomainName }))

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Conditional Access Policies</h3>
        {!loaded && loading && <CSpinner />}
        {loaded && !loading && (
          <ToolkitProvider keyField="displayName" columns={columns} data={policies} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                <hr />
                {/*eslint-disable */}
                <BootstrapTable
                  {...props.baseProps}
                  pagination={pagination}
                  striped
                  wrapperClasses="table-responsive"
                />
                {/*eslint-enable */}
              </div>
            )}
          </ToolkitProvider>
        )}
      </div>
    </div>
  )
}

export default ConditionalAccess
