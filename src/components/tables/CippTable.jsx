import React, { useRef, useMemo, useState, useCallback, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
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
  CCallout,
  CFormSelect,
  CAccordion,
  CAccordionHeader,
  CAccordionBody,
  CAccordionItem,
  CTooltip,
} from '@coreui/react'
import DataTable, { createTheme } from 'react-data-table-component'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faClipboard,
  faColumns,
  faCopy,
  faFileCsv,
  faFilePdf,
  faSearch,
  faSync,
} from '@fortawesome/free-solid-svg-icons'
import { cellGenericFormatter } from './CellGenericFormat'
import { CippCodeOffCanvas, ModalService } from '../utilities'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { debounce } from 'lodash-es'
import { useSearchParams } from 'react-router-dom'
import CopyToClipboard from 'react-copy-to-clipboard'
import { setDefaultColumns } from 'src/store/features/app'
import { CippCallout } from '../layout'

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
          <CDropdownItem
            onClick={() => {
              onFilterPreset('')
            }}
          >
            Clear Filter
          </CDropdownItem>
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
const compareValues = (a, b) => {
  if (a === null) return 1
  if (b === null) return -1
  if (typeof a === 'number' && typeof b === 'number') return a - b
  if (typeof a === 'boolean' && typeof b === 'boolean') return a === b ? 0 : a ? -1 : 1
  return String(a).localeCompare(String(b), 'en', { numeric: true })
}

const customSort = (rows, selector, direction) => {
  return rows.sort((a, b) => {
    let aField = selector(a)
    let bField = selector(b)
    let comparison = compareValues(aField, bField)
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
  defaultFilterText = '',
  isModal = false,
  exportFiltered = false,
  filterlist,
  showFilter = true,
  endpointName,
  defaultSortAsc = true,
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
  const defaultColumns = useSelector((state) => state.app.defaultColumns[endpointName])
  const [defaultColumnsSet, setDefaultColumnsSet] = React.useState(false)
  const [massResults, setMassResults] = React.useState([])
  const [filterText, setFilterText] = React.useState(defaultFilterText)
  const [filterviaURL, setFilterviaURL] = React.useState(false)
  const [originalColumns, setOrginalColumns] = React.useState(columns)
  const [updatedColumns, setUpdatedColumns] = React.useState(columns)
  const [codeOffcanvasVisible, setCodeOffcanvasVisible] = useState(false)
  if (defaultColumns && defaultColumnsSet === false && endpointName) {
    const defaultColumnsArray = defaultColumns.split(',').filter((item) => item)

    const actionsColumn = columns.length > 0 ? columns[columns.length - 1] : null

    let tempColumns = actionsColumn ? columns.slice(0, -1) : [...columns]

    defaultColumnsArray.forEach((columnName) => {
      if (!tempColumns.find((c) => c.exportSelector === columnName && c?.omit !== true)) {
        tempColumns.push({
          name: columnName,
          selector: (row) => row[columnName],
          sortable: true,
          exportSelector: columnName,
          cell: cellGenericFormatter(),
        })
      }
    })

    if (actionsColumn) {
      tempColumns.push(actionsColumn)
    }
    let newColumns = tempColumns.filter(
      (column) => defaultColumnsArray.includes(column.exportSelector) || column === actionsColumn,
    )
    setUpdatedColumns(newColumns)
    setDefaultColumnsSet(true)
  }
  if (!endpointName && defaultColumnsSet === false) {
    setUpdatedColumns(columns)
    setDefaultColumnsSet(true)
  }
  const [selectedRows, setSelectedRows] = React.useState(false)
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [getDrowndownInfo, dropDownInfo] = useLazyGenericGetRequestQuery()
  const [modalContent, setModalContent] = useState({})
  //get the search params called "tableFilter" and set the filter to that.
  const [searchParams, setSearchParams] = useSearchParams()
  if (
    searchParams.get('tableFilter') &&
    (!filterviaURL || searchParams.get('updateTableFilter')) &&
    !isModal
  ) {
    setFilterText(searchParams.get('tableFilter'))
    setFilterviaURL(true)
    searchParams.delete('updateTableFilter')
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const addColumn = (columnname) => {
    let alreadyInArray = updatedColumns.some(
      (o) => o.exportSelector === columnname && o?.omit !== true,
    )
    let newColumns = [...updatedColumns]
    const actionsColumn = newColumns.length > 0 ? newColumns.pop() : null

    if (!alreadyInArray) {
      const newColumn = {
        name: columnname,
        selector: (row) => row[columnname],
        sortable: true,
        exportSelector: columnname,
        cell: cellGenericFormatter(),
      }
      newColumns.push(newColumn)
    } else {
      newColumns = newColumns.filter((o) => o.exportSelector !== columnname)
    }
    if (actionsColumn) {
      newColumns.push(actionsColumn)
    }
    setUpdatedColumns(newColumns)
  }

  const handleSelectedChange = ({ selectedRows }) => {
    setSelectedRows(selectedRows)
    if (selectedRows.length < 1) {
      setSelectedRows(false)
    }
  }
  const [resetPaginationToggle, setResetPaginationToggle] = React.useState(false)

  // Helper function to escape special characters in a string for regex
  function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  }

  const setGraphFilter = useCallback(
    (e) => {
      if (graphFilterFunction) {
        graphFilterFunction(e)
      }
    },
    [graphFilterFunction],
  )

  const debounceSetGraphFilter = useMemo(() => {
    return debounce(setGraphFilter, 1000)
  }, [setGraphFilter])

  const debounceSetSearchParams = useCallback(() => {
    const currentUrl = new URL(window.location.href)
    if (filterText !== '') {
      currentUrl.searchParams.set('tableFilter', filterText)
      window.history.replaceState({}, '', currentUrl.toString())
    } else {
      currentUrl.searchParams.delete('tableFilter')
      window.history.replaceState({}, '', currentUrl.toString())
    }
  }, [filterText])

  const filterData = (data, filterText) => {
    if (!isModal) {
      const debouncedSetSearchParams = debounce(debounceSetSearchParams, 1000)
      debouncedSetSearchParams()
    }
    if (filterText.startsWith('Graph:')) {
      var query = filterText.slice(6).trim()
      debounceSetGraphFilter(query)
      return data
    } else if (filterText.startsWith('Complex:')) {
      // Split conditions by ';' for AND
      const conditionGroups = filterText
        .slice(9)
        .split(/\s*;\s*/)
        .map((group) => group.trim().split(/\s+or\s+/i)) // Split each group by 'or' for OR

      return data.filter((item) => {
        // Check if all condition groups are met for the item (AND logic)
        return conditionGroups.every((conditions) => {
          // Check if any condition within a group is met for the item (OR logic)
          return conditions.some((condition) => {
            const match = condition.match(/(\w+)\s*(eq|ne|like|notlike|gt|lt)\s*(.+)/)
            if (!match) return false
            let [property, operator, value] = match.slice(1)
            value = escapeRegExp(value) // Escape special characters
            const actualKey = Object.keys(item).find(
              (key) => key.toLowerCase() === property.toLowerCase(),
            )
            if (!actualKey) {
              console.error(`FilterError: Property "${property}" not found.`)
              return false
            }
            switch (operator) {
              case 'eq':
                return String(item[actualKey]).toLowerCase() === value.toLowerCase()
              case 'ne':
                return String(item[actualKey]).toLowerCase() !== value.toLowerCase()
              case 'like':
                return String(item[actualKey]).toLowerCase().includes(value.toLowerCase())
              case 'notlike':
                return !String(item[actualKey]).toLowerCase().includes(value.toLowerCase())
              case 'gt':
                return parseFloat(item[actualKey]) > parseFloat(value)
              case 'lt':
                return parseFloat(item[actualKey]) < parseFloat(value)
              default:
                return false // Should not reach here normally
            }
          })
        })
      })
    } else {
      return data.filter(
        (item) => JSON.stringify(item).toLowerCase().indexOf(filterText.toLowerCase()) !== -1,
      )
    }
  }

  // Helper functions like `debounce` and `escapeRegExp` should be defined somewhere in your code
  // For example, a simple escapeRegExp function could be:
  const filteredItems = Array.isArray(data) ? filterData(data, filterText) : []

  const applyFilter = (e) => {
    setFilterText(e.target.value)
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const setColumnDefaultLayout = (endpoint, columns) => {
    dispatch(setDefaultColumns({ endpoint, columns }))
  }

  const resetDropdown = () => {
    setUpdatedColumns(originalColumns)
    setColumnDefaultLayout(endpointName, null)
  }
  const dispatch = useDispatch()
  useEffect(() => {
    if (columns.length !== updatedColumns.length) {
      setUpdatedColumns(updatedColumns)
      if (endpointName) {
        setColumnDefaultLayout(
          endpointName,
          updatedColumns.map((column) => column.exportSelector).join(','),
        )
      }
    }
  }, [
    columns,
    defaultColumns,
    dispatch,
    dynamicColumns,
    originalColumns,
    endpointName,
    setColumnDefaultLayout,
    updatedColumns,
  ])

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
  const handleModal = useCallback(
    (modalMessage, modalUrl, modalType = 'GET', modalBody, modalInput, modalDropdown) => {
      if (modalType === 'GET') {
        ModalService.confirm({
          getData: () => inputRef.current?.value,
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
              {modalDropdown && (
                <div>
                  {dropDownInfo.isSuccess && (
                    <CFormSelect
                      ref={inputRef}
                      options={dropDownInfo.data.map((data) => ({
                        value: data[modalDropdown.valueField],
                        label: data[modalDropdown.labelField],
                      }))}
                    />
                  )}
                </div>
              )}
              <div>{modalMessage}</div>
            </div>
          ),
          title: 'Confirm',
          onConfirm: async () => {
            const resultsarr = []
            const selectedValue = inputRef.current.value
            let additionalFields = {}
            if (inputRef.current.nodeName === 'SELECT') {
              const selectedItem = dropDownInfo.data.find(
                (item) => item[modalDropdown.valueField] === selectedValue,
              )
              if (selectedItem && modalDropdown.addedField) {
                Object.keys(modalDropdown.addedField).forEach((key) => {
                  additionalFields[key] = selectedItem[modalDropdown.addedField[key]]
                })
              }
            }
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
                if (typeof objValue === 'object' && objValue !== null) {
                  newModalBody[objName] = {}
                  for (let [nestedObjName, nestedObjValue] of Object.entries(objValue)) {
                    if (typeof nestedObjValue === 'string' && nestedObjValue.startsWith('!')) {
                      newModalBody[objName][nestedObjName] = row[nestedObjValue.replace('!', '')]
                    } else {
                      newModalBody[objName][nestedObjName] = nestedObjValue
                    }
                  }
                } else if (typeof objValue === 'string' && objValue.startsWith('!')) {
                  newModalBody[objName] = row[objValue.replace('!', '')]
                } else {
                  newModalBody[objName] = objValue
                }
              }
              const NewModalUrl = `${modalUrl.split('?')[0]}?${urlParams.toString()}`
              const results = await genericPostRequest({
                path: NewModalUrl,
                values: {
                  ...modalBody,
                  ...newModalBody,
                  ...additionalFields,
                  ...{ input: selectedValue },
                },
              })
              resultsarr.push(results)
              setMassResults(resultsarr)
            }
            setLoopRunning(false)
          },
        })
      }
    },
    [
      dropDownInfo?.data,
      dropDownInfo?.isSuccess,
      genericGetRequest,
      genericPostRequest,
      selectedRows,
    ],
  )

  useEffect(() => {
    if (dropDownInfo.isFetching) {
      handleModal(
        <CSpinner />,
        modalContent.item.modalUrl,
        modalContent.item.modalType,
        modalContent.item.modalBody,
        modalContent.item.modalInput,
        modalContent.item.modalDropdown,
      )
    }
    if (dropDownInfo.isSuccess) {
      //console.log(modalContent)
      handleModal(
        modalContent.item.modalMessage,
        modalContent.item.modalUrl,
        modalContent.item.modalType,
        modalContent.item.modalBody,
        modalContent.item.modalInput,
        modalContent.item.modalDropdown,
      )
    } else if (dropDownInfo.isError) {
      handleModal(
        'Error connecting to the API.',
        modalContent.item.modalUrl,
        modalContent.item.modalType,
        modalContent.item.modalBody,
        modalContent.item.modalInput,
        modalContent.item.modalDropdown,
      )
    }
  }, [
    dropDownInfo,
    handleModal,
    modalContent.item?.modalBody,
    modalContent.item?.modalDropdown,
    modalContent.item?.modalInput,
    modalContent.item?.modalMessage,
    modalContent.item?.modalType,
    modalContent.item?.modalUrl,
  ])

  const subHeaderComponentMemo = React.useMemo(() => {
    const handleClear = () => {
      if (filterText) {
        setResetPaginationToggle(!resetPaginationToggle)
        setFilterText('')
      }
    }

    const executeselectedAction = (item) => {
      setModalContent({
        item,
      })
      if (item.modalDropdown) {
        getDrowndownInfo({ path: item.modalDropdown.url })
      }
      handleModal(
        item.modalMessage,
        item.modalUrl,
        item.modalType,
        item.modalBody,
        item.modalInput,
        item.modalDropdown,
      )
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
        <CTooltip key={'refresh-tooltip'} content="Refresh" placement="top">
          <CButton
            key={'refresh-action'}
            onClick={() => {
              refreshFunction((Math.random() + 1).toString(36).substring(7))
            }}
            className="m-1"
            size="sm"
          >
            <FontAwesomeIcon icon={faSync} spin={isFetching} />
          </CButton>
        </CTooltip>,
      ])
    }

    actions.forEach((action) => {
      defaultActions.push(action)
    })

    if (!disablePDFExport || !disableCSVExport) {
      const keys = []
      const exportFormatter = {}
      const exportFormatterArgs = {}
      columns.map((col) => {
        if (col.exportSelector) keys.push(col.exportSelector)
        if (col.exportFormatter) exportFormatter[col.exportSelector] = col.exportFormatter
        if (col.exportFormatterArgs)
          exportFormatterArgs[col.exportSelector] = col.exportFormatterArgs
        return null
      })
      // Define the flatten function
      const flatten = (obj, prefix = '') => {
        if (obj === null) return {}
        return Object.keys(obj).reduce((output, key) => {
          const newKey = prefix ? `${prefix}.${key}` : key
          const value = obj[key] === null ? '' : obj[key]

          if (typeof value === 'object' && !Array.isArray(value)) {
            Object.assign(output, flatten(value, newKey))
          } else {
            if (Array.isArray(value)) {
              if (typeof value[0] === 'object') {
                value.map((item, idx) => {
                  Object.assign(output, flatten(item, `${newKey}[${idx}]`))
                })
              } else {
                output[newKey] = value
              }
            } else {
              output[newKey] = value
            }
          }
          return output
        }, {})
      }

      // Define the applyFormatter function
      const applyFormatter = (obj) => {
        return Object.keys(obj).reduce((acc, key) => {
          const formatterArgs = exportFormatterArgs[key]
          const formatter = exportFormatter[key]
          const keyParts = key.split('.')
          const finalKeyPart = keyParts[keyParts.length - 1]
          const formattedValue =
            typeof formatter === 'function'
              ? formatter({ row: obj, cell: obj[key], ...formatterArgs })
              : obj[key]
          acc[key] = formattedValue
          return acc
        }, {})
      }
      const processExportData = (exportData, selectedColumns) => {
        //filter out the columns that are not selected via selectedColumns
        exportData = exportData.map((item) => {
          return Object.keys(item)
            .filter((key) => selectedColumns.find((o) => o.exportSelector === key))
            .reduce((obj, key) => {
              obj[key] = item[key]
              return obj
            }, {})
        })
        return Array.isArray(exportData) && exportData.length > 0
          ? exportData.map((obj) => {
              return flatten(applyFormatter(obj))
            })
          : []
      }

      // Applying the processExportData function to both filteredItems and data
      var filtered = processExportData(filteredItems, updatedColumns)

      // Adjusted dataFlat processing to include formatting
      let dataFlat = Array.isArray(data)
        ? data.map((item) => {
            return flatten(applyFormatter(item))
          })
        : []
      if (!disablePDFExport) {
        if (dynamicColumns === true) {
          defaultActions.push([
            <CDropdown key={'column-selector'} className="me-2" variant="input-group">
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
                <CDropdownItem onClick={() => resetDropdown()}>Reset to default</CDropdownItem>
                {dataKeys() &&
                  dataKeys().map((item, idx) => {
                    return (
                      <CDropdownItem key={idx} onClick={() => addColumn(item)}>
                        {updatedColumns.find(
                          (o) => o.exportSelector === item && o?.omit !== true,
                        ) && <FontAwesomeIcon icon={faCheck} />}{' '}
                        {item}
                      </CDropdownItem>
                    )
                  })}
              </CDropdownMenu>
            </CDropdown>,
          ])
        }

        defaultActions.push([
          <CDropdown key={'pdf-selector'} className="me-2" variant="input-group">
            <CDropdownToggle
              className="btn btn-primary btn-sm m-1"
              size="sm"
              style={{
                backgroundColor: '#f88c1a',
              }}
            >
              <FontAwesomeIcon icon={faFilePdf} />
            </CDropdownToggle>
            <CDropdownMenu>
              {dataKeys() && (
                <>
                  <ExportPDFButton
                    key="export-pdf-action-visible"
                    pdfData={filtered}
                    pdfHeaders={updatedColumns}
                    pdfSize="A3"
                    reportName={reportName}
                    nameText="Export Visible Columns"
                  />
                </>
              )}
            </CDropdownMenu>
          </CDropdown>,
        ])
      }

      if (!disableCSVExport) {
        defaultActions.push([
          <>
            <CDropdown key={'csv-selector'} className="me-2" variant="input-group">
              <CDropdownToggle
                className="btn btn-primary btn-sm m-1"
                size="sm"
                style={{
                  backgroundColor: '#f88c1a',
                }}
              >
                <FontAwesomeIcon icon={faFileCsv} />
              </CDropdownToggle>
              <CDropdownMenu>
                {dataKeys() && (
                  <>
                    <CDropdownItem>
                      <ExportCsvButton
                        key="export-csv-action-visible"
                        csvData={filtered}
                        reportName={reportName}
                        nameText="Export Visible Columns"
                      />
                    </CDropdownItem>
                    <CDropdownItem>
                      <ExportCsvButton
                        key="export-csv-action-all"
                        csvData={dataFlat}
                        reportName={reportName}
                        nameText="Export All Columns"
                      />
                    </CDropdownItem>
                  </>
                )}
              </CDropdownMenu>
            </CDropdown>
          </>,
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
    defaultActions.push([
      <CTooltip key={'code-tooltip'} content="View API Response" placement="top">
        <CButton
          key={'code-action'}
          onClick={() => {
            setCodeOffcanvasVisible(true)
          }}
          className="m-1"
          size="sm"
        >
          <FontAwesomeIcon icon="code" />
        </CButton>
      </CTooltip>,
    ])
    return (
      <>
        <div className="w-100 d-flex justify-content-start">
          {showFilter && (
            <FilterComponent
              onFilter={(e) => setFilterText(e.target.value)}
              onFilterPreset={(e) => {
                if (e === '') setGraphFilter('')
                setFilterText(e)
              }}
              onClear={handleClear}
              filterText={filterText}
              filterlist={filterlist}
            />
          )}
          {defaultActions}
        </div>
      </>
    )
  }, [
    refreshFunction,
    actions,
    disablePDFExport,
    disableCSVExport,
    selectedRows,
    actionsList,
    showFilter,
    filterText,
    filterlist,
    resetPaginationToggle,
    handleModal,
    getDrowndownInfo,
    filteredItems,
    columns,
    data,
    dynamicColumns,
    reportName,
    resetDropdown,
    updatedColumns,
    addColumn,
    setGraphFilter,
  ])
  const tablePageSize = useSelector((state) => state.app.tablePageSize)
  const [codeCopied, setCodeCopied] = useState(false)

  const onCodeCopied = () => {
    setCodeCopied(true)
    setTimeout(() => setCodeCopied(false), 2000)
  }

  return (
    <div className="ms-n3 me-n3 cipp-tablewrapper">
      {!isFetching && error && <CCallout color="info">Error loading data</CCallout>}
      <div>
        {(updatedColumns || !dynamicColumns) && (
          <>
            {(massResults.length >= 1 || loopRunning) && (
              <CippCallout color="info" dismissible>
                {massResults[0]?.data?.Metadata?.Heading && (
                  <CAccordion flush>
                    {massResults.map((message, idx) => {
                      const results = message.data?.Results
                      const displayResults = Array.isArray(results)
                        ? results.join('</li><li>')
                        : results
                      var iconName = 'info-circle'
                      if (message.data?.Metadata?.Success === true) {
                        iconName = 'check-circle'
                      } else if (message.data?.Metadata?.Success === false) {
                        iconName = 'times-circle'
                      }
                      return (
                        <CAccordionItem key={`${idx}-message`}>
                          <CAccordionHeader>
                            <FontAwesomeIcon icon={iconName} className="me-2" />
                            {message.data?.Metadata?.Heading}
                          </CAccordionHeader>
                          <CAccordionBody>
                            <CopyToClipboard text={results} onCopy={() => onCodeCopied()}>
                              <CButton
                                color={codeCopied ? 'success' : 'info'}
                                className="cipp-code-copy-button"
                                size="sm"
                                variant="ghost"
                              >
                                {codeCopied ? (
                                  <FontAwesomeIcon icon={faClipboard} />
                                ) : (
                                  <FontAwesomeIcon icon={faCopy} />
                                )}
                              </CButton>
                            </CopyToClipboard>
                            {results.map((line, i) => {
                              return <li key={i}>{line}</li>
                            })}
                          </CAccordionBody>
                        </CAccordionItem>
                      )
                    })}
                  </CAccordion>
                )}
                {!massResults[0]?.data?.Metadata?.Heading &&
                  massResults.map((message, idx) => {
                    const results = message.data?.Results
                    const displayResults = Array.isArray(results) ? results.join(', ') : results
                    return (
                      <>
                        <li key={`message-${idx}`}>
                          {displayResults}
                          <CopyToClipboard text={displayResults} onCopy={() => onCodeCopied()}>
                            <CButton
                              color={codeCopied ? 'success' : 'info'}
                              className="cipp-code-copy-button"
                              size="sm"
                              variant="ghost"
                            >
                              {codeCopied ? (
                                <FontAwesomeIcon icon={faClipboard} />
                              ) : (
                                <FontAwesomeIcon icon={faCopy} />
                              )}
                            </CButton>
                          </CopyToClipboard>
                        </li>
                      </>
                    )
                  })}
                {loopRunning && (
                  <li>
                    <CSpinner size="sm" />
                  </li>
                )}
              </CippCallout>
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
              columns={dynamicColumns ? updatedColumns : columns}
              data={filteredItems}
              expandableRows={expandableRows}
              expandableRowsComponent={expandableRowsComponent}
              highlightOnHover={highlightOnHover}
              expandOnRowClicked={expandOnRowClicked}
              defaultSortAsc={defaultSortAsc}
              defaultSortFieldId={1}
              sortFunction={customSort}
              paginationPerPage={tablePageSize}
              progressPending={isFetching}
              progressComponent={<CSpinner color="info" component="div" />}
              paginationRowsPerPageOptions={[25, 50, 100, 200, 500]}
              {...rest}
            />
            {selectedRows.length >= 1 && <CCallout>Selected {selectedRows.length} items</CCallout>}
            <CippCodeOffCanvas
              row={data}
              hideButton={true}
              state={codeOffcanvasVisible}
              hideFunction={() => setCodeOffcanvasVisible(false)}
              title="API Response"
            />
          </>
        )}
      </div>
    </div>
  )
}

export const CippTablePropTypes = {
  reportName: PropTypes.string.isRequired,
  columns: PropTypes.arrayOf(PropTypes.object).isRequired,
  refreshFunction: PropTypes.func,
  graphFilterFunction: PropTypes.func,
  dynamicColumns: PropTypes.bool,
  defaultFilterText: PropTypes.string,
  isModal: PropTypes.bool,
  exportFiltered: PropTypes.bool,
  showFilter: PropTypes.bool,
  tableProps: PropTypes.shape({
    keyField: PropTypes.string,
    theme: PropTypes.string,
    pagination: PropTypes.bool,
    responsive: PropTypes.bool,
    dense: PropTypes.bool,
    striped: PropTypes.bool,
    subheader: PropTypes.bool,
    // @TODO
    // expandableRows,
    // actionsList,
    // expandableRowsComponent,
    // expandableRowsHideExpander,
    // expandOnRowClicked,
    // selectableRows,
    sortFunction: PropTypes.bool,
    onSelectedRowsChange: PropTypes.func,
    highlightOnHover: PropTypes.bool,
    disableDefaultActions: PropTypes.bool,
    actions: PropTypes.arrayOf(PropTypes.node),
  }),
  data: PropTypes.array,
  isFetching: PropTypes.bool,
  disablePDFExport: PropTypes.bool,
  disableCSVExport: PropTypes.bool,
  error: PropTypes.object,
  filterlist: PropTypes.arrayOf(PropTypes.object),
  defaultSortAsc: PropTypes.bool,
}

CippTable.propTypes = CippTablePropTypes
