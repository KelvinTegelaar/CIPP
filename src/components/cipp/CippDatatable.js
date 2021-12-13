import React from 'react'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CButton, CSpinner, CFormInput } from '@coreui/react'
import DataTable, { TableProps } from 'react-data-table-component'
import { useListDatatableQuery } from '../../store/api/datatable'
import PropTypes from 'prop-types'

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
  </>
)

FilterComponent.propTypes = {
  filterText: PropTypes.string,
  onFilter: PropTypes.func,
  onClear: PropTypes.func,
}

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
    expandableRows,
    expandableRowExpanded,
    actions = [],
    ...rest
  } = {},
}) {
  const { data = [], isFetching, error } = useListDatatableQuery({ path, params })

  const defaultActions = [
    <ExportPDFButton
      key="export-pdf-action"
      pdfData={data}
      pdfHeaders={columns}
      pdfSize="A4"
      reportName={reportName}
    />,
  ]

  actions.forEach((action) => {
    defaultActions.push(action)
  })

  const actionsMemo = React.useMemo(() => defaultActions, [defaultActions])

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
          <DataTable
            sty
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
            expandableRows={expandableRows}
            expandableRowExpanded={expandableRowExpanded}
            defaultSortAsc
            defaultSortFieldId={1}
            {...rest}
          />
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
