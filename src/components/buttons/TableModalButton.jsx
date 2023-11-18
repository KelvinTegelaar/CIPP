import React from 'react'
import { CButton } from '@coreui/react'
import { ModalService } from '../utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons'
import { cellGenericFormatter } from '../tables/CellGenericFormat'

export default function TableModalButton({ data, title, className, countOnly = false, ...input }) {
  const handleTable = (data) => {
    const QueryColumns = []
    const columns = Object.keys(data[0]).map((key) => {
      QueryColumns.push({
        name: key,
        selector: (row) => row[key], // Accessing the property using the key
        sortable: true,
        exportSelector: key,
        cell: cellGenericFormatter(),
      })
    })
    ModalService.open({
      data: data,
      componentType: 'table',
      componentProps: {
        columns: QueryColumns,
        keyField: 'id',
      },
      title: title,
      size: 'lg',
    })
  }
  const buttonClass = 'btn ' + className

  return (
    <CButton {...input} className={buttonClass} onClick={() => handleTable(data)}>
      <>{countOnly == true ? data.length : `${title} (${data.length})`}</>
    </CButton>
  )
}
