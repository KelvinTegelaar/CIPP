import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadMFAReport } from '../../../store/modules/reports'
import TenantSelector from '../../../components/cipp/TenantSelector'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import { CButton } from '@coreui/react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { Loading } from '../../../components'
import CellBoolean from '../../../components/cipp/CellBoolean'

const { SearchBar } = Search
const { ExportCSVButton } = CSVExport
const pagination = paginationFactory()
const Formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    text: 'User Principal Name',
    dataField: 'UPN',
    sort: true,
  },
  {
    text: 'Account Enabled',
    dataField: 'AccountEnabled',
    sort: true,
    formatter: Formatter,
  },
  {
    text: 'Per User MFA Status',
    dataField: 'PerUser',
    sort: true,
    formatter: (cell) => {
      if (cell === 'Enforced') {
        return (
          <div>
            <CellBoolean cell={true} /> Enforced
          </div>
        )
      } else if (cell === 'Disabled') {
        return (
          <div>
            <CellBoolean cell={false} /> Disabled
          </div>
        )
      }
      return cell
    },
  },
  {
    text: 'Registered for Conditional MFA',
    dataField: 'MFARegistration',
    sort: true,
    formatter: Formatter,
  },
  {
    text: 'Enforced via Conditional Access',
    dataField: 'CoveredByCA',
    sort: true,
    formatter: (cell) => {
      if (cell === 'All Users') {
        return (
          <div>
            <CellBoolean cell={true} /> All Users
          </div>
        )
      } else if (cell === 'None') {
        return (
          <div>
            <CellBoolean cell={false} /> None
          </div>
        )
      }
      return cell
    },
  },
  {
    text: 'Enforced via Security Defaults',
    dataField: 'CoveredBySD',
    sort: true,
    formatter: Formatter,
  },
]

const MFAReport = () => {
  const dispatch = useDispatch()
  const mfa = useSelector((state) => state.reports.mfa)
  const tenant = useSelector((state) => state.app.currentTenant)

  const tenantSelected = tenant && tenant.defaultDomainName

  const handleTenantSelect = (tenant) => {
    dispatch(loadMFAReport({ domain: tenant.defaultDomainName }))
  }

  useEffect(() => {
    async function load() {
      dispatch(loadMFAReport({ domain: tenant.defaultDomainName }))
    }
    if (tenantSelected) {
      load()
    }
  }, [])

  return (
    <div className="bg-white rounded p-5">
      <h3>MFA Report</h3>
      <hr />
      <TenantSelector action={handleTenantSelect} />
      {!tenantSelected && !mfa.loading && !mfa.loaded && <>Select a Tenant</>}
      {mfa.loading && !mfa.loaded && (
        <div style={{ padding: 20 }}>
          <Loading />
        </div>
      )}
      {mfa.loaded && !mfa.loading && (
        <>
          <hr />
          <ToolkitProvider keyField="UPN" columns={columns} data={mfa.report} search>
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                {/* eslint-disable-next-line react/prop-types */}
                <ExportCSVButton {...props.csvProps}>
                  <CButton>CSV</CButton>
                </ExportCSVButton>
                <hr />
                {/*eslint-disable */}
              <BootstrapTable
                {...props.baseProps}
                pagination={pagination}
                striped
                wrapperClasses="table-responsive"
              />
              {/*eslint-enable */}
              </div>
            )}
          </ToolkitProvider>
        </>
      )}
    </div>
  )
}

export default MFAReport
