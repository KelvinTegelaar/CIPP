import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEdit, faEllipsisV, faMobileAlt } from '@fortawesome/free-solid-svg-icons'
import { Link } from 'react-router-dom'
import { CippActionsOffcanvas } from 'src/components/cipp'

const MailboxList = () => {
  const [ocVisible, setOCVisible] = useState(false)
  const tenant = useSelector((state) => state.app.currentTenant)
  const dropdown = (row, rowIndex, formatExtraData) => (
    <>
      <Link
        to={`/identity/administration/users/view?userId=${row.UPN}&tenantDomain=${tenant.defaultDomainName}`}
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
      <Link to={`/email/administration/view-mobile-devices?UserID=${row.primarySmtpAddress}`}>
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
          { label: 'Aditional Email Addresses', value: `${row.AdditionalEmailAddresses}` },
        ]}
        actions={[
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
            modalMessage: 'Are you sure you want to convert this shared mailbox to a user mailbox?',
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )

  //TODO: Add CellBoolean
  const columns = [
    {
      selector: (row) => row['UPN'],
      name: 'User Prinicipal Name',
      sortable: true,
    },
    {
      selector: (row) => row['displayName'],
      name: 'Display Name',
      sortable: true,
    },
    {
      selector: (row) => row['primarySmtpAddress'],
      name: 'Primary E-mail Address',
      sortable: true,
    },
    {
      selector: (row) => row['recipientType'],
      name: 'Recipient Type',
      sortable: true,
    },
    {
      selector: (row) => row['recipientTypeDetails'],
      name: 'Recipient Type Details',
      sortable: true,
    },
    {
      name: 'Additional Email Addresses',
      selector: (row) => 'Click to Expand',
      sortable: true,
      omit: true,
    },
    {
      name: 'Actions',
      cell: dropdown,
    },
  ]

  return (
    <CippPageList
      title="Mailboxes"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Mailbox-List`,
        path: '/api/ListMailboxes',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default MailboxList
