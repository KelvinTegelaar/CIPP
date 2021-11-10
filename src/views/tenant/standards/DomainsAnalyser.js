import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import BootstrapTable from 'react-bootstrap-table-next'
import ToolkitProvider, { Search, CSVExport } from 'react-bootstrap-table2-toolkit'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { CButton, CProgress, CProgressBar } from '@coreui/react'

import {
  forceRefreshBestPracticeReport,
  forceRefreshDomainAnalyserReport,
  loadDomainsAnalyserReport,
} from '../../../store/modules/standards'

import CellProgressBar from '../../../components/cipp/CellProgressBar'
import CellBadge from '../../../components/cipp/CellBadge'
import { setModalContent, showModal } from '../../../store/modules/modal'

const { SearchBar } = Search
const { ExportCSVButton } = CSVExport
const pagination = paginationFactory()

const MoreInfoCard = ({ row }) => {
  return (
    <>
      <strong>Score Explanation: </strong>
      {row.ScoreExplanation}
      <br />
      <br />
      <strong>Expected SPF Record: </strong>
      {row.ExpectedSPFRecord}
      <br />
      <strong>Actual SPF Record: </strong>
      {row.ActualSPFRecord}
      <br />
      <br />
      <strong>DMARC Full Policy: </strong>
      {row.DMARCFullPolicy}
      <br />
      <br />
      <strong>Expected MX Record: </strong>
      {row.ExpectedMXRecord}
      <br />
      <br />
      <strong>Actual MX Record: </strong>
      {row.ActualMXRecord}
      <br />
      <br />
      <strong>Supported Services: </strong>
      {row.SupportedServices}
      <br />
      <br />
      <strong>Is Default Domain: </strong>
      {row.IsDefault}
      <br />
      <br />
      <strong>Data Last Refreshed:</strong>
      {row.LastRefresh}
    </>
  )
}
MoreInfoCard.propTypes = {
  row: PropTypes.object.isRequired,
}

const DomainsAnalyser = () => {
  const dispatch = useDispatch()
  const domains = useSelector((state) => state.standards.domains)

  useEffect(() => {
    dispatch(loadDomainsAnalyserReport())
  }, [])

  const handleMoreInfo = ({ row }) => {
    dispatch(
      setModalContent({
        body: <MoreInfoCard row={row} />,
        title: `${row.Tenant} More Information`,
      }),
    )
    dispatch(showModal())
  }

  const columns = [
    {
      text: 'Domain',
      dataField: 'Domain',
      sort: true,
    },
    {
      text: 'Security Score',
      dataField: 'Score',
      sort: true,
      formatter: (cell, row) => {
        if (!cell) {
          return <CellBadge color="info" label="No Data" />
        }
        return CellProgressBar({ value: row.ScorePercentage })
      },
    },
    {
      text: 'Mail Provider',
      dataField: 'MailProvider',
      sort: true,
      formatter: (cell) => {
        return <CellBadge label={cell} color={cell === 'Unknown' ? 'warning' : 'info'} />
      },
    },
    {
      text: 'SPF Pass Test',
      dataField: 'SPFPassTest',
      sort: true,
      formatter: (cell, row) => {
        if (cell === true) {
          if (row.SPFPassAll === true) {
            return <CellBadge color="success" label="SPF Pass" />
          } else {
            return <CellBadge color="danger" label="SPF Soft Fail" />
          }
        } else if (cell === false) {
          return <CellBadge color="danger" label="SPF Fail" />
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      text: 'MX Pass Test',
      dataField: 'MXPassTest',
      sort: true,
      formatter: (cell) => {
        if (cell === true) {
          return <CellBadge color="success" label="MX Pass" />
        } else if (cell === false) {
          return <CellBadge color="danger" label="MX Fail" />
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      text: 'DMARC Present',
      dataField: 'DMARCPresent',
      sort: true,
      formatter: (cell, row) => {
        if (cell === true) {
          if (row.DMARCReportingActive === true) {
            return <CellBadge color="success">DMARC Present</CellBadge>
          }
          return <CellBadge color="warning">DMARC Present No Reporting Data</CellBadge>
        } else if (cell === false) {
          return <CellBadge color="danger">DMARC Missing</CellBadge>
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      text: 'DMARC Action Policy',
      dataField: 'DMARCActionPolicy',
      sort: true,
      formatter: (cell, row) => {
        if (cell === 'Reject') {
          return <CellBadge color="success">Reject</CellBadge>
        } else if (cell === 'Quarantine') {
          return <CellBadge color="warning">Quarantine</CellBadge>
        } else if (cell === 'None') {
          return <CellBadge color="danger">Report Only</CellBadge>
        }
        return <CellBadge color="danger" label="No DMARC" />
      },
    },
    {
      text: 'DMARC % Pass',
      dataField: 'DMARCPercentagePass',
      sort: true,
      formatter: (cell) => {
        if (cell === true) {
          return <CellBadge color="success">All Mail Analysed</CellBadge>
        }
        if (cell === false) {
          return <CellBadge color="danger">Partial or None Analysed</CellBadge>
        }
        return <CellBadge color="danger">No DMARC</CellBadge>
      },
    },
    {
      text: 'DNSSec Enabled',
      dataField: 'DNSSECPresent',
      sort: true,
      formatter: (cell) => {
        if (cell === true) {
          return <CellBadge color="success">DNSSEC Enabled</CellBadge>
        }
        if (cell === false) {
          return <CellBadge color="danger">DNSSEC Disabled</CellBadge>
        }
        return <CellBadge color="info">No Data</CellBadge>
      },
    },
    {
      text: 'DKIM Enabled',
      dataField: 'DKIMEnabled',
      sort: true,
      formatter: (cell) => {
        if (cell === true) {
          return <CellBadge color="success">DKIM Enabled</CellBadge>
        }
        if (cell === false) {
          return <CellBadge color="danger">DKIM Disabled</CellBadge>
        }
        return <CellBadge color="warning">No Data</CellBadge>
      },
    },
    {
      text: 'More Info',
      sort: true,
      formatter: (cell, row) => {
        return (
          <CButton size="sm" onClick={() => handleMoreInfo({ row })}>
            More Information
          </CButton>
        )
      },
    },
  ]

  return (
    <div>
      <h3>Domains Analyser Report</h3>
      {!domains.loaded && domains.loading && (
        <div className="pt-3 text-center">
          <div className="sk-spinner sk-spinner-pulse" />
        </div>
      )}
      {domains.loaded && !domains.loading && (
        <ToolkitProvider
          keyField="domains-analyser-table"
          columns={columns}
          data={domains.report}
          search
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
              <CButton onClick={() => dispatch(forceRefreshDomainAnalyserReport())}>
                Force Refresh Data
              </CButton>
              <hr />
              {/* eslint-disable-next-line react/prop-types */}
              <BootstrapTable {...props.baseProps} pagination={pagination} striped />
            </div>
          )}
        </ToolkitProvider>
      )}
    </div>
  )
}

export default DomainsAnalyser
