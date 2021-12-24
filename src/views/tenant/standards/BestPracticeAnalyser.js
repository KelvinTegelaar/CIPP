import React from 'react'
import { CButton, CSpinner, CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'
import { useDispatch } from 'react-redux'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import {
  cellBooleanFormatter,
  CippDatatable,
  CellBadge,
  CellBoolean,
  CellProgressBar,
  cellDateFormatter,
} from '../../../components/cipp'
import { setModalContent } from '../../../store/features/modal'
import { useExecBestPracticeAnalyserMutation } from '../../../store/api/reports'

const RefreshAction = () => {
  const [execBestPracticeAnalyser, { isLoading, isSuccess, error }] =
    useExecBestPracticeAnalyserMutation()
  const dispatch = useDispatch()

  const onClick = () => {
    dispatch(
      setModalContent({
        componentType: 'confirm',
        title: 'Confirm',
        body: (
          <div>
            Are you sure you want to force the Best Practice Analysis to run? This will slow down
            normal usage considerably. <br />
            <i>Please note: this runs at midnight automatically every day.</i>
          </div>
        ),
        onConfirm: () => execBestPracticeAnalyser(),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
        visible: true,
      }),
    )
  }

  return (
    <CButton onClick={onClick} size="sm" className="text-white m-1">
      {isLoading && <CSpinner size="sm" />}
      {error && <FontAwesomeIcon icon={faExclamationTriangle} />}
      {isSuccess && <FontAwesomeIcon icon={faCheck} />}
      Force Refresh All Data
    </CButton>
  )
}

const BestPracticeAnalyser = () => {
  const dispatch = useDispatch()
  // const { data, isFetching, error } = useListBestPracticeAnalyserQuery()

  const handleSharedMailboxes = ({ row }) => {
    dispatch(
      setModalContent({
        visible: true,
        componentType: 'list',
        data: row.DisabledSharedMailboxLogins.split('<br />'),
        title: `Shared Mailboxes with Enabled User Accounts`,
      }),
    )
  }

  const handleUnusedLicense = ({ row }) => {
    const columns = [
      {
        name: 'SKU',
        selector: (row) => row['SKU'],
      },
      {
        name: 'Purchased',
        selector: (row) => row['Purchased'],
      },
      {
        name: 'Consumed',
        selector: (row) => row['Consumed'],
      },
    ]

    const tabularized = row.UnusedLicenseList.split('<br />')
      .map((line) =>
        line
          .split(', ')
          .map((sku) => sku.split(': ').reduce((key, val) => ({ [key]: val })))
          .reduce((pv, cv) => ({ ...pv, ...cv })),
      )
      .sort((a, b) => b.SKU.toLocaleLowerCase().localeCompare(a.SKU.toLocaleLowerCase()))

    dispatch(
      setModalContent({
        visible: true,
        data: tabularized,
        componentType: 'table',
        componentProps: {
          columns,
          keyField: 'SKU',
        },
        title: `SKUs with Unassigned Licenses`,
        size: 'lg',
      }),
    )
  }

  const handleMessageCopy = ({ row }) => {
    dispatch(
      setModalContent({
        visible: true,
        data: row.MessageCopyForSendList.split('<br />'),
        componentType: 'list',
        title: 'Message Copy for Send As',
      }),
    )
  }

  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
    },
    {
      name: 'Last Refresh',
      selector: (row) => row['LastRefresh'],
      // format: (cell) => <div>{moment.utc(cell).format('MMM D YYYY')}</div>,
      cell: cellDateFormatter({ format: 'short' }),
      sortable: true,
    },
    {
      name: 'Unified Audit Log Enabled',
      selector: (row) => row['UnifiedAuditLog'],
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Security Defaults Enabled',
      selector: (row) => row['SecureDefaultState'],
      cell: cellBooleanFormatter({ warning: true }),
    },
    {
      name: 'Message Copy for Send As',
      selector: (row) => row['MessageCopyForSend'],
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
    },
    {
      name: 'User Cannot Consent to Apps',
      selector: (row) => row['AdminConsentForApplications'],
      cell: cellBooleanFormatter({ reverse: true }),
    },
    {
      name: 'Passwords Do Not Expire',
      selector: (row) => row['DoNotExpirePasswords'],
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Privacy in Reports Enabled',
      selector: (row) => row['PrivacyEnabled'],
      cell: cellBooleanFormatter({ reverse: true, warning: true }),
    },
    {
      name: 'Self Service Password Reset Enabled',
      selector: (row) => row['SelfServicePasswordReset'],
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
    },
    {
      name: 'Modern Auth Enabled',
      selector: (row) => row['EnableModernAuth'],
      cell: cellBooleanFormatter(),
    },
    {
      name: 'Shared Mailboxes Logins Disabled',
      selector: (row) => row['DisabledSharedMailboxLoginsCount'],
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
    },
    {
      name: 'Unused Licenses',
      selector: (row) => row['UnusedLicensesResult'],
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (cell === 'FAIL') {
          return (
            <CButton className="btn-danger" size="sm" onClick={() => handleUnusedLicense({ row })}>
              {row.UnusedLicensesCount} SKU{row.UnusedLicensesCount > 1 ? 's' : ''}
            </CButton>
          )
        } else if (cell === 'PASS') {
          return <CellBoolean cell={true} />
        }
        return <CellBadge label="No Data" color="info" />
      },
    },
    {
      name: 'Secure Score',
      selector: (row) => row['SecureScorePercentage'],
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (!cell) {
          return <CellBadge color="info" label="No Data" />
        }
        return <CellProgressBar value={row.SecureScorePercentage} />
      },
    },
  ]

  return (
    <div>
      <hr />
      <CCard>
        <CCardHeader>
          <CCardTitle className="text-primary">Best Practice Analyser</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CippDatatable
            reportName={`Best-Practices-Report`}
            path="/api/BestPracticeAnalyser_List"
            tableProps={{
              actions: [<RefreshAction key="refresh-action-button" />],
            }}
            columns={columns}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default BestPracticeAnalyser
