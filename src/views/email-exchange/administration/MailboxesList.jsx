import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEdit, faEllipsisV, faMobileAlt } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { TitleButton } from 'src/components/buttons'
import { CellTip } from 'src/components/tables'
import { cellGenericFormatter } from 'src/components/tables/CellGenericFormat'

const MailboxList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    return (
      <>
        <Link
          to={`/identity/administration/users/view?userId=${row.UPN}&tenantDomain=${tenant.defaultDomainName}&userEmail=${row.UPN}`}
        >
          <CButton size="sm" variant="ghost" color="success">
            <FontAwesomeIcon icon={faEye} />
          </CButton>
        </Link>
        <Link
          to={`/email/administration/edit-mailbox-permissions?tenantDomain=${tenant.defaultDomainName}&userId=${row.UPN}`}
        >
          <CButton size="sm" variant="ghost" color="warning">
            <FontAwesomeIcon icon={faEdit} />
          </CButton>
        </Link>
        <Link
          to={`/email/administration/view-mobile-devices?customerId=${tenant.defaultDomainName}&userId=${row.primarySmtpAddress}`}
        >
          <CButton size="sm" variant="ghost" color="warning">
            <FontAwesomeIcon icon={faMobileAlt} />
          </CButton>
        </Link>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="User Information"
          extendedInfo={[
            {
              label: 'Display Name',
              value: row.displayName,
            },
            {
              label: 'User Principal Name',
              value: row.UPN,
            },
            {
              label: 'Additional Email Addresses',
              value: row.AdditionalEmailAddresses
                ? `${row.AdditionalEmailAddresses}`
                : 'No additional email addresses',
            },
            {
              label: 'Mailbox Type',
              value: row.recipientTypeDetails,
            },
          ]}
          actions={[
            {
              label: 'Edit Calendar permissions',
              link: `/email/administration/edit-calendar-permissions?userId=${row.UPN}&tenantDomain=${tenant.defaultDomainName}`,
              color: 'info',
            },
            {
              label: 'Research Compromised Account',
              link: `/identity/administration/ViewBec?userId=${row.UPN}&tenantDomain=${tenant.defaultDomainName}`,
              color: 'info',
            },
            {
              label: 'Send MFA Push',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecSendPush?TenantFilter=${tenant.defaultDomainName}&UserEmail=${row.UPN}`,
              modalMessage: 'Are you sure you want to send a MFA request?',
            },
            {
              label: 'Convert to Shared Mailbox',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=${row.UPN}`,
              modalMessage: 'Are you sure you want to convert this user to a shared mailbox?',
            },
            {
              label: 'Convert to User Mailbox',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=${row.UPN}&ConvertToUser=true`,
              modalMessage:
                'Are you sure you want to convert this shared mailbox to a user mailbox?',
            },
            {
              label: 'Copy Sent Items to Shared Mailbox',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecCopyForSent?TenantFilter=${tenant.defaultDomainName}&ID=${row.UPN}`,
              modalMessage: 'Are you sure you want to enable Copy Sent Items to Shared Mailbox?',
            },
            {
              label: 'Disable Copy Sent Items to Shared Mailbox',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecCopyForSent?TenantFilter=${tenant.defaultDomainName}&ID=${row.UPN}&MessageCopyForSentAsEnabled=false`,
              modalMessage: 'Are you sure you want to disable Copy Sent Items to Shared Mailbox?',
            },
            {
              label: 'Hide from Global Address List',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecHideFromGAL?TenantFilter=${tenant.defaultDomainName}&ID=${row.UPN}&HidefromGAL=true`,
              modalMessage:
                'Are you sure you want to hide this mailbox from the global address list? Remember this will not work if the user is AD Synched.',
            },
            {
              label: 'Unhide from Global Address List',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecHideFromGAL?TenantFilter=${tenant.defaultDomainName}&ID=${row.UPN}`,
              modalMessage:
                'Are you sure you want to unhide this mailbox from the global address list? Remember this will not work if the user is AD Synched.',
            },
            {
              label: 'Set Send Quota',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                ProhibitSendQuota: true,
              },
              modalUrl: `/api/ExecSetMailboxQuota`,
              modalInput: true,
              modalMessage: 'Enter a quota. e.g. 1000MB, 10GB,1TB',
            },
            {
              label: 'Set Send and Receive Quota',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                ProhibitSendReceiveQuota: true,
              },
              modalUrl: `/api/ExecSetMailboxQuota`,
              modalInput: true,
              modalMessage: 'Enter a quota. e.g. 1000MB, 10GB,1TB',
            },
            {
              label: 'Set Quota Warning Level',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: row.UPN,
                TenantFilter: tenant.defaultDomainName,
                IssueWarningQuota: true,
              },
              modalUrl: `/api/ExecSetMailboxQuota`,
              modalInput: true,
              modalMessage: 'Enter a quota. e.g. 1000MB, 10GB,1TB',
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

  //TODO: Add CellBoolean
  const columns = [
    {
      selector: (row) => row['UPN'],
      name: 'User Prinicipal Name',
      sortable: true,
      exportSelector: 'UPN',
      cell: (row) => CellTip(row['UPN']),
      maxWidth: '300px',
    },
    {
      selector: (row) => row['displayName'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
      maxWidth: '300px',
    },
    {
      selector: (row) => row['primarySmtpAddress'],
      name: 'Primary E-mail Address',
      sortable: true,
      cell: (row) => CellTip(row['primarySmtpAddress']),
      exportSelector: 'primarySmtpAddress',
      maxWidth: '300px',
    },
    {
      selector: (row) => row['recipientType'],
      name: 'Recipient Type',
      sortable: true,
      exportSelector: 'recipientType',
      maxWidth: '150px',
    },
    {
      selector: (row) => row['recipientTypeDetails'],
      name: 'Recipient Type Details',
      sortable: true,
      exportSelector: 'recipientTypeDetails',
      maxWidth: '170px',
    },
    {
      name: 'Additional Email Addresses',
      selector: (row) => row.AdditionalEmailAddresses,
      exportSelector: 'AdditionalEmailAddresses',
      sortable: true,
      cell: cellGenericFormatter(),
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '150px',
    },
  ]
  const titleButton = (
    <TitleButton href="/email/administration/add-shared-mailbox" title="Add Shared Mailbox" />
  )

  return (
    <CippPageList
      capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
      titleButton={titleButton}
      title="Mailboxes"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Mailbox-List`,
        path: '/api/ListMailboxes',
        columns,
        tableProps: {
          selectableRows: true,
          actionsList: [
            {
              label: 'Convert to Shared Mailbox',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=!UPN`,
              modalMessage: 'Are you sure you want to convert this user to a shared mailbox?',
            },
            {
              label: 'Convert to User Mailbox',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecConvertToSharedMailbox?TenantFilter=${tenant.defaultDomainName}&ID=!UPN&ConvertToUser=true`,
              modalMessage:
                'Are you sure you want to convert this shared mailbox to a user mailbox?',
            },
            {
              label: 'Hide from Global Address List',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecHideFromGAL?TenantFilter=${tenant.defaultDomainName}&ID=!UPN&HidefromGAL=true`,
              modalMessage:
                'Are you sure you want to hide this mailbox from the global address list? Remember this will not work if the user is AD Synched.',
            },
            {
              label: 'Unhide from Global Address List',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecHideFromGAL?TenantFilter=${tenant.defaultDomainName}&ID=!UPN`,
              modalMessage:
                'Are you sure you want to unhide this mailbox from the global address list? Remember this will not work if the user is AD Synched.',
            },
            {
              label: 'Set Send Quota',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: '!UPN',
                TenantFilter: tenant.defaultDomainName,
                ProhibitSendQuota: true,
              },
              modalUrl: `/api/ExecSetMailboxQuota`,
              modalInput: true,
              modalMessage: 'Enter a quota. e.g. 1000MB, 10GB,1TB',
            },
            {
              label: 'Set Send and Receive Quota',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: '!UPN',
                TenantFilter: tenant.defaultDomainName,
                ProhibitSendReceiveQuota: true,
              },
              modalUrl: `/api/ExecSetMailboxQuota`,
              modalInput: true,
              modalMessage: 'Enter a quota. e.g. 1000MB, 10GB,1TB',
            },
            {
              label: 'Set Quota Warning Level',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                user: '!UPN',
                TenantFilter: tenant.defaultDomainName,
                IssueWarningQuota: true,
              },
              modalUrl: `/api/ExecSetMailboxQuota`,
              modalInput: true,
              modalMessage: 'Enter a quota. e.g. 1000MB, 10GB,1TB',
            },
          ],
        },
        params: { TenantFilter: tenant?.defaultDomainName },
        filterlist: [
          {
            filterName: 'User Mailboxes',
            filter: '"recipientTypeDetails":"UserMailbox"',
          },
          {
            filterName: 'Shared Mailboxes with license',
            filter: '"SharedMailboxWithLicense":true',
          },
          { filterName: 'Shared Mailboxes', filter: '"recipientTypeDetails":"SharedMailbox"' },
          { filterName: 'Has an alias', filter: '"AdditionalEmailAddresses":"' },
        ],
      }}
    />
  )
}

export default MailboxList
