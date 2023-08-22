import React from 'react'
import { CButton } from '@coreui/react'
import { ModalService } from '../utilities'
import { CBadge } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { cellGenericFormatter } from './CellGenericFormat'

export default function cellTable(row, column, propertyName) {
  const handleTable = ({ row }) => {
    const QueryColumns = []
    const columns = Object.keys(row[propertyName][0]).map((key) => {
      QueryColumns.push({
        name: key,
        selector: (row) => row[key], // Accessing the property using the key
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

  if (!row[propertyName] || !Array.isArray(row[propertyName]) || row.length === 0) {
    return <FontAwesomeIcon icon={faCheckCircle} className="text-success" />
  }

  return (
    <CButton className="btn-danger" key={row} size="sm" onClick={() => handleTable({ row })}>
      {row[propertyName].length} Items
    </CButton>
  )
}

export const cellTableFormatter = (propertyName) => (row, index, column, id) => {
  return cellTable(row, column, propertyName)
}
