import React, { useEffect } from 'react'
import TenantSelector from 'src/components/cipp/TenantSelector'
import { useDispatch, useSelector } from 'react-redux'
import { CSpinner } from '@coreui/react'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import { getListApi } from 'src/store/modules/listapi'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CButton } from '@coreui/react'

import paginationFactory from 'react-bootstrap-table2-paginator'
import CellBoolean from 'src/components/cipp/CellBoolean'

function CIPPApi(APIProps) {
  const { ExportCSVButton } = CSVExport
  const { SearchBar } = Search
  const pagination = paginationFactory()
  const Formatter = (cell) => CellBoolean({ cell })

  const dispatch = useDispatch()
  const tenant = useSelector((state) => state.app.currentTenant)
  const voice = useSelector((state) => state.listApi.list)
  useEffect(() => {
    async function load() {
      if (Object.keys(tenant).length !== 0) {
        dispatch(getListApi({ apiname: APIProps.apiurl }, { tenant: tenant }))
      }
    }

    load()
  }, [])

  const action = (tenant) => {
    dispatch(getListApi({ apiname: APIProps.apiurl }, { tenant: tenant }))
  }

  return (
    <div>
      <TenantSelector action={action} />
      <hr />
      <div className="bg-white rounded p-5">
        <h3>{APIProps.title}</h3>
        {Object.keys(tenant).length === 0 && <span>Select a tenant to get started.</span>}
        {!voice.loaded && voice.loading && <CSpinner />}
        {/* eslint-disable-next-line react/prop-types */}
        {voice.loaded && !voice.loading && Object.keys(tenant).length !== 0 && (
          <ToolkitProvider keyField="displayName" columns={APIProps.columns} data={voice.list}>
            {/* eslint-disable-next-line react/prop-types */}
            {(props) => (
              <div>
                {/* eslint-disable-next-line react/prop-types */}
                <SearchBar {...props.searchProps} />
                <hr />
                {/* eslint-disable-next-line react/prop-types */}
                <ExportCSVButton {...props.csvProps}>
                  <CButton>CSV</CButton>
                </ExportCSVButton>
                <ExportPDFButton
                  pdfdata={voice.list}
                  pdfheaders={APIProps.columns}
                  pdfsize="A4"
                  reportname={APIProps.reportname}
                ></ExportPDFButton>
                {/*eslint-disable */}
                <BootstrapTable
                  {...props.baseProps}
                  pagination={pagination}
                  wrapperClasses="table-responsive"
                />
                {/*eslint-enable */}
              </div>
            )}
          </ToolkitProvider>
        )}
        {!voice.loaded && !voice.loading && voice.error && (
          <span>Failed to load Business Voice List</span>
        )}
      </div>
    </div>
  )
}

export default CIPPApi
