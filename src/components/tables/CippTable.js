import React, { useRef } from 'react'
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
  CButton,
  CModal,
  CModalBody,
  CModalTitle,
  CCallout,
} from '@coreui/react'
import DataTable, { createTheme } from 'react-data-table-component'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faColumns, faSearch, faSync, faTasks } from '@fortawesome/free-solid-svg-icons'
import { useEffect } from 'react'
import { cellGenericFormatter } from './CellGenericFormat'
import { ModalService } from '../utilities'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { ConfirmModal } from '../utilities/SharedModal'

const FilterComponent = ({
  filterText,
  onFilter,
  onClear,
  filterlist,
  onFilterPreset,
  onFilterGraph,
}) => (
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
          <CDropdownItem
            onClick={() => {
              onFilterPreset('')
              onFilterGraph('')
            }}
          >
            Clear Filter
          </CDropdownItem>
          {filterlist &&
            filterlist.map((item, idx) => {
              if (item.hasOwnProperty('graphFilter') && item.graphFilter == true) {
                return (
                  <CDropdownItem key={idx} onClick={() => onFilterGraph(item.filter)}>
                    {item.filterName}
                  </CDropdownItem>
                )
              } else {
                return (
                  <CDropdownItem key={idx} onClick={() => onFilterPreset(item.filter)}>
                    {item.filterName}
                  </CDropdownItem>
                )
              }
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
  onFilterGraph: PropTypes.func,
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
  refreshFunction = null,
  graphFilterFunction = null,
  columns = [],
  dynamicColumns = true,
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
    actionsList,
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
  const inputRef = useRef('')
  const [loopRunning, setLoopRunning] = React.useState(false)
  const [massResults, setMassResults] = React.useState([])
  const [filterText, setFilterText] = React.useState('')
  const [updatedColumns, setUpdatedColumns] = React.useState(columns)
  const [selectedRows, setSelectedRows] = React.useState(false)
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const handleSelectedChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows)
    if (selectedRows.length < 1) {
      setSelectedRows(false)
    }
  }
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false)
  const filteredItems = data.filter(
    (item) => JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1,
  )
  const applyFilter = (e) => {
    setFilterText(e.target.value)
  }

  const setGraphFilter = (e) => {
    if (graphFilterFunction) {
      graphFilterFunction(e)
    }
  }

  useEffect(() => {
    if (columns !== updatedColumns) {
      setUpdatedColumns(columns)
    }
  }, [updatedColumns])

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
    const handleModal = (modalMessage, modalUrl, modalType = 'GET', modalBody, modalInput) => {
      if (modalType === 'GET') {
        ModalService.confirm({
          body: (
            <div style={{ overflow: 'visible' }}>
              <div>{modalMessage}</div>
            </div>
          ),
          title: 'Confirm',
          onConfirm: async () => {
            const resultsarr = []
            for (const row of selectedRows) {
              setLoopRunning(true)
              const urlParams = new URLSearchParams(modalUrl.split('?')[1])
              for (let [paramName, paramValue] of urlParams.entries()) {
                if (paramValue.startsWith('!')) {
                  urlParams.set(paramName, row[paramValue.replace('!', '')])
                }
              }
              const NewModalUrl = `${modalUrl.split('?')[0]}?${urlParams.toString()}`
              const results = await genericGetRequest({ path: NewModalUrl, refreshParam: row.id })
              resultsarr.push(results)
              setMassResults(resultsarr)
            }
            setLoopRunning(false)
          },
        })
      } else {
        ModalService.confirm({
          body: (
            <div style={{ overflow: 'visible' }}>
              {modalInput && (
                <div>
                  <CFormInput ref={inputRef} type="text" />
                </div>
              )}
              <div>{modalMessage}</div>
            </div>
          ),
          title: 'Confirm',
          onConfirm: async () => {
            const resultsarr = []
            for (const row of selectedRows) {
              setLoopRunning(true)
              const urlParams = new URLSearchParams(modalUrl.split('?')[1])
              for (let [paramName, paramValue] of urlParams.entries()) {
                if (paramValue.toString().startsWith('!')) {
                  urlParams.set(paramName, row[paramValue.replace('!', '')])
                }
              }
              const newModalBody = {}
              for (let [objName, objValue] of Object.entries(modalBody)) {
                if (objValue.toString().startsWith('!')) {
                  newModalBody[objName] = row[objValue.replace('!', '')]
                }
              }
              const NewModalUrl = `${modalUrl.split('?')[0]}?${urlParams.toString()}`
              const results = await genericPostRequest({
                path: NewModalUrl,
                values: { ...modalBody, ...newModalBody, ...{ input: inputRef.current.value } },
              })
              resultsarr.push(results)
              setMassResults(resultsarr)
            }
            setLoopRunning(false)
          },
        })
      }
    }
    const executeselectedAction = (item) => {
      handleModal(item.modalMessage, item.modalUrl, item.modalType, item.modalBody, item.modalInput)
    }
    const defaultActions = []
    const dataKeys = () => {
      if (filteredItems.length >= 1) {
        return Object.keys(filteredItems[0])
      } else {
        return ['No additional columns available']
      }
    }
    if (refreshFunction) {
      defaultActions.push([
        <CButton
          onClick={() => {
            refreshFunction((Math.random() + 1).toString(36).substring(7))
          }}
          className="m-1"
          size="sm"
        >
          <FontAwesomeIcon icon={faSync} />
        </CButton>,
      ])
    }

    if (!disablePDFExport || !disableCSVExport) {
      const keys = []
      const exportFormatter = {}
      columns.map((col) => {
        if (col.exportSelector) keys.push(col.exportSelector)
        if (col.exportFormatter) exportFormatter[col.exportSelector] = col.exportFormatter
        return null
      })

      const filtered = data.map((obj) =>
        // eslint-disable-next-line no-sequences
        /* keys.reduce((acc, curr) => ((acc[curr] = obj[curr]), acc), {}),*/
        keys.reduce((acc, curr) => {
          const key = curr.split('/')
          if (key.length > 1) {
            var property = obj
            for (var x = 0; x < key.length; x++) {
              if (property.hasOwnProperty(key[x]) && property[key[x]] !== null) {
                property = property[key[x]]
              } else {
                property = 'n/a'
                break
              }
            }
            acc[curr] = property
          } else {
            if (typeof exportFormatter[curr] === 'function') {
              acc[curr] = exportFormatter[curr]({ cell: obj[curr] })
            } else {
              acc[curr] = obj[curr]
            }
          }
          return acc
        }, {}),
      )

      if (!disablePDFExport) {
        if (dynamicColumns === true) {
          const addColumn = (columnname) => {
            var index = columns.length - 1
            let alreadyInArray = columns.find((o) => o.exportSelector === columnname)
            if (!alreadyInArray) {
              columns.splice(index, 0, {
                name: columnname,
                selector: (row) => row[columnname],
                sortable: true,
                exportSelector: columnname,
                cell: cellGenericFormatter(),
              })
            } else {
              let indexOfExisting = columns.findIndex((o) => o.exportSelector === columnname)
              columns = columns.splice(indexOfExisting, 1)
            }
            setUpdatedColumns(Date())
          }

          defaultActions.push([
            <CDropdown className="me-2" variant="input-group">
              <CDropdownToggle
                className="btn btn-primary btn-sm m-1"
                size="sm"
                style={{
                  backgroundColor: '#f88c1a',
                }}
              >
                <FontAwesomeIcon icon={faColumns} />
              </CDropdownToggle>
              <CDropdownMenu>
                {dataKeys() &&
                  dataKeys().map((item, idx) => {
                    return (
                      <CDropdownItem key={idx} onClick={() => addColumn(item)}>
                        {columns.find((o) => o.exportSelector === item) && (
                          <FontAwesomeIcon icon={faCheck} />
                        )}{' '}
                        {item}
                      </CDropdownItem>
                    )
                  })}
              </CDropdownMenu>
            </CDropdown>,
          ])
        }
        actions.forEach((action) => {
          defaultActions.push(action)
        })
        defaultActions.push([
          <ExportPDFButton
            key="export-pdf-action"
            pdfData={filtered}
            pdfHeaders={columns}
            pdfSize="A4"
            reportName={reportName}
          />,
        ])
      }

      if (!disableCSVExport) {
        defaultActions.push([
          <ExportCsvButton key="export-csv-action" csvData={filtered} reportName={reportName} />,
        ])
      }
    }
    if (selectedRows && actionsList) {
      defaultActions.push([
        <>
          <CDropdown className="me-2" variant="input-group">
            <CDropdownToggle
              className="btn btn-primary btn-sm m-1"
              size="sm"
              style={{
                backgroundColor: '#f88c1a',
              }}
            >
              Actions
            </CDropdownToggle>
            <CDropdownMenu>
              {actionsList.map((item, idx) => {
                return (
                  <CDropdownItem key={idx} onClick={() => executeselectedAction(item)}>
                    {item.label}
                  </CDropdownItem>
                )
              })}
            </CDropdownMenu>
          </CDropdown>
        </>,
      ])
    }
    return (
      <>
        <div className="w-100 d-flex justify-content-start">
          <FilterComponent
            onFilter={(e) => setFilterText(e.target.value)}
            onFilterPreset={(e) => {
              setFilterText(e)
              setGraphFilter('')
            }}
            onFilterGraph={(e) => {
              setFilterText('')
              setGraphFilter(e)
            }}
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
          {(columns.length === updatedColumns.length || !dynamicColumns) && (
            <>
              {(massResults.length >= 1 || loopRunning) && (
                <CCallout color="info">
                  {massResults.map((message, idx) => {
                    return <li key={idx}>{message.data.Results}</li>
                  })}
                  {loopRunning && (
                    <li>
                      <CSpinner size="sm" />
                    </li>
                  )}
                </CCallout>
              )}
              <DataTable
                customStyles={customStyles}
                className="cipp-table"
                theme={theme}
                subHeader={subheader}
                selectableRows={selectableRows}
                onSelectedRowsChange={
                  onSelectedRowsChange ? onSelectedRowsChange : handleSelectedChange
                }
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
              {selectedRows.length >= 1 && (
                <CCallout>Selected {selectedRows.length} items</CCallout>
              )}
            </>
          )}
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
