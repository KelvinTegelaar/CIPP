import React from 'react'
import PropTypes from 'prop-types'
import { CTable, CTableBody, CTableRow, CTableDataCell } from '@coreui/react'

export default function CippOffcanvasTable({ rows }) {
  const tableRows = rows.map((row, index, guid) => (
    <CTableRow className="cipp-offcanvastable-row" key={`${guid}-${index}`}>
      <CTableDataCell className="cipp-offcanvastable-label">{row.label}</CTableDataCell>
      <CTableDataCell className="cipp-offcanvastable-value">{row.value}</CTableDataCell>
    </CTableRow>
  ))
  return (
    <CTable small borderless responsive align="top">
      <CTableBody>{tableRows}</CTableBody>
    </CTable>
  )
}

CippOffcanvasTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string,
      value: PropTypes.any,
    }),
  ),
  guid: PropTypes.string,
}
