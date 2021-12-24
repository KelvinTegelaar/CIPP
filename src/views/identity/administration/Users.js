import React from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router-dom'
import { faUser, faCog, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippDatatable, cellBooleanFormatter } from '../../../components/cipp'
import { setModalContent } from 'src/store/features/modal'

const Dropdown = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const dispatch = useDispatch()
  const handleDropdownEvent = (apiurl, message) => {
    dispatch(
      setModalContent({
        componentType: 'confirm',
        title: 'Confirm',
        body: <div>{message}</div>,
        //onConfirm: () => USeLazyGenericGet? or something...(apiurl),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
        visible: true,
      }),
    )
  }

  return (
    <CDropdown style={{ position: 'fixed', zIndex: 1000 }}>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem href="#">
          <Link
            className="dropdown-item"
            to={`/identity/administration/users/view?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
          >
            <FontAwesomeIcon icon={faUser} className="me-2" />
            View User
          </Link>
        </CDropdownItem>
        <CDropdownItem href="#">
          <Link
            className="dropdown-item"
            to={`/identity/administration/users/edit?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
          >
            <FontAwesomeIcon icon={faCog} className="me-2" />
            Edit User
          </Link>
        </CDropdownItem>
        <CDropdownItem href="#">
          <Link className="dropdown-item" to={`/identity/administration/ViewBec`}>
            <FontAwesomeIcon icon={faUser} className="me-2" />
            Research Compromised Account
          </Link>
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              'api/test',
              `Are you sure you want to send a multifactor push to ${row.displayName}?`,
            )
          }
          href="#"
        >
          Send MFA Push To User
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              'api/test',
              `Are you sure you want to convert ${row.displayName} to a shared mailbox?`,
            )
          }
          href="#"
        >
          Convert To Shared
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              'api/test',
              `Are you sure you want to block sign in for ${row.displayName}?`,
            )
          }
          href="#"
        >
          Block Sign-in
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              'api/test',
              `Are you sure you want to reset the password for ${row.displayName}?`,
            )
          }
          href="#"
        >
          Reset Password (Must Change)
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              'api/test',
              `Are you sure you want to reset the password for ${row.displayName}?`,
            )
          }
          href="#"
        >
          Reset Password
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent('api/test', `Are you sure you want to delete ${row.displayName}?`)
          }
          href="#"
        >
          Delete User
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    sortable: true,
    exportselector: 'displayName',
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
    exportselector: 'mail',
  },
  {
    name: 'User Type',
    selector: (row) => row['userType'],
    sortable: true,
    exportselector: 'userType',
  },
  {
    name: 'Account Enabled',
    selector: (row) => row['accountEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportselector: 'accountEnabled',
  },
  {
    name: 'On Premise Sync',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportselector: 'onPremisesSyncEnabled',
  },
  {
    name: 'Licenses',
    selector: (row) => 'Click to Expand',
    exportselector: 'LicJoined',
  },
  {
    name: 'Action',
    button: true,
    cell: Dropdown,
  },
]

const Users = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  // eslint-disable-next-line react/prop-types
  const ExpandedComponent = ({ data }) => (
    //why not in table?
    // eslint-disable-next-line react/prop-types
    <pre>{JSON.stringify(data.LicJoined, null, 2)}</pre>
  )

  return (
    <div>
      <TenantSelector />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Users</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        <CippDatatable
          tableProps={{
            expandableRows: true,
            expandableRowsComponent: ExpandedComponent,
            expandOnRowClicked: true,
          }}
          reportName={`${tenant?.defaultDomainName}-Users`}
          path="/api/ListUsers"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </div>
    </div>
  )
}

export default Users
