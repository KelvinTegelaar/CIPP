import React, { useEffect } from 'react'
import { CButton, CSpinner } from '@coreui/react'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { useDispatch, useSelector } from 'react-redux'
import moment from 'moment'

import CIcon from '@coreui/icons-react'
import { cilWarning, cilXCircle, cilCheckCircle } from '@coreui/icons'

import {
  loadBestPracticeReport,
  forceRefreshBestPracticeReport,
} from '../../../store/modules/standards'
import CellProgressBar from '../../../components/cipp/CellProgressBar'
import CellBadge from '../../../components/cipp/CellBadge'
import CellBoolean from '../../../components/cipp/CellBoolean'
import { setModalContent, showModal } from '../../../store/modules/modal'
import PropTypes from 'prop-types'

const { SearchBar } = Search
const { ExportCSVButton } = CSVExport

const IconWarning = () => <CIcon icon={cilWarning} className="text-warning" />
const IconError = () => <CIcon icon={cilXCircle} className="text-danger" />
const IconSuccess = () => <CIcon icon={cilCheckCircle} className="text-success" />

const pagination = paginationFactory()

const rowFormatter =
  (type = 'error') =>
  // eslint-disable-next-line react/display-name
  (cell) => {
    if (cell) {
      return <IconSuccess />
    } else if (cell === '') {
      return <CellBadge label="No Data" color="info" />
    }
    return type === 'error' ? <IconError /> : <IconWarning />
  }

const SharedMailboxesCard = ({ row }) => {
  return (
    <>
      {/* @todo why */}
      {row.DisabledSharedMailboxLogins.split('<br />').map((el) => (
        <>
          {el}
          <br />
        </>
      ))}
    </>
  )
}

SharedMailboxesCard.propTypes = {
  row: PropTypes.object,
}

const UnusedLicensesCard = ({ row }) => {
  const tabularized = row.UnusedLicenseList.split('<br />')
    .map((line) =>
      line
        .split(', ')
        .map((sku) => sku.split(': ').reduce((key, val) => ({ [key]: val })))
        .reduce((pv, cv) => ({ ...pv, ...cv })),
    )
    .sort((a, b) => b.SKU.toLocaleLowerCase().localeCompare(a.SKU.toLocaleLowerCase()))

  const columns = [
    {
      text: 'SKU',
      dataField: 'SKU',
    },
    {
      text: 'Purchased',
      dataField: 'Purchased',
    },
    {
      text: 'Consumed',
      dataField: 'Consumed',
    },
  ]

  return <BootstrapTable keyField="SKU" data={tabularized} striped columns={columns} />
}
UnusedLicensesCard.propTypes = {
  row: PropTypes.object,
}

const BestPracticeAnalyser = () => {
  const dispatch = useDispatch()
  const bpa = useSelector((state) => state.standards.bpa)

  useEffect(() => {
    async function load() {
      dispatch(loadBestPracticeReport())
    }

    load()
  }, [])

  const handleSharedMailboxes = ({ row }) => {
    dispatch(
      setModalContent({
        body: <SharedMailboxesCard row={row} />,
        title: `Shared Mailboxes with Enabled User Accounts`,
      }),
    )
    dispatch(showModal())
  }

  const handleUnusedLicense = ({ row }) => {
    dispatch(
      setModalContent({
        body: <UnusedLicensesCard row={row} />,
        title: `SKUs with Unassigned Licenses`,
        size: 'lg',
      }),
    )
    dispatch(showModal())
  }

  const handleMessageCopy = ({ row }) => {
    dispatch(
      setModalContent({
        body: (
          <>
            {row.MessageCopyForSendList.split('<br />').map((el) => (
              <>
                {el}
                <br />
              </>
            ))}
          </>
        ),
        title: 'Message Copy for Send As',
      }),
    )
    dispatch(showModal())
  }

  const columns = [
    {
      text: 'Tenant',
      dataField: 'Tenant',
      sort: true,
    },
    {
      text: 'Last Refresh',
      dataField: 'LastRefresh',
      formatter: (cell) => <div>{moment.utc(cell).format('MMM D YYYY')}</div>,
      sort: true,
    },
    {
      text: 'Unified Audit Log Enabled',
      dataField: 'UnifiedAuditLog',
      formatter: rowFormatter('error'),
    },
    {
      text: 'Security Defaults Enabled',
      dataField: 'SecureDefaultState',
      formatter: (cell) => {
        if (cell) {
          return <CellBoolean cell={cell} />
        } else if (cell === '') {
          return <CellBadge label="No Data" color="info" />
        }
        return <IconWarning />
      },
    },
    {
      text: 'Message Copy for Send As',
      dataField: 'MessageCopyForSend',
      formatter: (cell, row) => {
        if (cell === 'PASS') {
          return <IconSuccess />
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
      text: 'User Cannot Consent to Apps',
      dataField: 'AdminConsentForApplications',
      formatter: (cell, row) => {
        if (cell) {
          return <IconError />
        } else if (cell === '') {
          return <CellBadge label="No Data" color="info" />
        }
        return <IconSuccess />
      },
    },
    {
      text: 'Passwords Do Not Expire',
      dataField: 'DoNotExpirePasswords',
      formatter: rowFormatter('error'),
    },
    {
      text: 'Privacy in Reports Enabled',
      dataField: 'PrivacyEnabled',
      formatter: (cell, row) => {
        if (cell) {
          return <IconWarning />
        } else if (cell === '') {
          return <CellBadge label="No Data" color="info" />
        }
        return <IconSuccess />
      },
    },
    {
      text: 'Self Service Password Reset Enabled',
      dataField: 'SelfServicePasswordReset',
      formatter: (cell) => {
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
      text: 'Modern Auth Enabled',
      dataField: 'EnableModernAuth',
      formatter: rowFormatter('error'),
    },
    {
      text: 'Shared Mailboxes Logins Disabled',
      dataField: 'DisabledSharedMailboxLoginsCount',
      formatter: (cell, row) => {
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
          return <IconSuccess />
        }
        return <CellBadge label="No Data" color="info" />
      },
    },
    {
      text: 'Unused Licenses',
      dataField: 'UnusedLicensesResult',
      formatter: (cell, row) => {
        if (cell === 'FAIL') {
          return (
            <CButton className="btn-danger" size="sm" onClick={() => handleUnusedLicense({ row })}>
              {row.UnusedLicensesCount} SKU{row.UnusedLicensesCount > 1 ? 's' : ''}
            </CButton>
          )
        } else if (cell === 'PASS') {
          return <IconSuccess />
        }
        return <CellBadge label="No Data" color="info" />
      },
    },
    {
      text: 'Secure Score',
      dataField: 'SecureScorePercentage',
      formatter: (cell, row) => {
        if (!cell) {
          return <CellBadge color="info" label="No Data" />
        }
        return CellProgressBar({ value: row.SecureScorePercentage })
      },
    },
  ]

  return (
    <div>
      <div className="bg-white rounded p-5">
        <h3>Best Practice Analyser Report</h3>
        {!bpa.loaded && bpa.loading && <CSpinner />}
        {!bpa.loading && bpa.loaded && (
          <ToolkitProvider keyField="Tenant" columns={columns} data={bpa.report} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                {/* eslint-disable-next-line react/prop-types */}
                <ExportCSVButton {...props.csvProps}>
                  <CButton>CSV</CButton>
                </ExportCSVButton>
                {/* @TODO make modal confirm */}
                <CButton onClick={() => dispatch(forceRefreshBestPracticeReport())}>
                  Force Refresh Data
                </CButton>
                <hr />
                {/*eslint-disable */}
                <BootstrapTable
                  {...props.baseProps}
                  pagination={pagination}
                  wrapperClasses="table-responsive"
                  striped
                />
                {/*eslint-enable */}
              </div>
            )}
          </ToolkitProvider>
        )}
      </div>
    </div>
  )
}

export default BestPracticeAnalyser
