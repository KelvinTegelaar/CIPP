import React from 'react'
import ToolkitProvider, { CSVExport, Search } from 'react-bootstrap-table2-toolkit'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CButton, CSpinner } from '@coreui/react'
import DataTable from 'react-data-table-component'

import paginationFactory from 'react-bootstrap-table2-paginator'
import { useListDatatableQuery } from '../../store/api/datatable'
import PropTypes from 'prop-types'

const { ExportCSVButton } = CSVExport
const { SearchBar } = Search
const pagination = paginationFactory()

export default function CippDatatable({ path, params, columns, reportName }) {
  const { data, isFetching, error } = useListDatatableQuery({ path, params })
  const actionsMemo = React.useMemo(
    () => (
      <ExportPDFButton pdfdata={data} pdfheaders={columns} pdfsize="A4" reportname={reportName} />
    ),
    [],
  )
  return (
    <div>
      {isFetching && <CSpinner />}
      {!isFetching && error && <span>Error loading data</span>}
      {!isFetching && !error && (
        <ToolkitProvider keyField="displayName" columns={columns} data={data}>
          {/* eslint-disable-next-line react/prop-types */}
          {(props) => (
            <div>
              <hr />
              {/* eslint-disable */}
              <DataTable
                selectableRows={props.selectableRows}
                pagination
                responsive
                dense
                striped
                columns={columns}
                data={data}
                actions={actionsMemo}
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
