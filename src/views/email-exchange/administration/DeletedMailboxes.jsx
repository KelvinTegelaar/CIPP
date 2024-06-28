import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useSelector } from 'react-redux'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)

  const now = new Date() // Get the current date and time
  const requestName = `${row.UPN}-${String(now.getDate()).padStart(2, '0')}-${String(
    now.getMonth() + 1,
  ).padStart(2, '0')}-${now.getFullYear()}-${String(now.getHours()).padStart(2, '0')}${String(
    now.getMinutes(),
  ).padStart(2, '0')}`

  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="Extended Information"
        extendedInfo={[
          { label: 'Display Name', value: `${row.displayName}` },
          { label: 'UPN', value: `${row.UPN}` },
          { label: 'Primary SMTP Address', value: `${row.primarySmtpAddress}` },
          { label: 'Recipient Type', value: `${row.recipientType}` },
          { label: 'Recipient Type Details', value: `${row.recipientTypeDetails}` },
          { label: 'Additional Email Addresses', value: `${row.AdditionalEmailAddresses}` },
          { label: 'Exchange Guid', value: `${row.ExchangeGuid}` },
          { label: 'Archive Guid', value: `${row.ArchiveGuid}` },
          { label: 'Id', value: `${row.Id}` },
          { label: 'Date Deleted', value: `${row.WhenSoftDeleted}` },
        ]}
        actions={[
          {
            label: 'Restore Mailbox',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: {
              SourceMailbox: row.UPN,
              TenantFilter: tenant.defaultDomainName,
              RequestName: requestName,
            },
            modalUrl: `/api/ExecMailboxRestore`,
            modalMessage: 'Select the mailbox to restore to',
            modalDropdown: {
              url: `/api/ListMailboxes?TenantFilter=${tenant.defaultDomainName}`,
              labelField: 'UPN',
              valueField: 'UPN',
            },
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
    exportSelector: 'displayName',
  },
  {
    name: 'User Principal Name',
    selector: (row) => row['UPN'],
    sortable: true,
    exportSelector: 'UPN',
    minWidth: '350px',
  },
  {
    name: 'Primary SMTP Address',
    selector: (row) => row['primarySmtpAddress'],
    sortable: true,
    exportSelector: 'primarySmtpAddress',
    minWidth: '350px',
  },
  {
    name: 'Date Deleted',
    selector: (row) => row['WhenSoftDeleted'],
    sortable: true,
    exportSelector: 'WhenSoftDeleted',
  },
  {
    name: 'Recipient Type',
    selector: (row) => row['recipientType'],
    omit: true,
    exportSelector: 'recipientType',
  },
  {
    name: 'Recipient Type Details',
    selector: (row) => row['recipientTypeDetails'],
    omit: true,
    exportSelector: 'recipientTypeDetails',
  },
  {
    name: 'Additional Email Addresses',
    selector: (row) => row['AdditionalEmailAddresses'],
    omit: true,
    exportSelector: 'AdditionalEmailAddresses',
  },
  {
    name: 'Exchange Guid',
    selector: (row) => row['ExchangeGuid'],
    sortable: true,
    exportSelector: 'ExchangeGuid',
    minWidth: '350px',
  },
  {
    name: 'Archive Guid',
    selector: (row) => row['ArchiveGuid'],
    sortable: true,
    exportSelector: 'ArchiveGuid',
  },
  {
    name: 'id',
    selector: (row) => row['Id'],
    omit: true,
    exportSelector: 'Id',
  },
  {
    name: 'Actions',
    cell: Offcanvas,
  },
]

const DeletedMailboxes = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const titleButton = (
    <TitleButton href="/email/tools/mailbox-restore-wizard" title="Restore Mailbox" />
  )
  return (
    <CippPageList
      title="Soft Deleted Mailboxes"
      titleButton={titleButton}
      datatable={{
        columns,
        path: '/api/ListMailboxes',
        reportName: `${tenant?.defaultDomainName}-Deleted-Mailboxes`,
        params: { TenantFilter: tenant?.defaultDomainName, SoftDeletedMailbox: true },
      }}
    />
  )
}

export default DeletedMailboxes
