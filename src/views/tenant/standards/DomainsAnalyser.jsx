import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { CButton, CSpinner } from '@coreui/react'
import { CellBadge, cellProgressBarFormatter } from 'src/components/tables'
import { CippOffcanvas, ModalService } from 'src/components/utilities'
import { IndividualDomainCheck } from 'src/views/tenant/standards/IndividualDomain'
import { CippPageList } from 'src/components/layout'
import { useExecDomainsAnalyserMutation } from 'src/store/api/reports'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faEllipsisV,
  faExclamationTriangle,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const RefreshAction = () => {
  const [execDomainsAnalyser, { isLoading, isSuccess, error }] = useExecDomainsAnalyserMutation()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Are you sure you want to force the Domain Analysis to run? This will slow down normal
          usage considerably. <br />
          <i>Please note: this runs at 4:30 AM UTC automatically every day.</i>
        </div>
      ),
      onConfirm: () => execDomainsAnalyser(),
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

function DeleteAction({ domain }) {
  const [execDomainsDelete, { isUninitialized, isLoading, isSuccess, error }] =
    useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: <div>Are you sure you want to delete '{domain}'?</div>,
      onConfirm: () =>
        execDomainsDelete({
          path: `/api/ExecDnsConfig?Action=RemoveDomain&Domain=${domain}`,
        }),
    })

  return (
    <CButton onClick={showModal} className="mb-2">
      {isUninitialized && <FontAwesomeIcon icon={faTrash} className="me-2" />}
      {isLoading && <CSpinner size="sm" className="me-2" />}
      {error && <FontAwesomeIcon icon={faExclamationTriangle} className="me-2" />}
      {isSuccess && <FontAwesomeIcon icon={faCheck} className="me-2" />}
      Delete Domain
    </CButton>
  )
}

DeleteAction.propTypes = {
  domain: PropTypes.string,
}

function checkDomain(tenantDomain) {
  return (
    <div key={tenantDomain}>
      <DeleteAction domain={tenantDomain} />
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
  const currentTenant = useSelector((state) => state.app.currentTenant)
  const [tableRequestGuid, setRequestGuid] = useState('')

  const handleMoreInfo = ({ row }) => {
    setIndividualDomainResults(checkDomain(row.Domain))
    setDomainCheckVisible(true)
  }

  const omitTenant = () => {
    if (currentTenant.defaultDomainName === 'AllTenants') {
      return false
    } else {
      return true
    }
  }

  const columns = [
    {
      name: 'Domain',
      selector: (row) => row['Domain'],
      sortable: true,
      exportSelector: 'Domain',
      minWidth: '300px',
    },
    {
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      exportSelector: 'Tenant',
      minWidth: '300px',
      omit: omitTenant(),
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
      sortable: true,
      exportSelector: 'ScorePercentage',
      cell: cellProgressBarFormatter(),
    },
    {
      name: 'Mail Provider',
      selector: (row) => row['MailProvider'],
      exportSelector: 'MailProvider',
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)
        return <CellBadge label={cell} color={cell === 'Unknown' ? 'warning' : 'info'} />
      },
    },
    {
      name: 'SPF Pass Test',
      selector: (row) => row['SPFPassAll'],
      exportSelector: 'SPFPassAll',
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)
        if (cell === true) {
          return <CellBadge color="success" label="SPF Pass" />
        } else if (cell === false) {
          return <CellBadge color="danger" label="SPF Fail" />
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      name: 'MX Pass Test',
      selector: (row) => row['MXPassTest'],
      exportSelector: 'MXPassTest',
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)
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
      exportSelector: 'DMARCPresent',
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)

        if (cell === true) {
          if (row.DMARCReportingActive === true) {
            return <CellBadge color="success">DMARC Present</CellBadge>
          }
          return <CellBadge color="warning">DMARC No Reporting</CellBadge>
        } else if (cell === false) {
          return <CellBadge color="danger">DMARC Missing</CellBadge>
        }
        return <CellBadge color="info" label="No Data" />
      },
    },
    {
      name: 'DMARC Action Policy',
      selector: (row) => row['DMARCActionPolicy'],
      exportSelector: 'DMARCActionPolicy',
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)

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
      exportSelector: 'DMARCPercentagePass',
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)

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
      exportSelector: 'DNSSECPresent',
      sortable: true,
      cell: (row, index, column) => {
        const cell = column.selector(row)

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
      exportSelector: 'DKIMEnabled',
      sortable: true,
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
      sortable: true,
      cell: (row) => {
        return (
          <CButton size="sm" color="link" onClick={() => handleMoreInfo({ row })}>
            <FontAwesomeIcon icon={faEllipsisV} />
          </CButton>
        )
      },
    },
  ]

  return (
    <CippPageList
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      title="Domains Analyser"
      tenantSelector={true}
      showAllTenantSelector={true}
      datatable={{
        filterlist: [
          {
            filterName: 'Exclude onmicrosoft domains',
            filter: 'Complex: domain notlike onmicrosoft',
          },
        ],
        path: `/api/ListDomainAnalyser`,
        params: { tenantFilter: currentTenant.defaultDomainName },
        columns,
        reportName: 'Domains-Analyzer',
        tableProps: {
          actions: [<RefreshAction key="refresh-action-button" />],
        },
      }}
    >
      <CippOffcanvas
        id="individual-domain"
        visible={domainCheckVisible}
        hideFunction={() => setDomainCheckVisible(false)}
        title="More Info"
        placement="end"
      >
        {individualDomainResults}
      </CippOffcanvas>
    </CippPageList>
  )
}

export default DomainsAnalyser
