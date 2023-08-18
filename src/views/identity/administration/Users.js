import React, { useEffect, useState } from 'react'
import { CButton } from '@coreui/react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { faEdit, faEllipsisV, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter, CellTip } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { cellLicenseFormatter, CellLicense } from 'src/components/tables/CellLicense'
import M365Licenses from 'src/data/M365Licenses'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  const viewLink = `/identity/administration/users/view?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}&userEmail=${row.userPrincipalName}`
  const editLink = `/identity/administration/users/edit?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`
  const OffboardLink = `/identity/administration/offboarding-wizard?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`

  let licenses = []
  row.assignedLicenses?.map((licenseAssignment, idx) => {
    for (var x = 0; x < M365Licenses.length; x++) {
      if (licenseAssignment.skuId == M365Licenses[x].GUID) {
        licenses.push(M365Licenses[x].Product_Display_Name)
        break
      }
    }
  })
  var licJoined = licenses.join(', ')

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
          { label: 'Licenses', value: `${licJoined ?? ' '}` },
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
            label: 'Offboard User',
            link: OffboardLink,
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
            modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`,
            modalMessage: 'Are you sure you want to convert this user to a shared mailbox?',
          },
          {
            label: 'Enable Online Archive',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecEnableArchive?TenantFilter=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`,
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
            label: 'Disable Out of Office',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              user: row.userPrincipalName,
              TenantFilter: tenant.defaultDomainName,
              Disable: true,
            },
            modalUrl: `/api/ExecSetOoO`,
            modalMessage: 'Are you sure you want to disable the out of office?',
          },
          {
            label: 'Disable Email Forwarding',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              user: row.userPrincipalName,
              TenantFilter: tenant.defaultDomainName,
              message: row.message,
            },
            modalUrl: `/api/ExecDisableEmailForward`,
            modalMessage: 'Are you sure you want to disable forwarding of this users emails?',
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
            modalUrl: `/api/ExecResetPass?MustChange=true&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&displayName=${row.displayName}`,
            modalMessage: 'Are you sure you want to reset the password for this user?',
          },
          {
            label: 'Reset Password',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecResetPass?MustChange=false&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&displayName=${row.displayName}`,
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

const Users = (row) => {
  const [tenantColumnSet, setTenantColumn] = useState(true)
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      cell: (row) => CellTip(row['Tenant']),
      exportSelector: 'Tenant',
      omit: tenantColumnSet,
    },
    {
      name: 'Retrieval Status',
      selector: (row) => row['CippStatus'],
      sortable: true,
      cell: (row) => CellTip(row['CippStatus']),
      exportSelector: 'CippStatus',
      omit: tenantColumnSet,
    },
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
      selector: (row) => row['assignedLicenses'],
      exportSelector: 'assignedLicenses',
      exportFormatter: CellLicense,
      cell: cellLicenseFormatter(),
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
  const tenant = useSelector((state) => state.app.currentTenant)
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenantColumnSet])

  const titleButtons = (
    <div style={{ display: 'flex', alignItems: 'right' }}>
      <TitleButton key="add-user" href="/identity/administration/users/add" title="Add User" />
      <div style={{ marginLeft: '10px' }}>
        <TitleButton
          key="Invite-Guest"
          href="/identity/administration/users/InviteGuest"
          title="Invite Guest"
        />
      </div>
    </div>
  )
  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Users"
      titleButton={titleButtons}
      datatable={{
        filterlist: [
          { filterName: 'Enabled users', filter: '"accountEnabled":true' },
          { filterName: 'Disabled users', filter: '"accountEnabled":false' },
          { filterName: 'AAD users', filter: '"onPremisesSyncEnabled":false' },
          { filterName: 'Synced users', filter: '"onPremisesSyncEnabled":true' },
          { filterName: 'Guest users', filter: '"usertype":"guest"' },
          { filterName: 'Users with a license', filter: '"assignedLicenses":[{' },
          { filterName: 'Users without a license', filter: '"assignedLicenses":[]' },
          {
            filterName: 'Users with a license (Graph)',
            filter: 'assignedLicenses/$count ne 0',
            graphFilter: true,
          },
          {
            filterName: 'Users with a license & Enabled (Graph)',
            filter: 'assignedLicenses/$count ne 0 and accountEnabled eq true',
            graphFilter: true,
          },
        ],
        columns,
        path: '/api/ListGraphRequest',
        reportName: `${tenant?.defaultDomainName}-Users`,
        params: {
          TenantFilter: tenant?.defaultDomainName,
          Endpoint: 'users',
          $select:
            'id,accountEnabled,businessPhones,city,createdDateTime,companyName,country,department,displayName,faxNumber,givenName,isResourceAccount,jobTitle,mail,mailNickname,mobilePhone,onPremisesDistinguishedName,officeLocation,onPremisesLastSyncDateTime,otherMails,postalCode,preferredDataLocation,preferredLanguage,proxyAddresses,showInAddressList,state,streetAddress,surname,usageLocation,userPrincipalName,userType,assignedLicenses,onPremisesSyncEnabled',
          $count: true,
          $orderby: 'displayName',
        },
        tableProps: {
          selectableRows: true,
          actionsList: [
            {
              label: 'Convert to Shared Mailbox',
              modal: true,
              modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=!Tenant&ID=!userPrincipalName`,
              modalMessage: 'Are you sure you want to convert these users to a shared mailbox?',
            },
            {
              label: 'Rerequire MFA registration',
              modal: true,
              modalUrl: `/api/ExecResetMFA?TenantFilter=!Tenant&ID=!id`,
              modalMessage: 'Are you sure you want to enable MFA for these users?',
            },
            {
              label: 'Enable Online Archive',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecEnableArchive?TenantFilter=!Tenant&ID=!id`,
              modalMessage: 'Are you sure you want to enable the online archive for these users?',
            },
            {
              label: 'Reset Password (Must Change)',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecResetPass?MustChange=true&TenantFilter=!Tenant&ID=!userPrincipalName&displayName=!displayName`,
              modalMessage:
                'Are you sure you want to reset the password for these users? The users must change their password at next logon.',
            },
            {
              label: 'Reset Password',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecResetPass?MustChange=false&TenantFilter=!Tenant&ID=!userPrincipalName&displayName=!displayName`,
              modalMessage:
                'Are you sure you want to reset the password for these users? The users must change their password at next logon.',
            },
            {
              label: 'Block signin',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecDisableUser?TenantFilter=!Tenant&ID=!userPrincipalName`,
              modalMessage: 'Are you sure you want to disable these users?',
            },
            {
              label: 'Unblock signin',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecDisableUser?Enable=true&TenantFilter=!Tenant&ID=!userPrincipalName`,
              modalMessage: 'Are you sure you want to enable these users?',
            },
            {
              label: 'Revoke sessions',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecRevokeSessions?Enable=true&TenantFilter=!Tenant&ID=!userPrincipalName`,
              modalMessage: 'Are you sure you want to revoke all sessions for these users?',
            },
            {
              label: 'Set Out of Office',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: '!userPrincipalName',
                TenantFilter: tenant.defaultDomainName,
              },
              modalUrl: `/api/ExecSetOoO`,
              modalInput: true,
              modalMessage:
                'Enter a out of office message and press continue to set the out of office.',
            },
            {
              label: 'Disable Out of Office',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: '!userPrincipalName',
                TenantFilter: tenant.defaultDomainName,
                Disable: true,
              },
              modalUrl: `/api/ExecSetOoO`,
              modalMessage: 'Are you sure you want to disable the out of office?',
            },
            {
              label: 'Disable Email Forwarding',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: '!userPrincipalName',
                TenantFilter: tenant.defaultDomainName,
              },
              modalUrl: `/api/ExecDisableEmailForward`,
              modalMessage: 'Are you sure you want to disable forwarding of these users emails?',
            },
            {
              label: 'Delete User',
              color: 'danger',
              modal: true,
              modalUrl: `/api/RemoveUser?TenantFilter=!Tenant&ID=!id`,
              modalMessage: 'Are you sure you want to delete these users?',
            },
          ],
        },
      }}
    />
  )
}

export default Users
