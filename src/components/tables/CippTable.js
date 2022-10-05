import React from 'react'
import { useSelector } from 'react-redux'
import { ExportCsvButton, ExportPDFButton } from 'src/components/buttons'
import {
  CSpinner,
  CFormInput,
  CInputGroup,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import DataTable, { createTheme } from 'react-data-table-component'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faSearch } from '@fortawesome/free-solid-svg-icons'

const FilterComponent = ({ filterText, onFilter, onClear, filterlist, onFilterPreset }) => (
  <>
    <CInputGroup>
      <CDropdown variant="input-group">
        <CDropdownToggle
          color="#3e5c66"
          style={{
            backgroundColor: '#d8dbe0',
          }}
        >
          <FontAwesomeIcon icon={faSearch} color="#3e5c66" />
        </CDropdownToggle>
        <CDropdownMenu>
          <CDropdownItem onClick={() => onFilterPreset('')}>Clear Filter</CDropdownItem>
          {filterlist &&
            filterlist.map((item, idx) => {
              return (
                <CDropdownItem key={idx} onClick={() => onFilterPreset(item.filter)}>
                  {item.filterName}
                </CDropdownItem>
              )
            })}
        </CDropdownMenu>
      </CDropdown>
      <CFormInput
        aria-describedby="basic-addon1"
        id="search"
        type="text"
        placeholder="Filter"
        aria-label="Search Input"
        value={filterText}
        onChange={onFilter}
        className="d-flex justify-content-start"
      />
    </CInputGroup>
  </>
)

FilterComponent.propTypes = {
  filterText: PropTypes.string,
  onFilter: PropTypes.func,
  onClear: PropTypes.func,
  filterlist: PropTypes.arrayOf(PropTypes.object),
  onFilterPreset: PropTypes.func,
}

const customSort = (rows, selector, direction) => {
  return rows.sort((a, b) => {
    // use the selector to resolve your field names by passing the sort comparitors
    let aField
    let bField

    aField = selector(a)
    bField = selector(b)

    let comparison = 0

    if (aField?.toString().localeCompare(bField, 'en', { numeric: true }) > 0) {
      comparison = 1
    } else if (aField?.toString().localeCompare(bField, 'en', { numeric: true }) < 0) {
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
  filterlist,
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
  const customStyles = {
    subHeader: {
      style: {
        padding: '0px',
      },
    },
  }
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
      const keys = []
      columns.map((col) => {
        if (col.exportSelector) keys.push(col.exportSelector)
        return null
      })

      const filtered = data.map((obj) =>
        // eslint-disable-next-line no-sequences
        keys.reduce((acc, curr) => ((acc[curr] = obj[curr]), acc), {}),
      )
      defaultActions.push([
        <ExportCsvButton key="export-csv-action" csvData={filtered} reportName={reportName} />,
      ])
    }
    return (
      <>
        <div className="w-100 d-flex justify-content-start">
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onFilterPreset={(e) => setFilterText(e)}
            onClear={handleClear}
            filterText={filterText}
            filterlist={filterlist}
          />
          {defaultActions}
        </div>
      </>
    )
  }, [
    actions,
    disablePDFExport,
    disableCSVExport,
    filterText,
    filterlist,
    resetPaginationToggle,
    data,
    columns,
    reportName,
  ])
  const tablePageSize = useSelector((state) => state.app.tablePageSize)
  return (
    <div className="ms-n3 me-n3 cipp-tablewrapper">
      {!isFetching && error && <span>Error loading data</span>}
      {!error && (
        <div>
          <DataTable
            customStyles={customStyles}
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
            paginationPerPage={tablePageSize}
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
  filterlist: PropTypes.arrayOf(PropTypes.object),
}

CippTable.propTypes = CippTablePropTypes
