import React, { useEffect, useState, useRef } from 'react'
import { CButton, CFormInput, CFormLabel } from '@coreui/react'
import { Link, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { faEdit, faEllipsisV, faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter, CellTip } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas, ModalService } from 'src/components/utilities'
import { cellLicenseFormatter, CellLicense } from 'src/components/tables/CellLicense'
import M365Licenses from 'src/data/M365Licenses'
import CippGraphUserFilter from 'src/components/utilities/CippGraphUserFilter'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  const viewLink = row?.tenant
    ? `/identity/administration/users/view?userId=${row.id}&tenantDomain=${row.Tenant}&userEmail=${row.userPrincipalName}`
    : `/identity/administration/users/view?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}&userEmail=${row.userPrincipalName}`
  const editLink = row?.tenant
    ? `/identity/administration/users/edit?userId=${row.id}&tenantDomain=${row.Tenant}`
    : `/identity/administration/users/edit?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}`
  const entraLink = `https://entra.microsoft.com/${tenant.defaultDomainName}/#view/Microsoft_AAD_UsersAndTenants/UserProfileMenuBlade/~/UserAuthMethods/userId/${row.id}/hidePreviewBanner~/true`

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
          {
            label: 'Created Date (UTC)',
            value: `${row.createdDateTime ?? ' '}`,
          },
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
          {
            label: 'OnPrem Last Sync',
            value: `${row.onPremisesLastSyncDateTime ?? ' '}`,
          },
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
            link: `/identity/administration/ViewBec?userId=${row.id}&tenantDomain=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`,
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
            link: entraLink,
            color: 'info',
            target: '_blank',
            external: true,
          },
          {
            label: 'Send MFA Push',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecSendPush?TenantFilter=${tenant.defaultDomainName}&UserEmail=${row.userPrincipalName}`,
            modalMessage: 'Are you sure you want to send a MFA request?',
          },
          {
            label: 'Set Per-User MFA',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecPerUserMFA`,
            modalType: 'POST',
            modalBody: {
              TenantFilter: tenant.defaultDomainName,
              userId: `${row.userPrincipalName}`,
            },
            modalMessage: 'Are you sure you want to set per-user MFA for these users?',
            modalDropdown: {
              url: '/MFAStates.json',
              labelField: 'label',
              valueField: 'value',
              addedField: {
                State: 'value',
              },
            },
          },
          {
            label: 'Convert to Shared Mailbox',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=${row.userPrincipalName}`,
            modalMessage: 'Are you sure you want to convert this user to a shared mailbox?',
          },
          {
            label: 'Add OneDrive Shortcut',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              username: row.userPrincipalName,
              userid: row.id,
              TenantFilter: tenant.defaultDomainName,
              message: row.message,
            },
            modalUrl: `/api/ExecOneDriveShortCut`,
            modalDropdown: {
              url: `/api/listSites?TenantFilter=${tenant.defaultDomainName}&type=SharePointSiteUsage&URLOnly=true`,
              labelField: 'URL',
              valueField: 'URL',
            },
            modalMessage: 'Select the sharepoint site to create a shortcut for',
          },
          {
            label: 'Add to group',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              Addmember: {
                value: row.userPrincipalName,
              },
              TenantId: tenant.defaultDomainName,
            },
            modalUrl: `/api/EditGroup`,
            modalDropdown: {
              url: `/api/listGroups?TenantFilter=${tenant.defaultDomainName}`,
              labelField: 'displayName',
              valueField: 'id',
              addedField: {
                groupId: 'id',
                groupType: 'calculatedGroupType',
                groupName: 'displayName',
              },
            },
            modalMessage: 'Select the group to add the user to',
          },
          {
            label: 'Remove from group',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              Removemember: {
                value: row.userPrincipalName,
              },
              TenantId: tenant.defaultDomainName,
            },
            modalUrl: `/api/EditGroup`,
            modalDropdown: {
              url: `/api/listGroups?TenantFilter=${tenant.defaultDomainName}`,
              labelField: 'displayName',
              valueField: 'id',
              addedField: {
                groupId: 'id',
                groupType: 'calculatedGroupType',
                groupName: 'displayName',
              },
            },
            modalMessage: 'Select the group to remove the user from',
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
              AutoReplyState: 'Enabled',
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
              AutoReplyState: 'Disabled',
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
              username: row.userPrincipalName,
              userid: row.userPrincipalName,
              TenantFilter: tenant.defaultDomainName,
              DisableForwarding: true,
              message: row.message,
            },
            modalUrl: `/api/ExecEmailForward`,
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
            modalMessage:
              'Are you sure you want to reset the password for this user? The user must change their password at next logon.',
          },
          {
            label: 'Reset Password',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecResetPass?MustChange=false&TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&displayName=${row.displayName}`,
            modalMessage: 'Are you sure you want to reset the password for this user?',
          },
          {
            label: 'Pre-provision OneDrive',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecOneDriveProvision?TenantFilter=${tenant.defaultDomainName}&UserPrincipalName=${row.userPrincipalName}`,
            modalMessage: 'Are you sure you want to pre-provision OneDrive for this user??',
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
            modalUrl: `/api/ExecRevokeSessions?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&Username=${row.userPrincipalName}`,
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

const UserSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const inputRef = useRef()

  function handleModal() {
    ModalService.confirm({
      body: (
        <>
          <CFormLabel>
            Search for a user by name or email address. (Email domain is also supported).
          </CFormLabel>
          <CFormInput ref={inputRef} />
        </>
      ),
      title: 'User Search',
      onConfirm: () => {
        if (inputRef.current.value !== '') {
          setSearchParams({
            tableFilter: 'Graph: ' + CippGraphUserFilter(inputRef?.current?.value),
            updateTableFilter: true,
          })
        }
      },
      confirmLabel: 'Search',
    })
  }

  return (
    <CButton className="m-1" size="sm" onClick={() => handleModal()}>
      <FontAwesomeIcon icon="search" />
    </CButton>
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
      exportSelector: 'id',
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
  }, [tenant.defaultDomainName, tenantColumnSet])

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
      <div style={{ marginLeft: '10px' }}>
        <TitleButton
          key="Invite-Bulk"
          href="/identity/administration/users/addbulk"
          title="Bulk Add"
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
          { filterName: 'AAD users', filter: 'Complex: onPremisesSyncEnabled ne True' },
          {
            filterName: 'Synced users',
            filter: '"onPremisesSyncEnabled":true',
          },
          { filterName: 'Non-guest users', filter: 'Complex: usertype ne Guest' },
          { filterName: 'Guest users', filter: '"usertype":"guest"' },
          {
            filterName: 'Users with a license',
            filter: '"assignedLicenses":[{',
          },
          {
            filterName: 'Users without a license',
            filter: '"assignedLicenses":[]',
          },
          {
            filterName: 'Users with a license (Graph)',
            filter: 'Graph: assignedLicenses/$count ne 0',
          },
          {
            filterName: 'Users with a license & Enabled (Graph)',
            filter: 'Graph: assignedLicenses/$count ne 0 and accountEnabled eq true',
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
          $top: 999,
        },
        tableProps: {
          keyField: 'id',
          selectableRows: true,
          actions: [<UserSearch key={'user-search'} />],
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
              label: 'Set Per-User MFA',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecPerUserMFA`,
              modalType: 'POST',
              modalBody: {
                TenantFilter: tenant.defaultDomainName,
                userId: '!userPrincipalName',
              },
              modalMessage: 'Are you sure you want to set per-user MFA for these users?',
              modalDropdown: {
                url: '/MFAStates.json',
                labelField: 'label',
                valueField: 'value',
                addedField: {
                  State: 'value',
                },
              },
            },
            {
              label: 'Enable Online Archive',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecEnableArchive?TenantFilter=!Tenant&ID=!userPrincipalName`,
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
              modalMessage: 'Are you sure you want to reset the password for these users?',
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
              modalUrl: `/api/ExecRevokeSessions?Enable=true&TenantFilter=!Tenant&ID=!id&Username=!userPrincipalName`,
              modalMessage: 'Are you sure you want to revoke all sessions for these users?',
            },
            {
              label: 'Create OneDrive Shortcut',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                username: '!userPrincipalName',
                userid: '!id',
                TenantFilter: tenant.defaultDomainName,
              },
              modalUrl: `/api/ExecOneDriveShortCut`,
              modalMessage:
                'Select a SharePoint URL to create a OneDrive shortcut for and press continue.',
              modalDropdown: {
                url: `/api/listSites?TenantFilter=${tenant.defaultDomainName}&type=SharePointSiteUsage`,
                labelField: 'URL',
                valueField: 'URL',
              },
            },
            {
              label: 'Add to group',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                username: '!userPrincipalName',
                userid: '!id',
                TenantId: tenant.defaultDomainName,
                Addmember: {
                  value: '!userPrincipalName',
                },
              },
              modalUrl: `/api/EditGroup`,
              modalMessage: 'Select the group to add',
              modalDropdown: {
                url: `/api/listGroups?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'id',
                addedField: {
                  groupId: 'id',
                  groupType: 'calculatedGroupType',
                  groupName: 'displayName',
                },
              },
            },
            {
              label: 'Remove from group',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                username: '!userPrincipalName',
                userid: '!id',
                TenantId: tenant.defaultDomainName,
                RemoveMember: {
                  value: '!userPrincipalName',
                },
              },
              modalUrl: `/api/EditGroup`,
              modalMessage: 'Select the group to remove',
              modalDropdown: {
                url: `/api/listGroups?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'displayName',
                valueField: 'id',
                addedField: {
                  groupId: 'id',
                  groupType: 'calculatedGroupType',
                  groupName: 'displayName',
                },
              },
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
                username: '!userPrincipalName',
                userid: '!userPrincipalName',
                TenantFilter: tenant.defaultDomainName,
                DisableForwarding: true,
              },
              modalUrl: `/api/ExecEmailForward`,
              modalMessage: 'Are you sure you want to disable forwarding of these users emails?',
            },
            {
              label: 'Preprovision OneDrive',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecOneDriveProvision?TenantFilter=!Tenant&UserPrincipalName=!userPrincipalName`,
              modalMessage: 'Are you sure you want to preprovision onedrive for this user?',
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
