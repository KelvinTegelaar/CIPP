import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { listGroups } from '../../../store/modules/groups'
import { useListUsersQuery } from '../../../store/api/users'
import { useListGroupsQuery } from '../../../store/api/groups'

const { SearchBar } = Search
const pagination = paginationFactory()

const dropdown = (cell, row, rowIndex, formatExtraData) => {
  return (
    <CDropdown>
      <CDropdownToggle color="primary">...</CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">Edit Group</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    text: 'Name',
    dataField: 'displayName',
    sort: true,
  },
  {
    text: 'Group Type',
    dataField: 'groupTypes',
    sort: true,
  },
  {
    text: 'Security Group',
    dataField: 'securityEnabled',
    sort: true,
  },
  {
    text: 'Email',
    dataField: 'mail',
    sort: true,
  },
  {
    text: 'Action',
    isDummyField: true,
    formatter: dropdown,
  },
]

const Groups = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const {
    data: groups,
    isFetching,
    error: groupsError,
  } = useListGroupsQuery({ tenantDomain: tenant?.defaultDomainName })

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Groups</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {isFetching && <CSpinner />}
        {!isFetching && groupsError && <span>Failed to load groups</span>}
        {!isFetching && !groupsError && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="displayName" columns={columns} data={groups} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                <hr />
                {/*eslint-disable */}
                <BootstrapTable
                  {...props.baseProps}
                  pagination={pagination}
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

export default Groups
