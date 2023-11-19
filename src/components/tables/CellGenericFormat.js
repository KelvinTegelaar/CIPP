import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimesCircle,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons'
import { CellBadge } from 'src/components/tables'
import { CBadge, CTooltip } from '@coreui/react'

const IconWarning = () => <FontAwesomeIcon icon={faExclamationCircle} className="text-warning" />
const IconError = () => <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
const IconSuccess = () => <FontAwesomeIcon icon={faCheckCircle} className="text-success" />

function nocolour(iscolourless, content) {
  if (iscolourless) {
    return <span className="no-colour">{content}</span>
  }

  return content
}

export default function CellBoolean({
  cell,
  warning = false,
  reverse = false,
  colourless = false,
  noDataIsFalse = false,
}) {
  let normalized = cell
  if (typeof cell === 'boolean') {
    normalized = cell
  } else if (typeof cell === 'string') {
    if (
      cell.toLowerCase() === 'success' ||
      cell.toLowerCase() === 'pass' ||
      cell.toLowerCase() === 'true'
    ) {
      normalized = true
    } else if (cell.toLowerCase() === 'fail' || cell.toLowerCase() === 'false') {
      normalized = false
    }
  }

  if (cell === '' && !noDataIsFalse) {
    return <CellBadge label="No Data" color="info" />
  } else if (colourless && warning && reverse) {
    return nocolour(colourless, normalized ? <IconWarning /> : <IconError />)
  } else if (!reverse && !warning) {
    return nocolour(colourless, normalized ? <IconSuccess /> : <IconError />)
  } else if (!reverse && warning) {
    return nocolour(colourless, normalized ? <IconSuccess /> : <IconWarning />)
  } else if (reverse && !warning) {
    return nocolour(colourless, normalized ? <IconError /> : <IconSuccess />)
  } else if (reverse && warning) {
    return nocolour(colourless, normalized ? <IconWarning /> : <IconSuccess />)
  }
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
