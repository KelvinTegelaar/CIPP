import React from 'react'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CButton, CSpinner, CFormInput } from '@coreui/react'
import DataTable, { TableProps } from 'react-data-table-component'
import { useListDatatableQuery } from '../../store/api/datatable'
import PropTypes from 'prop-types'

export default function CippDatatable({
  path,
  params,
  reportName,
  columns = [],
  tableProps: {
    pagination = true,
    responsive = true,
    dense = true,
    striped = true,
    subheader = true,
    ...rest
  } = {},
}) {
  const { data = [], isFetching, error } = useListDatatableQuery({ path, params })
  const actionsMemo = React.useMemo(
    () => (
      <ExportPDFButton pdfData={data} pdfHeaders={columns} pdfSize="A4" reportName={reportName} />
    ),
    [columns, data, reportName],
  )

  {
    /* eslint-disable */
  }
  const FilterComponent = ({ filterText, onFilter, onClear }) => (
    <>
      <CFormInput
        style={{
          height: '32px',
          width: '200px',
        }}
        id="search"
        type="text"
        placeholder="Filter"
        aria-label="Search Input"
        value={filterText}
        onChange={onFilter}
      />
      <CButton type="button" size="sm" className="text-white" onClick={onClear}>
        Clear
      </CButton>
    </>
  )

  const [filterText, setFilterText] = React.useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false)
  const filteredItems = data.filter(
    (item) => JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1,
  )

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }
    {
      /* eslint-disable */
    }
    return (
      <FilterComponent
        onFilter={(e) => setFilterText(e.target.value)}
        onClear={handleClear}
        filterText={filterText}
      />
    )
  }, [filterText, resetPaginationToggle])
  return (
    <div>
      {isFetching && <CSpinner />}
      {!isFetching && error && <span>Error loading data</span>}
      {!isFetching && !error && (
        <div>
          <hr />
          {/* eslint-disable */}
          <DataTable
            subHeader={subheader}
            subHeaderComponent={subHeaderComponentMemo}
            paginationResetDefaultPage={resetPaginationToggle}
            actions={actionsMemo}
            pagination={pagination}
            responsive={responsive}
            dense={dense}
            striped={striped}
            columns={columns}
            data={filteredItems}
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
