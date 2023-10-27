import React from 'react'
import { CButton } from '@coreui/react'
import { ModalService } from '../utilities'
import { CBadge } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle, faTimesCircle } from '@fortawesome/free-solid-svg-icons' // 1. Import the required FontAwesome icon
import { cellGenericFormatter } from './CellGenericFormat'

export default function cellTable(
  row,
  column,
  propertyName,
  checkWhenZero = false,
  crossWhenZero = false,
) {
  const handleTable = ({ row }) => {
    const QueryColumns = []
    const columns = Object.keys(row[propertyName][0]).map((key) => {
      QueryColumns.push({
        name: key,
        selector: (row) => row[key],
        sortable: true,
        exportSelector: key,
        cell: cellGenericFormatter(),
      })
    })
    ModalService.open({
      data: row[propertyName],
      componentType: 'table',
      componentProps: {
        columns: QueryColumns,
        keyField: 'SKU',
      },
      title: `Data`,
      size: 'lg',
    })
  }
  //if the row propertyName is a bool, then return a check or cross
  if (typeof row[propertyName] === 'boolean') {
    if (row[propertyName]) {
      return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
    }
    return <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
  }

  if (!row[propertyName] || !Array.isArray(row[propertyName]) || row[propertyName].length === 0) {
    if (row[propertyName] === undefined) {
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

  return (
    <CButton className="btn-danger" key={row} size="sm" onClick={() => handleTable({ row })}>
      {row[propertyName].length} Items
    </CButton>
  )
}

export const cellTableFormatter =
  (propertyName, checkWhenZero = false, crossWhenZero = false) =>
  (row, index, column, id) => {
    return cellTable(row, column, propertyName, checkWhenZero, crossWhenZero)
  }
