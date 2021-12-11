import React from 'react'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CButton, CSpinner } from '@coreui/react'
import DataTable, { TableProps } from 'react-data-table-component'
import { useListDatatableQuery } from '../../store/api/datatable'
import PropTypes from 'prop-types'

export default function CippDatatable({
  path,
  params,
  reportName,
  columns = [],
  tableProps: { pagination = true, responsive = true, dense = true, striped = true, ...rest } = {},
}) {
  const { data, isFetching, error } = useListDatatableQuery({ path, params })
  const actionsMemo = React.useMemo(
    () => (
      <ExportPDFButton pdfdata={data} pdfheaders={columns} pdfsize="A4" reportname={reportName} />
    ),
    [columns, data, reportName],
  )
  return (
    <div>
      {isFetching && <CSpinner />}
      {!isFetching && error && <span>Error loading data</span>}
      {!isFetching && !error && (
        <div>
          <hr />
          {/* eslint-disable */}
              <DataTable
                pagination={pagination}
                responsive={responsive}
                dense={dense}
                striped={striped}
                columns={columns}
                data={data}
                actions={actionsMemo}
                {...rest}
              />
              {/* eslint-enable */}
        </div>
      )}
    </div>
  )
}

CippDatatable.propTypes = {
  path: PropTypes.string.isRequired,
  params: PropTypes.object,
  reportName: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  tableProps: PropTypes.shape(TableProps),
}
