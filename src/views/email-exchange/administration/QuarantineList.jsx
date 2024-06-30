import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisV, faMinusCircle, faPaperPlane } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { cellDateFormatter, CellTip } from 'src/components/tables'

const QuarantineList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Extended Information"
          extendedInfo={[
            {
              label: 'Internal ID',
              value: row.MessageId,
            },
            {
              label: 'Recipient',
              value: row.RecipientAddress.join(', '),
            },
            {
              label: 'Reason',
              value: row.Type,
            },
          ]}
          actions={[
            {
              label: 'Release',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecQuarantineManagement?TenantFilter=${tenant.defaultDomainName}&ID=${row.Identity}&Type=Release`,
              modalMessage: 'Are you sure you want to release this message?',
              icon: <FontAwesomeIcon icon={faPaperPlane} className="me-2" />,
            },
            {
              label: 'Deny',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecQuarantineManagement?TenantFilter=${tenant.defaultDomainName}&ID=${row.Identity}&Type=Deny`,
              modalMessage: 'Are you sure you want to deny this message?',
              icon: <FontAwesomeIcon icon={faMinusCircle} className="me-2" />,
            },
            {
              label: 'Release & Allow Sender',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecQuarantineManagement?TenantFilter=${tenant.defaultDomainName}&ID=${row.Identity}&Type=Release&AllowSender=true`,
              modalMessage:
                'Are you sure you want to release this email, and add the sender to the whitelist?',
              icon: <FontAwesomeIcon icon={faPaperPlane} className="me-2" />,
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
      selector: (row) => row['SenderAddress'],
      name: 'Sender',
      sortable: true,
      cell: (row) => CellTip(row['SenderAddress']),
      exportSelector: 'SenderAddress',
    },
    {
      selector: (row) => row.RecipientAddress.join(', '),
      name: 'Recipient',
      sortable: true,
      exportSelector: 'RecipientAddress',
      cell: (row) => CellTip(row.RecipientAddress.join(', ')),
    },
    {
      selector: (row) => row['Subject'],
      name: 'Subject',
      sortable: true,
      cell: (row) => CellTip(row['Subject']),
      exportSelector: 'Subject',
      maxWidth: '300px',
    },
    {
      selector: (row) => row['Type'],
      name: 'Reason',
      sortable: true,
      exportSelector: 'Type',
      maxWidth: '200px',
    },
    {
      selector: (row) => row['ReceivedTime'],
      name: 'Received on',
      sortable: true,
      exportSelector: 'ReceivedTime',
      maxWidth: '150px',
      cell: cellDateFormatter(),
    },
    {
      selector: (row) => row['ReleaseStatus'],
      name: 'Status',
      sortable: true,
      exportSelector: 'ReleaseStatus',
      maxWidth: '150px',
    },
    {
      selector: (row) => row['PolicyName'],
      name: 'Blocked by Policy',
      sortable: true,
      exportSelector: 'PolicyName',
      maxWidth: '170px',
      cell: (row) => CellTip(row['PolicyName']),
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '100px',
    },
  ]

  return (
    <CippPageList
      capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
      title="Quarantine Management"
      datatable={{
        filterlist: [
          { filterName: 'Status: Not Released', filter: '"ReleaseStatus":"NotReleased"' },
          { filterName: 'Status: Released', filter: '"ReleaseStatus":"Released"' },
          { filterName: 'Status: Denied', filter: '"ReleaseStatus":"Denied"' },
          {
            filterName: 'Reason: High Confidence Phishing',
            filter: '"QuarantineTypes":"HighConfPhish"',
          },
          { filterName: 'Reason: Phishing', filter: '"QuarantineTypes":"Phish"' },
          { filterName: 'Reason: Spam', filter: '"QuarantineTypes":"Spam"' },
          { filterName: 'Reason: Malware', filter: '"QuarantineTypes":"Malware"' },
          { filterName: 'Reason: FileTypeBlock', filter: '"QuarantineTypes":"FileTypeBlock"' },
          { filterName: 'Reason: Bulk', filter: '"QuarantineTypes":"Bulk"' },
        ],
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Mailbox-Quarantine`,
        path: '/api/ListMailQuarantine',
        columns,
        tableProps: {
          selectableRows: true,
          actionsList: [
            {
              label: 'Release',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecQuarantineManagement?TenantFilter=${tenant.defaultDomainName}&ID=!Identity&Type=Release`,
              modalMessage: 'Are you sure you want to release these messages?',
            },
            {
              label: 'Deny',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecQuarantineManagement?TenantFilter=${tenant.defaultDomainName}&ID=!Identity&Type=Deny`,
              modalMessage: 'Are you sure you want to deny these messages?',
            },
            {
              label: 'Release & Allow Sender',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecQuarantineManagement?TenantFilter=${tenant.defaultDomainName}&ID=!Identity&Type=Release&AllowSender=true`,
              modalMessage:
                'Are you sure you want to release these messages, and add the senders to the whitelist?',
            },
          ],
        },
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default QuarantineList
