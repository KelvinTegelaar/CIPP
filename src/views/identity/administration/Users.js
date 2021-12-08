import React, { useEffect } from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CSpinner } from '@coreui/react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider, { Search } from 'react-bootstrap-table2-toolkit'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { cilSettings, cilUser } from '@coreui/icons'
import CIcon from '@coreui/icons-react'

import { listUsers } from '../../../store/modules/users'
import CellBoolean from '../../../components/cipp/CellBoolean'

const { SearchBar } = Search

const pagination = paginationFactory()

const dropdown = (cell, row, rowIndex, formatExtraData) => {
  return (
    <CDropdown>
      <CDropdownToggle color="primary">...</CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">
          <Link
            className="dropdown-item"
            to={`/identity/administration/users/view?userId=${row.id}&tenantDomain=${row.primDomain}`}
          >
            <CIcon icon={cilUser} className="me-2" />
            View User
          </Link>
        </CDropdownItem>
        <CDropdownItem href="#">
          <Link
            className="dropdown-item"
            to={`/identity/administration/users/edit?userId=${row.id}&tenantDomain=${row.primDomain}`}
          >
            <CIcon icon={cilSettings} className="me-2" />
            Edit User
          </Link>
        </CDropdownItem>
        <CDropdownItem href="#">Send MFA Push To User</CDropdownItem>
        <CDropdownItem href="#">Convert To Shared</CDropdownItem>
        <CDropdownItem href="#">Block Sign-in</CDropdownItem>
        <CDropdownItem href="#">Reset Password</CDropdownItem>
        <CDropdownItem href="#">Delete User</CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

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
    formatter: (cell) => CellBoolean({ cell }),
    sort: true,
  },
  {
    text: 'On Premise Sync',
    dataField: 'onPremisesSyncEnabled',
    formatter: (cell) => CellBoolean({ cell }),
    sort: true,
  },
  {
    text: 'Licenses',
    dataField: 'LicJoined',
  },
  {
    text: 'Action',
    formatter: dropdown,
  },
]

const Users = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const users = useSelector((state) => state.users.users)

  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(listUsers({ tenant: tenant }))
      }
    }

    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const action = (tenant) => {
    dispatch(listUsers({ tenant: tenant }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Users</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!users.loading && users.error && <span>Error loading users</span>}
        {!users.loaded && users.loading && <CSpinner />}
        {users.loaded && !users.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="displayName" columns={columns} data={users.list} search>
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

export default Users
