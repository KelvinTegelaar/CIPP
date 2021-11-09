import React, { useEffect } from 'react'
import { CSpinner } from '@coreui/react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit'
import paginationFactory, { PaginationProvider } from 'react-bootstrap-table2-paginator'
import { useDispatch, useSelector } from 'react-redux'

import { listUsers } from '../../../store/modules/users'

const { SearchBar } = Search

const pagination = paginationFactory()

const columns = [
  {
    text: 'Display Name',
    dataField: 'displayName',
    sort: true,
  },
  {
    text: 'Email',
    dataField: 'mail',
    sort: true,
  },
  {
    text: 'User Type',
    dataField: 'userType',
    sort: true,
  },
  {
    text: 'Account Enabled',
    dataField: 'accountEnabled',
    sort: true,
  },
  {
    text: 'On Premise Sync',
    dataField: 'onPremisesSyncEnabled',
    sort: true,
  },
  {
    text: 'Licenses',
    dataField: 'LicJoined',
  },
]

const selectRow = {
  mode: 'checkbox',
  clickToSelect: true,
  selectColumnPosition: 'right',
}

const Users = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const users = useSelector((state) => state.users)
  useEffect(() => {
    async function load() {
      if (tenant) {
        dispatch(listUsers({ tenant: tenant }))
      }
    }

    load()
  }, [])

  return (
    <div>
      <TenantSelector />
      <hr />
      {!users.loaded && users.loading && <CSpinner />}
      {users.loaded && !users.loading && (
        <div className="bg-white rounded p-5">
          <ToolkitProvider keyField="id" columns={columns} data={users.users} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                <hr />
                {/*eslint-disable */}
                <BootstrapTable
                  {...props.baseProps}
                  pagination={pagination}
                  selectRow={selectRow}
                />
                {/*eslint-enable */}
              </div>
            )}
          </ToolkitProvider>
        </div>
      )}
    </div>
  )
}

export default Users
