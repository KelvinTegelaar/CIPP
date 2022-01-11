import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { CButton, CCard, CCardHeader, CCardTitle, CCardBody } from '@coreui/react'
import {
  CellBadge,
  CippDatatable,
  cellProgressBarFormatter,
  CippOffcanvas,
} from '../../../components/cipp'
/*import { ModalService } from '../../../components'*/
import cellGetProperty from '../../../components/cipp/cellGetProperty'
import IndividualDomainCheck from './IndividualDomain'

const MoreInfoContent = ({ row }) => {
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
MoreInfoContent.propTypes = {
  row: PropTypes.object.isRequired,
}

function checkDomain(tenantDomain) {
  return (
    <div key={tenantDomain}>
      <IndividualDomainCheck initialDomain={tenantDomain} readOnly={true} isOffcanvas={true} />
    </div>
  )
}
checkDomain.propTypes = {
  tenantDomain: PropTypes.string,
}

const DomainsAnalyser = () => {
  const [individualDomainResults, setIndividualDomainResults] = useState()
  const [domainCheckVisible, setDomainCheckVisible] = useState(false)

  const handleMoreInfo = ({ row }) => {
    /*ModalService.open({
      body: <MoreInfoCard row={row} />,
      title: `${row.Tenant} More Information`,
    })*/
    setIndividualDomainResults(checkDomain(row.Domain))
    setDomainCheckVisible(true)
  }

  const columns = [
    {
      name: 'Domain',
      selector: (row) => row['Domain'],
      sort: true,
    },
    {
      name: 'Security Score',
      selector: (row) => {
        if (!row['Score']) {
          return ''
        } else {
          return row['ScorePercentage']
        }
      },
      sort: true,
      cell: cellProgressBarFormatter(),
    },
    {
      name: 'Mail Provider',
      selector: (row) => row['MailProvider'],
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)
        return <CellBadge label={cell} color={cell === 'Unknown' ? 'warning' : 'info'} />
      },
    },
    {
      name: 'SPF Pass Test',
      selector: (row) => row['SPFPassTest'],
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)
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
      name: 'MX Pass Test',
      selector: (row) => row['MXPassTest'],
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)
        if (cell === true) {
          return <CellBadge color="success" label="MX Pass" />
        } else if (cell === false) {
          return <CellBadge color="danger" label="MX Fail" />
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      name: 'DMARC Present',
      selector: (row) => row['DMARCPresent'],
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

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
      name: 'DMARC Action Policy',
      selector: (row) => row['DMARCActionPolicy'],
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

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
      name: 'DMARC % Pass',
      selector: (row) => row['DMARCPercentagePass'],
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

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
      name: 'DNSSec Enabled',
      selector: (row) => row['DNSSECPresent'],
      sort: true,
      cell: (row, index, column) => {
        const cell = cellGetProperty(row, index, column)

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
      name: 'DKIM Enabled',
      selector: (row) => row['DKIMEnabled'],
      sort: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)
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
      name: 'More Info',
      dataField: 'moreInfo',
      isDummyField: true,
      sort: true,
      cell: (row) => {
        return (
          <CButton size="sm" onClick={() => handleMoreInfo({ row })}>
            More Info
          </CButton>
        )
      },
    },
  ]

  return (
    <div>
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Domain Analyser</CCardTitle>
        </CCardHeader>
        <CCardBody>
          <CippDatatable
            reportName="Domains-Analyzer"
            path="/api/DomainAnalyser_List"
            columns={columns}
          />
        </CCardBody>
      </CCard>

      <CippOffcanvas
        id="individual-domain"
        visible={domainCheckVisible}
        hideFunction={() => setDomainCheckVisible(false)}
        title="More Info"
        placement="end"
      >
        {individualDomainResults}
      </CippOffcanvas>
    </div>
  )
}

export default DomainsAnalyser
