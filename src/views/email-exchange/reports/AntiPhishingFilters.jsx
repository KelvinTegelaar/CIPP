import { CButton } from '@coreui/react'
import { faBan, faBook, faCheck, faEllipsisV, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellDateFormatter, cellBooleanFormatter, CellTip } from 'src/components/tables'
import { cellTableFormatter } from 'src/components/tables/CellTable'

const ListAntiPhishingFilters = () => {
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
              label: 'Rule Name',
              value: `${row.RuleName}`,
            },
            {
              label: 'Policy Name',
              value: `${row.Name}`,
            },
            {
              label: 'Enabled',
              value: `${row.State}`,
            },
            {
              label: 'Creation Date',
              value: `${row.WhenCreated}`,
            },
            {
              label: 'Last Modified Date',
              value: `${row.WhenChanged}`,
            },
          ]}
          actions={[
            {
              label: 'Enable Rule',
              color: 'info',
              icon: <FontAwesomeIcon icon={faCheck} className="me-2" />,
              modal: true,
              modalUrl: `/api/EditAntiPhishingFilter?State=Enable&TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to enable this rule?',
            },
            {
              label: 'Disable Rule',
              color: 'info',
              icon: <FontAwesomeIcon icon={faBan} className="me-2" />,
              modal: true,
              modalUrl: `/api/EditAntiPhishingFilter?State=Disable&TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to disable this rule?',
            },
            /*{
              label: 'Delete Rule',
              color: 'danger',
              modal: true,
              icon: <FontAwesomeIcon icon={faTrash} className="me-2" />,
              modalUrl: `/api/RemoveAntiPhishingFilter?TenantFilter=${tenant.defaultDomainName}&RuleName=${row.RuleName}`,
              modalMessage: 'Are you sure you want to delete this rule?',
            },*/
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
      name: 'Rule Name',
      selector: (row) => row['RuleName'],
      sortable: true,
      exportSelector: 'RuleName',
    },
    {
      name: 'Policy Name',
      selector: (row) => row['Name'],
      sortable: true,
      exportSelector: 'Name',
    },
    {
      name: 'Enabled',
      selector: (row) => row['State'],
      exportSelector: 'State',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Priority',
      selector: (row) => row['Priority'],
      sortable: true,
      exportSelector: 'Priority',
      maxWidth: '40px',
    },
    {
      name: 'Recipient Domains',
      selector: (row) => row['RecipientDomainIs'],
      sortable: true,
      exportSelector: 'RecipientDomainIs',
      cell: cellTableFormatter('RecipientDomainIs'),
    },
    {
      name: 'Excluded Domains',
      selector: (row) => row['ExcludedDomains'],
      sortable: true,
      exportSelector: 'ExcludedDomains',
      cell: cellTableFormatter('ExcludedDomains'),
    },
    {
      name: 'Excluded Senders',
      selector: (row) => row['ExcludedSenders'],
      sortable: true,
      exportSelector: 'ExcludedSenders',
      cell: cellTableFormatter('ExcludedSenders'),
    },
    {
      name: 'PhishThresholdLevel',
      selector: (row) => row['PhishThresholdLevel'],
      sortable: true,
      exportSelector: 'PhishThresholdLevel',
    },
    {
      name: 'Mailbox Intelligence',
      selector: (row) => row['EnableMailboxIntelligence'],
      exportSelector: 'EnableMailboxIntelligence',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Mailbox Intelligence Protection',
      selector: (row) => row['EnableMailboxIntelligenceProtection'],
      exportSelector: 'EnableMailboxIntelligenceProtection',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Spoof Intelligence',
      selector: (row) => row['EnableSpoofIntelligence'],
      exportSelector: 'EnableSpoofIntelligence',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'First Contact Safety Tips',
      selector: (row) => row['EnableFirstContactSafetyTips'],
      exportSelector: 'EnableFirstContactSafetyTips',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Similar Users Safety Tips',
      selector: (row) => row['EnableSimilarUsersSafetyTips'],
      exportSelector: 'EnableSimilarUsersSafetyTips',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Similar Domain Safety Tips',
      selector: (row) => row['EnableSimilarDomainsSafetyTips'],
      exportSelector: 'EnableSimilarDomainsSafetyTips',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Unusual Characters Safety Tips',
      selector: (row) => row['EnableUnusualCharactersSafetyTips'],
      exportSelector: 'EnableUnusualCharactersSafetyTips',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Unauthenticated Sender',
      selector: (row) => row['EnableUnauthenticatedSender'],
      exportSelector: 'EnableUnauthenticatedSender',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'ViaTag',
      selector: (row) => row['EnableViaTag'],
      exportSelector: 'EnableViaTag',
      cell: cellBooleanFormatter(),
      maxWidth: '40px',
    },
    {
      name: 'Organization Domains Protection',
      selector: (row) => row['EnableOrganizationDomainsProtection'],
      exportSelector: 'EnableOrganizationDomainsProtection',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Authentication Fail Action',
      selector: (row) => row['AuthenticationFailAction'],
      exportSelector: 'AuthenticationFailAction',
      maxWidt: '100px',
    },
    {
      name: 'Spoof Quarantine Tag',
      selector: (row) => row['SpoofQuarantineTag'],
      exportSelector: 'SpoofQuarantineTag',
      maxWidth: '100px',
    },
    {
      name: 'MailboxIntelligence Protection Action',
      selector: (row) => row['MailboxIntelligenceProtectionAction'],
      exportSelector: 'MailboxIntelligenceProtectionAction',
      maxWidth: '100px',
    },
    {
      name: 'Mailbox Intelligence Quarantine Tag',
      selector: (row) => row['MailboxIntelligenceQuarantineTag'],
      exportSelector: 'MailboxIntelligenceQuarantineTag',
      maxWidth: '100px',
    },
    {
      name: 'Targeted UserProtection Action',
      selector: (row) => row['TargetedUserProtectionAction'],
      exportSelector: 'TargetedUserProtectionAction',
      maxWidth: '100px',
    },
    {
      name: 'Targeted UserQuarantine Tag',
      selector: (row) => row['TargetedUserQuarantineTag'],
      exportSelector: 'TargetedUserQuarantineTag',
      maxWidth: '100px',
    },
    {
      name: 'Targeted Domain Protection Action',
      selector: (row) => row['TargetedDomainProtectionAction'],
      exportSelector: 'TargetedDomainProtectionAction',
      maxWidth: '100px',
    },
    {
      name: 'Targeted Domain Quarantine Tag',
      selector: (row) => row['TargetedDomainQuarantineTag'],
      exportSelector: 'TargetedDomainQuarantineTag',
      maxWidth: '100px',
    },
    {
      name: 'Creation Date',
      selector: (row) => row['WhenCreated'],
      sortable: true,
      exportSelector: 'WhenCreated',
      cell: cellDateFormatter(),
      maxWidth: '150px',
    },
    {
      name: 'Last Modified Date',
      selector: (row) => row['WhenChanged'],
      sortable: true,
      exportSelector: 'WhenChanged',
      cell: cellDateFormatter(),
      maxWidth: '150px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]

  return (
    <>
      <CippPageList
        title="List of Anti-Phishing Filters"
        capabilities={{ allTenants: false, helpContext: 'https://google.com' }}
        datatable={{
          columns: columns,
          path: '/api/ListAntiPhishingFilters',
          reportName: `${tenant?.defaultDomainName}-AntiPhishingFilters`,
          params: {
            TenantFilter: tenant.defaultDomainName,
          },
        }}
      />
    </>
  )
}

export default ListAntiPhishingFilters
