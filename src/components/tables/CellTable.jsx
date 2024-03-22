import React from 'react'
import { CButton } from '@coreui/react'
import { ModalService } from '../utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons'
import { cellGenericFormatter } from './CellGenericFormat'

export default function cellTable(
  row,
  column,
  propertyName,
  checkWhenZero = false,
  crossWhenZero = false,
  dangerButton = false,
) {
  var columnProp = ''
  if (propertyName) {
    columnProp = row[propertyName]
  } else {
    columnProp = column
  }

  if (!Array.isArray(columnProp) && typeof columnProp === 'object') {
    columnProp = [columnProp]
  }

  if (Array.isArray(columnProp) && typeof columnProp[0] !== 'object') {
    columnProp = columnProp.map((row) => {
      return {
        Value: row,
      }
    })
  }

  const handleTable = ({ columnProp }) => {
    const QueryColumns = []

    const columns = Object.keys(columnProp[0]).map((key) => {
      QueryColumns.push({
        name: key,
        selector: (row) => row[key],
        sortable: true,
        exportSelector: key,
        cell: cellGenericFormatter(),
      })
    })

    ModalService.open({
      data: columnProp,
      componentType: 'table',
      componentProps: {
        columns: QueryColumns,
        keyField: 'SKU',
      },
      title: `Data`,
      size: 'lg',
    })
  }

  if (typeof columnProp === 'boolean') {
    if (columnProp) {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
    }
    return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
  }

  if (!columnProp || !Array.isArray(columnProp) || columnProp.length === 0) {
    if (columnProp === undefined) {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
    }
    if (checkWhenZero) {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
    }
    if (crossWhenZero) {
      return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
    }
    return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
  }

  const buttonClassName = dangerButton ? 'btn-danger' : ''
  return (
    <CButton
      className={buttonClassName}
      key={row}
      size="sm"
      onClick={() => handleTable({ columnProp })}
    >
      {columnProp.length} Items
    </CButton>
  )
}

export const cellTableFormatter =
  (propertyName, checkWhenZero = false, crossWhenZero = false, dangerButton = false) =>
  (row, index, column, id) => {
    return cellTable(row, column, propertyName, checkWhenZero, crossWhenZero, dangerButton)
  }
