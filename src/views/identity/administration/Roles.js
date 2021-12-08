import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { listRoles } from '../../../store/modules/roles'

const { SearchBar } = Search
const pagination = paginationFactory()

const columns = [
  {
    text: 'Display Name',
    dataField: 'DisplayName',
    sort: true,
  },
  {
    text: 'Description',
    dataField: 'Description',
    sort: true,
  },
  {
    text: 'Members',
    dataField: 'Members',
    sort: false,
  },
]

const Roles = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const roles = useSelector((state) => state.roles.roles)
  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listRoles({ tenant: tenant }))
      }
    }

    load()
  }, [])

  const action = (tenant) => {
    dispatch(listRoles({ tenant: tenant }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Groups</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!roles.loaded && roles.loading && <CSpinner />}
        {roles.loaded && !roles.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="displayName" columns={columns} data={roles.list} search>
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
        {!roles.loaded && !roles.loading && roles.error && <span>Failed to load groups</span>}
      </div>
    </div>
  )
}

export default Roles
