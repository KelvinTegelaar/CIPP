import React from 'react'
import { CButton } from '@coreui/react'
import { ModalService } from '../utilities'
import { cellGenericFormatter } from '../tables/CellGenericFormat'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export default function TableModalButton({
  data,
  title,
  className,
  countOnly = false,
  icon = '',
  ...input
}) {
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
      {icon != '' && <FontAwesomeIcon icon={icon} className="me-2" />}
      <>{countOnly === true ? data.length : `${title} (${data.length})`}</>
    </CButton>
  )
}

TableModalButton.propTypes = {
  data: PropTypes.array,
  title: PropTypes.string,
  className: PropTypes.string,
  countOnly: PropTypes.bool,
}
