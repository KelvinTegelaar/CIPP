import React from 'react'
import ExportPDFButton from 'src/components/cipp/PdfButton'
import { CSpinner, CFormInput } from '@coreui/react'
import DataTable from 'react-data-table-component'
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
      className="d-flex justify-content-start"
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
    theme = 'dark',
    pagination = true,
    responsive = true,
    dense = true,
    striped = true,
    subheader = true,
    expandableRows,
    expandableRowsComponent,
    expandableRowsHideExpander,
    expandOnRowClicked,
    selectableRows,
    onSelectedRowsChange,
    highlightOnHover = true,
    actions = [],
    ...rest
  } = {},
}) {
  const { data = [], isFetching, error } = useListDatatableQuery({ path, params })

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
    return (
      <>
        <div className="w-50 p-3 d-flex justify-content-start">
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />
        </div>
        <div className="w-50 d-flex justify-content-end">{defaultActions}</div>
      </>
    )
  }, [filterText, resetPaginationToggle, columns, data, reportName, actions])

  return (
    <div>
      {isFetching && <CSpinner />}
      {!isFetching && error && <span>Error loading data</span>}
      {!isFetching && !error && (
        <div>
          <DataTable
            // theme={theme}
            subHeader={subheader}
            selectableRows={selectableRows}
            onSelectedRowsChange={onSelectedRowsChange}
            subHeaderComponent={subHeaderComponentMemo}
            subHeaderAlign="left"
            paginationResetDefaultPage={resetPaginationToggle}
            //actions={actionsMemo}
            pagination={pagination}
            responsive={responsive}
            dense={dense}
            striped={striped}
            columns={columns}
            data={filteredItems}
            expandableRows={expandableRows}
            expandableRowsComponent={expandableRowsComponent}
            highlightOnHover={highlightOnHover}
            expandOnRowClicked={expandOnRowClicked}
            defaultSortAsc
            defaultSortFieldId={1}
            paginationPerPage={25}
            paginationRowsPerPageOptions={[25, 50, 100, 200, 500]}
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
  tableProps: PropTypes.object,
}
