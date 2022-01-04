import React from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import {
  faPlus,
  faUser,
  faCog,
  faBars,
  faUserTimes,
  faKey,
  faBan,
  faExchangeAlt,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter } from '../../../components/cipp'
import { setModalContent } from 'src/store/features/modal'
import { CSpinner } from '@coreui/react'
import { useLazyGenericGetRequestQuery } from '../../../store/api/app'
import { CippPageList } from '../../../components/CippPage'
const Dropdown = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const dispatch = useDispatch()
  const [ExecuteGetRequest, GetRequestResult] = useLazyGenericGetRequestQuery()
  const handleDropdownConfirm = (apiurl) => {
    ExecuteGetRequest({ url: apiurl })
    //this isnt working all the way yet.
    dispatch(
      setModalContent({
        componentType: 'ok',
        title: 'Results',
        body: (
          <div>
            {GetRequestResult.isSuccess && (
              <>
                <CSpinner />
              </>
            )}
            {GetRequestResult.isSuccess && GetRequestResult.data.Results}
          </div>
        ),
        confirmLabel: 'Continue',
        visible: true,
      }),
    )
  }
  const handleDropdownEvent = (apiurl, message) => {
    dispatch(
      setModalContent({
        componentType: 'confirm',
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => handleDropdownConfirm(apiurl),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
        visible: true,
      }),
    )
  }

  return (
    <CDropdown>
      <CDropdownToggle size="sm" color="link">
        <FontAwesomeIcon icon={faBars} />
      </CDropdownToggle>
      <CDropdownMenu>
        <CDropdownItem
          href={`/identity/administration/users/view?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
        >
          <FontAwesomeIcon className='pr-1' icon={faUser} />
          View User
        </CDropdownItem>
        <CDropdownItem
          href={`/identity/administration/users/edit?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
        >
          <FontAwesomeIcon icon={faCog} size="sm" />
          Edit User
        </CDropdownItem>
        <CDropdownItem href={`/identity/administration/ViewBec`}>
          <FontAwesomeIcon icon={faUser} />
          Research Compromised Account
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `/api/ExecSendPush?TenantFilter=${tenant.defaultDomainName}&UserEmail=${row.mail}`,
              `Are you sure you want to send a multifactor push to ${row.displayName}?`,
            )
          }
          href="#"
        >
          <FontAwesomeIcon icon={faExchangeAlt} />
          Send MFA Push To User
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
              `Are you sure you want to convert ${row.displayName} to a shared mailbox?`,
            )
          }
          href="#"
        >
          <FontAwesomeIcon icon={faSync} />
          Convert To Shared
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `api/ExecDisableUser?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
              `Are you sure you want to block sign in for ${row.displayName}?`,
            )
          }
          href="#"
        >
          <FontAwesomeIcon icon={faBan} />
          Block Sign-in
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `api/ExecResetPass?MustChange=true&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
              `Are you sure you want to reset the password for ${row.displayName}?`,
            )
          }
          href="#"
        >
          <FontAwesomeIcon icon={faKey} />
          Reset Password (Must Change)
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `api/ExecResetPass?MustChange=false&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
              `Are you sure you want to reset the password for ${row.displayName}?`,
            )
          }
          href="#"
        >
          <FontAwesomeIcon icon={faKey} />
          Reset Password
        </CDropdownItem>
        <CDropdownItem
          onClick={() =>
            handleDropdownEvent(
              `api/RemoveUser?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
              `Are you sure you want to delete ${row.displayName}?`,
            )
          }
          href="#"
        >
          <FontAwesomeIcon icon={faUserTimes} />
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
    name: 'id',
    selector: (row) => row['id'],
    omit: true,
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
    <CippPageList
      title="Users"
      datatable={{
        columns,
        path: '/api/ListUsers',
        reportName: `${tenant?.defaultDomainName}-Users`,
        params: { TenantFilter: tenant?.defaultDomainName },
        tableProps: {
          expandableRows: true,
          expandableRowsComponent: ExpandedComponent,
          expandOnRowClicked: true,
          responsive: false,
        },
      }}
    />
  )
}

export default Users
