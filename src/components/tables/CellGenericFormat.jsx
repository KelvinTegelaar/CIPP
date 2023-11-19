import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimesCircle,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons'
import { CBadge, CTooltip } from '@coreui/react'
import CellBoolean from 'src/components/tables/CellBoolean.jsx'

const IconWarning = () => <FontAwesomeIcon icon={faExclamationCircle} className="text-warning" />
const IconError = () => <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
const IconSuccess = () => <FontAwesomeIcon icon={faCheckCircle} className="text-success" />

function nocolour(iscolourless, content) {
  if (iscolourless) {
    return <span className="no-colour">{content}</span>
  }

  return content
}

export function CellTip(cell, overflow = false) {
  return (
    <CTooltip content={String(cell)}>
      <div className="celltip-content-nowrap">{String(cell)}</div>
    </CTooltip>
  )
}

export const cellGenericFormatter =
  ({ warning = false, reverse = false, colourless = true, noDataIsFalse } = {}) =>
  // eslint-disable-next-line react/display-name
  (row, index, column, id) => {
    const cell = column.selector(row)
    if (cell === null || cell === undefined || cell.length === 0) {
      return <CBadge color="info">No Data</CBadge>
    }
    if (typeof cell === 'boolean') {
      return CellBoolean({ cell, warning, reverse, colourless, noDataIsFalse })
    }
    if (typeof cell === 'string') {
      if (cell.toLowerCase() === 'failed') {
        return <CBadge color="danger">{CellTip('Failed to retrieve from API')}</CBadge>
      }
      if (cell.toLowerCase().startsWith('http')) {
        return <a href={`${cell}`}>URL</a>
      }
      return CellTip(cell)
    }
    if (typeof cell === 'number') {
      return <CBadge color="info">{CellTip(cell)}</CBadge>
    }
    if (Array.isArray(cell) || typeof cell === 'object') {
      return CellTip(JSON.stringify(cell))
    }
  }
