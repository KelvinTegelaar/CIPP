import React from 'react'
import PropTypes from 'prop-types'
import { CTable, CTableBody, CTableRow, CTableDataCell } from '@coreui/react'

export default function CippOffcanvasTable({ rows }) {
  const tableRows = rows.map((row, index) => (
    <>
      <CTableRow className="cipp-offcanvastable-row">
        <CTableDataCell className="cipp-offcanvastable-label">{row.label}</CTableDataCell>
        <CTableDataCell className="cipp-offcanvastable-value">{row.value}</CTableDataCell>
      </CTableRow>
    </>
  ))
  return (
    <CTable small borderless responsive align="top" className="cipp-offcanvastable">
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
  ).isRequired,
}
