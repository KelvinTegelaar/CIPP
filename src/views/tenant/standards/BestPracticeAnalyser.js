import React from 'react'
import { CButton, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import {
  CellBadge,
  CellBoolean,
  cellBooleanFormatter,
  CellProgressBar,
  cellDateFormatter,
} from 'src/components/tables'
import { useExecBestPracticeAnalyserMutation } from 'src/store/api/reports'

const RefreshAction = () => {
  const [execBestPracticeAnalyser, { isLoading, isSuccess, error }] =
    useExecBestPracticeAnalyserMutation()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to force the Best Practice Analysis to run? This will slow down
          normal usage considerably. <br />
          <i>Please note: this runs at midnight automatically every day.</i>
        </div>
      ),
      onConfirm: () => execBestPracticeAnalyser(),
    })

  return (
    <CButton onClick={showModal} size="sm" className="m-1">
      {isLoading && <CSpinner size="sm" />}
      {error && <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />}
      {isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
      Force Refresh All Data
    </CButton>
  )
}

const BestPracticeAnalyser = () => {
  const handleSharedMailboxes = ({ row }) => {
    ModalService.open({
      visible: true,
      componentType: 'list',
      data: row.DisabledSharedMailboxLogins.split('<br />'),
      title: `Shared Mailboxes with Enabled User Accounts`,
    })
  }

  const handleUnusedLicense = ({ row }) => {
    const columns = [
      {
        name: 'License',
        selector: (row) => row['License'],
        sortable: true,
        exportSelector: 'License',
      },
      {
        name: 'Purchased',
        selector: (row) => row['Purchased'],
        sortable: true,
        exportSelector: 'Purchased',
      },
      {
        name: 'Consumed',
        selector: (row) => row['Consumed'],
        sortable: true,
        exportSelector: 'Consumed',
      },
    ]

    ModalService.open({
      data: row.UnusedLicenseList,
      componentType: 'table',
      componentProps: {
        columns,
        keyField: 'SKU',
      },
      title: `SKUs with Unassigned Licenses`,
      size: 'lg',
    })
  }

  const handleMessageCopy = ({ row }) => {
    ModalService.open({
      data: row.MessageCopyForSendList.split('<br />'),
      componentType: 'list',
      title: 'Message Copy for Send As',
    })
  }

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      exportSelector: 'Tenant',
    },
    {
      name: 'Last Refresh',
      selector: (row) => row['LastRefresh'],
      // format: (cell) => <div>{moment.utc(cell).format('MMM D YYYY')}</div>,
      cell: cellDateFormatter({ format: 'short' }),
      sortable: true,
      exportSelector: 'LastRefresh',
    },
    {
      name: 'Unified Audit Log Enabled',
      selector: (row) => row['UnifiedAuditLog'],
      cell: cellBooleanFormatter(),
      sortable: true,
      exportSelector: 'UnifiedAuditLog',
    },
    {
      name: 'Security Defaults Enabled',
      selector: (row) => row['SecureDefaultState'],
      cell: cellBooleanFormatter({ warning: true }),
      sortable: true,
      exportSelector: 'SecureDefaultState',
    },
    {
      name: 'Message Copy for Send As',
      selector: (row) => row['MessageCopyForSend'],
      exportSelector: 'MessageCopyForSend',
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (cell === 'PASS') {
          return <CellBoolean cell={true} />
        } else if (cell === 'FAIL') {
          return (
            <CButton
              size="sm"
              onClick={() => handleMessageCopy({ row })}
            >{`${row.MessageCopyForSendAsCount} Users`}</CButton>
          )
        }
        return <CellBadge label="No Data" color="info" />
      },
      sortable: true,
    },
    {
      name: 'User Cannot Consent to Apps',
      selector: (row) => row['AdminConsentForApplications'],
      cell: cellBooleanFormatter({ reverse: true }),
      sortable: true,
      exportSelector: 'AdminConsentForApplications',
    },
    {
      name: 'Passwords Do Not Expire',
      selector: (row) => row['DoNotExpirePasswords'],
      cell: cellBooleanFormatter(),
      sortable: true,
      exportSelector: 'DoNotExpirePasswords',
    },
    {
      name: 'Privacy in Reports Enabled',
      selector: (row) => row['PrivacyEnabled'],
      cell: cellBooleanFormatter({ reverse: true, warning: true }),
      sortable: true,
      exportSelector: 'PrivacyEnabled',
    },
    {
      name: 'Self Service Password Reset Enabled',
      selector: (row) => row['SelfServicePasswordReset'],
      exportSelector: 'SelfServicePasswordReset',
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (cell === 'Off') {
          return <CellBadge label="Off All Users" color="warning" />
        } else if (cell === 'On') {
          return <CellBadge label="On All Users" color="success" />
        } else if (cell === 'Specific Users') {
          return <CellBadge label="Specific Users" color="info" />
        }
        return <CellBadge label="No Data" color="info" />
      },
      sortable: true,
    },
    {
      name: 'Modern Auth Enabled',
      selector: (row) => row['EnableModernAuth'],
      sortable: true,
      exportSelector: 'EnableModernAuth',
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Shared Mailboxes Logins Disabled',
      selector: (row) => row['DisabledSharedMailboxLoginsCount'],
      exportSelector: 'DisabledSharedMailboxLoginsCount',
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (cell > 0) {
          return (
            <CButton
              className="btn-danger"
              size="sm"
              onClick={() => handleSharedMailboxes({ row })}
            >
              {cell} User{cell > 1 ? 's' : ''}
            </CButton>
          )
        } else if (cell === 0) {
          return <CellBoolean cell={true} />
        }
        return <CellBadge label="No Data" color="info" />
      },
      sortable: true,
    },
    {
      name: 'Unused Licenses',
      selector: (row) => row['UnusedLicensesResult'],
      exportSelector: 'UnusedLicensesResult',
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (cell === 'FAIL') {
          return (
            <CButton className="btn-danger" size="sm" onClick={() => handleUnusedLicense({ row })}>
              {row.UnusedLicensesCount} SKU{row.UnusedLicensesCount > 1 ? 's' : ''} / Lic{' '}
              {row.UnusedLicensesTotal}
            </CButton>
          )
        } else if (cell === 'PASS') {
          return <CellBoolean cell={true} />
        }
        return <CellBadge label="No Data" color="info" />
      },
      sortable: true,
    },
    {
      name: 'Secure Score',
      selector: (row) => row['SecureScorePercentage'],
      exportSelector: 'SecureScorePercentage',
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (!cell) {
          return <CellBadge color="info" label="No Data" />
        }
        return <CellProgressBar value={row.SecureScorePercentage} />
      },
      sortable: true,
    },
  ]

  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Best Practice Analyser"
      tenantSelector={false}
      datatable={{
        columns,
        path: '/api/BestPracticeAnalyser_List',
        reportName: 'Best-Practices-Report',
        tableProps: {
          actions: [<RefreshAction key="refresh-action-button" />],
        },
      }}
    />
  )
}

export default BestPracticeAnalyser
