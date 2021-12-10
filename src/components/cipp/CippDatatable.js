import React from 'react'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import BootstrapTable from 'react-bootstrap-table-next'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CButton, CSpinner } from '@coreui/react'

import paginationFactory from 'react-bootstrap-table2-paginator'
import { useListDatatableQuery } from '../../store/api/datatable'
import PropTypes from 'prop-types'

const { ExportCSVButton } = CSVExport
const { SearchBar } = Search
const pagination = paginationFactory()

export default function CippDatatable({ path, params, columns, reportName }) {
  const { data, isFetching, error } = useListDatatableQuery({ path, params })

  return (
    <div>
      {isFetching && <CSpinner />}
      {!isFetching && error && <span>Error loading data</span>}
      {!isFetching && !error && (
        <ToolkitProvider keyField="displayName" columns={columns} data={data}>
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
                pdfdata={data}
                pdfheaders={columns}
                pdfsize="A4"
                reportname={reportName}
              />
              {/* eslint-disable */}
              <BootstrapTable
                {...props.baseProps}
                pagination={pagination}
                striped
                condensed
                wrapperClasses="table-responsive"
              />
              {/* eslint-enable */}
            </div>
          )}
        </ToolkitProvider>
      )}
    </div>
  )
}

CippDatatable.propTypes = {
  path: PropTypes.string.isRequired,
  params: PropTypes.object,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  reportName: PropTypes.string.isRequired,
}
