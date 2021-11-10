import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator'
import { listGroups } from '../../../store/modules/identity'

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
    formatter: dropdown,
  },
]

const Groups = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const groups = useSelector((state) => state.identity.groups)
  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listGroups({ tenant: tenant }))
      }
    }

    load()
  }, [])

  const action = (tenant) => {
    dispatch(listGroups({ tenant: tenant }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Groups</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!groups.loaded && groups.loading && <CSpinner />}
        {groups.loaded && !groups.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="id" columns={columns} data={groups.list} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                <hr />
                {/*eslint-disable */}
                <BootstrapTable
                  {...props.baseProps}
                  pagination={pagination}
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
