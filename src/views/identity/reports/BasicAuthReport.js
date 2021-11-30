import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { loadBasicAuthReport } from '../../../store/modules/reports'
import TenantSelector from '../../../components/cipp/TenantSelector'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import { CButton } from '@coreui/react'
import BootstrapTable from 'react-bootstrap-table-next'
import paginationFactory from 'react-bootstrap-table2-paginator'
import { Loading } from '../../../components'

const { SearchBar } = Search
const { ExportCSVButton } = CSVExport
const pagination = paginationFactory()

const columns = [
  {
    text: 'User Principal Name',
    dataField: 'UPN',
    sort: true,
  },
  {
    text: 'Basic Auth',
    dataField: 'BasicAuth',
    sort: true,
  },
]

const BasicAuthReport = () => {
  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const basicAuth = useSelector((state) => state.reports.basicAuth)

  const tenantSelected = tenant && tenant.defaultDomainName

  const handleTenantSelect = (tenant) => {
    dispatch(loadBasicAuthReport({ domain: tenant.defaultDomainName }))
  }

  useEffect(() => {
    if (tenantSelected) {
      dispatch(loadBasicAuthReport({ domain: tenant.defaultDomainName }))
    }
  }, [])

  return (
    <div>
      <TenantSelector action={handleTenantSelect} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>Basic Auth Report</h3>
        {!tenantSelected && !basicAuth.loading && !basicAuth.loaded && <>Select a Tenant</>}
        {basicAuth.loading && !basicAuth.loaded && (
          <div style={{ padding: 20 }}>
            <Loading />
          </div>
        )}
        {basicAuth.loaded && !basicAuth.loading && (
          <>
            <hr />
            <ToolkitProvider keyField="UPN" columns={columns} data={basicAuth.report} search>
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
    </div>
  )
}

export default BasicAuthReport
