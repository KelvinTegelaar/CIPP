import React, { useEffect } from 'react'
import { CButton } from '@coreui/react'
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

const { SearchBar } = Search
const { ExportCSVButton } = CSVExport

const CIconWarning = () => <CIcon icon={cilWarning} className="text-warning" />
const CIconXCircle = () => <CIcon icon={cilXCircle} className="text-danger" />
const CIconCheckCircle = () => <CIcon icon={cilCheckCircle} className="text-success" />

const rowFormatter = (type) => {
  const FailIcon = type === 'circle' ? CIconXCircle : CIconWarning

  const CellFormatter = (cell) => {
    console.log('cell', cell)
    if (cell === '') {
      return <div>No Data</div>
    } else if (cell === true) {
      return <CIconCheckCircle />
    } else {
      return <FailIcon />
    }
  }

  return CellFormatter
}

const pagination = paginationFactory()

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
    formatter: rowFormatter('circle'),
  },
  {
    text: 'Security Defaults Enabled',
    dataField: 'SecureDefaultState',
    formatter: rowFormatter('circle'),
  },
  {
    text: 'Message Cop for Send As',
    dataField: 'MessageCopyForSend',
    formatter: rowFormatter('warn'),
  },
  {
    text: 'User Cannot Consernt to Apps',
    dataField: 'AdminConsentForApplications',
    formatter: rowFormatter('warn'),
  },
  {
    text: 'Passwords Do Not Expire',
    dataField: 'DoNotExpirePasswords',
    formatter: rowFormatter('warn'),
  },
  {
    text: 'Privacy in Reports Enabled',
    dataField: 'PrivacyEnabled',
    formatter: rowFormatter('warn'),
  },
  {
    text: 'Self Service Password Reset Enabled',
    dataField: 'SelfServicePasswordReset',
    formatter: rowFormatter('warn'),
  },
  {
    text: 'Modern Auth Enabled',
    dataField: 'EnableModernAuth',
    formatter: rowFormatter('circle'),
  },
  {
    text: 'Shared Mailboxes Logins Disabled',
    dataField: 'DisabledSharedMailboxLoginsCount',
  },
  {
    text: 'Unused Licenses',
    dataField: 'UnusedLicensesResult',
    formatter: rowFormatter('circle'),
  },
  {
    text: 'Secure Score',
    dataField: 'SecureScoreCurrent',
  },
]

const BestPracticeAnalyzer = () => {
  const dispatch = useDispatch()
  const bpa = useSelector((state) => state.standards.bpa)

  useEffect(() => {
    async function load() {
      dispatch(loadBestPracticeReport())
    }

    load()
  }, [])

  return (
    <div>
      <h3>Best Practice Analyzer Report</h3>
      {!bpa.loaded && bpa.loading && (
        <div className="pt-3 text-center">
          <div className="sk-spinner sk-spinner-pulse" />
        </div>
      )}
      {!bpa.loading && bpa.loaded && (
        <ToolkitProvider
          keyField="bpareport"
          columns={columns}
          data={bpa.report}
          search
          pagination={pagination}
        >
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
              {/* eslint-disable-next-line react/prop-types */}
              <BootstrapTable {...props.baseProps} />
            </div>
          )}
        </ToolkitProvider>
      )}
    </div>
  )
}

export default BestPracticeAnalyzer
