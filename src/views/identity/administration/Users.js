import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { faEdit, faEllipsisV, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter, CellTip } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  const viewLink = `/identity/administration/users/view?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}&userEmail=${row.userPrincipalName}`
  const editLink = `/identity/administration/users/edit?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`
  //console.log(row)
  return (
    <>
      <Link to={viewLink}>
        <CButton size="sm" variant="ghost" color="success">
          <FontAwesomeIcon icon={faEye} />
        </CButton>
      </Link>
      <Link to={editLink}>
        <CButton size="sm" variant="ghost" color="warning">
          <FontAwesomeIcon icon={faEdit} />
        </CButton>
      </Link>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="User Information"
        extendedInfo={[
          { label: 'Created Date (UTC)', value: `${row.createdDateTime ?? ' '}` },
          { label: 'UPN', value: `${row.userPrincipalName ?? ' '}` },
          { label: 'Given Name', value: `${row.givenName ?? ' '}` },
          { label: 'Surname', value: `${row.surname ?? ' '}` },
          { label: 'Job Title', value: `${row.jobTitle ?? ' '}` },
          { label: 'Licenses', value: `${row.LicJoined ?? ' '}` },
          { label: 'Business Phone', value: `${row.businessPhones ?? ' '}` },
          { label: 'Mobile Phone', value: `${row.mobilePhone ?? ' '}` },
          { label: 'Mail', value: `${row.mail ?? ' '}` },
          { label: 'City', value: `${row.city ?? ' '}` },
          { label: 'Department', value: `${row.department ?? ' '}` },
          { label: 'OnPrem Last Sync', value: `${row.onPremisesLastSyncDateTime ?? ' '}` },
          { label: 'Unique ID', value: `${row.id ?? ' '}` },
        ]}
        actions={[
          {
            icon: <FontAwesomeIcon icon={faEye} className="me-2" />,
            label: 'View User',
            link: viewLink,
            color: 'success',
          },
          {
            icon: <FontAwesomeIcon icon={faEdit} className="me-2" />,
            label: 'Edit User',
            link: editLink,
            color: 'info',
          },
          {
            label: 'Research Compromised Account',
            link: `/identity/administration/ViewBec?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`,
            color: 'info',
          },
          {
            label: 'Create Temporary Access Password',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecCreateTAP?TenantFilter=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`,
            modalMessage: 'Are you sure you want to create a Temporary Access Pass?',
          },
          {
            label: 'Rerequire MFA registration',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecResetMFA?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to enable MFA for this user?',
          },
          {
            label: 'Send MFA Push',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecSendPush?TenantFilter=${tenant.defaultDomainName}&UserEmail=${row.userPrincipalName}`,
            modalMessage: 'Are you sure you want to send a MFA request?',
          },
          {
            label: 'Convert to Shared Mailbox',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to convert this user to a shared mailbox?',
          },
          {
            label: 'Enable Online Archive',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecEnableArchive?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to enable the online archive for this user?',
          },
          {
            label: 'Set Out of Office',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              user: row.userPrincipalName,
              TenantFilter: tenant.defaultDomainName,
              message: row.message,
            },
            modalUrl: `/api/ExecSetOoO`,
            modalInput: true,
            modalMessage:
              'Enter a out of office message and press continue to set the out of office.',
          },
          {
            label: 'Block Sign In',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecDisableUser?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to block the sign in for this user?',
          },
          {
            label: 'Unblock Sign In',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecDisableUser?Enable=true&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to enable this user?',
          },
          {
            label: 'Reset Password (Must Change)',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecResetPass?MustChange=true&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to reset the password for this user?',
          },
          {
            label: 'Reset Password',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecResetPass?MustChange=false&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to reset the password for this user?',
          },
          {
            label: 'Clear ImmutableId',
            color: 'warning',
            modal: true,
            modalUrl: `/api/ExecClrImmId?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to clear the ImmutableId for this user?',
          },
          {
            label: 'Revoke all user sessions',
            color: 'danger',
            modal: true,
            modalUrl: `/api/ExecRevokeSessions?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to revoke this users sessions?',
          },
          {
            label: 'Delete User',
            color: 'danger',
            modal: true,
            modalUrl: `/api/RemoveUser?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to delete this user?',
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    minWidth: '300px',
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
    cell: (row) => CellTip(row['mail']),
    exportSelector: 'mail',
    minWidth: '250px',
  },
  {
    name: 'User Type',
    selector: (row) => row['userType'],
    sortable: true,
    exportSelector: 'userType',
    minWidth: '140px',
  },
  {
    name: 'Enabled',
    selector: (row) => row['accountEnabled'],
    cell: cellBooleanFormatter({ colourless: true }),
    sortable: true,
    exportSelector: 'accountEnabled',
    minWidth: '100px',
  },
  {
    name: 'AD Synced',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter({ colourless: true }),
    sortable: true,
    exportSelector: 'onPremisesSyncEnabled',
    minWidth: '120px',
  },
  {
    name: 'Licenses',
    selector: (row) => row['LicJoined'],
    exportSelector: 'LicJoined',
    sortable: true,
    grow: 5,
    wrap: true,
    minWidth: '200px',
  },
  {
    name: 'id',
    selector: (row) => row['id'],
    omit: true,
  },
  {
    name: 'Actions',
    cell: Offcanvas,
  },
]

const Users = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const titleButton = <TitleButton href="/identity/administration/users/add" title="Add User" />
  return (
    <CippPageList
      capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
      title="Users"
      titleButton={titleButton}
      datatable={{
        filterlist: [
          { filterName: 'Enabled users', filter: '"accountEnabled":true' },
          { filterName: 'AAD users', filter: '"onPremisesSyncEnabled":false' },
          { filterName: 'Synced users', filter: '"onPremisesSyncEnabled":true' },
          { filterName: 'Guest users', filter: '"usertype":"guest"' },
          { filterName: 'Users with a license', filter: '"assignedLicenses":[{' },
          { filterName: 'Users without a license', filter: '"assignedLicenses":[]' },
        ],
        columns,
        path: '/api/ListUsers',
        reportName: `${tenant?.defaultDomainName}-Users`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default Users
