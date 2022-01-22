import React from 'react'
import { ExportCsvButton, ExportPDFButton } from 'src/components/buttons'
import { CSpinner, CFormInput } from '@coreui/react'
import DataTable, { createTheme } from 'react-data-table-component'
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

const customSort = (rows, selector, direction) => {
  return rows.sort((a, b) => {
    // use the selector to resolve your field names by passing the sort comparitors
    let aField
    let bField
    if (typeof selector(a) === 'string') {
      aField = selector(a).toLowerCase()
    } else {
      aField = selector(a)
    }
    if (typeof selector(b) === 'string') {
      bField = selector(b).toLowerCase()
    } else {
      bField = selector(b)
    }

    let comparison = 0

    if (aField > bField) {
      comparison = 1
    } else if (aField < bField) {
      comparison = -1
    }

    return direction === 'desc' ? comparison * -1 : comparison
  })
}

export default function CippTable({
  data,
  isFetching = false,
  disablePDFExport = false,
  disableCSVExport = false,
  error,
  reportName,
  columns = [],
  tableProps: {
    keyField = 'id',
    theme = 'cyberdrain',
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
    sortFunction = customSort,
    onSelectedRowsChange,
    highlightOnHover = true,
    disableDefaultActions = false,
    actions = [],
    ...rest
  } = {},
}) {
  const [filterText, setFilterText] = React.useState('')
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false)
  const filteredItems = data.filter(
    (item) => JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1,
  )

  createTheme(
    'cyberdrain',
    {
      text: {
        primary: 'var(--cipp-table-primary-colour)',
        secondary: 'var(--cipp-table-secondary-colour)',
      },
      background: {
        default: 'var(--cipp-table-bg)',
      },
      context: {
        background: 'var(--cipp-table-context-bg)',
        text: 'var(--cipp-table-context-color)',
      },
      divider: {
        default: 'var(--cipp-table-divider)',
      },
      button: {
        default: 'var(--cipp-table-button-bg)',
        hover: 'var(--cipp-table-button-hover-bg)',
        focus: 'var(--cipp-table-button-focus-bg)',
        disabled: 'var(--cipp-table-button-disabled-bg)',
      },
      sortFocus: {
        default: 'var(--cipp-table-sort-focus-bg)',
      },
      highlightOnHover: {
        default: 'var(--cipp-table-highlight-on-hover-bg)',
        text: 'var(--cipp-table-highlight-on-hover-color)',
      },
      striped: {
        default: 'var(--cipp-table-striped-bg)',
        text: 'var(--cipp-table-striped-color)',
      },
    },
    'default',
  )

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }
    const defaultActions = []

    actions.forEach((action) => {
      defaultActions.push(action)
    })

    if (!disablePDFExport) {
      defaultActions.push([
        <ExportPDFButton
          key="export-pdf-action"
          pdfData={data}
          pdfHeaders={columns}
          pdfSize="A4"
          reportName={reportName}
        />,
      ])
    }
    if (!disableCSVExport) {
      defaultActions.push([
        <ExportCsvButton key="export-csv-action" csvData={data} reportName={reportName} />,
      ])
    }
    return (
      <>
        <div className="w-50 ms-n2 d-flex justify-content-start">
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onClear={handleClear}
            filterText={filterText}
          />
        </div>
        <div className="w-50 d-flex justify-content-end">{defaultActions}</div>
      </>
    )
  }, [
    filterText,
    resetPaginationToggle,
    columns,
    data,
    reportName,
    disablePDFExport,
    disableCSVExport,
    actions,
  ])

  return (
    <div className="ms-n3 me-n3 cipp-tablewrapper">
      {!isFetching && error && <span>Error loading data</span>}
      {!error && (
        <div>
          <DataTable
            className="cipp-table"
            theme={theme}
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
            sortFunction={customSort}
            paginationPerPage={25}
            progressPending={isFetching}
            progressComponent={<CSpinner color="info" component="div" />}
            paginationRowsPerPageOptions={[25, 50, 100, 200, 500]}
            {...rest}
          />
        </div>
      )}
    </div>
  )
}

export const CippTablePropTypes = {
  reportName: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  keyField: PropTypes.string,
  tableProps: PropTypes.object,
  data: PropTypes.array,
  isFetching: PropTypes.bool,
  disablePDFExport: PropTypes.bool,
  disableCSVExport: PropTypes.bool,
  error: PropTypes.object,
}

CippTable.propTypes = CippTablePropTypes
