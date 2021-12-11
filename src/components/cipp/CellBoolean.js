import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilXCircle, cilCheckCircle, cilWarning } from '@coreui/icons'
import { CellBadge } from './CellBadge'
import cellGetProperty from './cellGetProperty'

const IconWarning = () => <CIcon icon={cilWarning} className="text-warning" />
const IconError = () => <CIcon icon={cilXCircle} className="text-danger" />
const IconSuccess = () => <CIcon icon={cilCheckCircle} className="text-success" />

export function CellBoolean({ cell, warning = false, reverse = false }) {
  let normalized = cell
  if (typeof cell === 'boolean') {
    normalized = cell
  } else if (typeof cell === 'string') {
    if (cell.toLowerCase() === 'success' || cell.toLowerCase() === 'pass') {
      normalized = true
    } else if (cell.toLowerCase() === 'fail') {
      normalized = false
    }
  }

  if (cell === '') {
    return <CellBadge label="No Data" color="info" />
  } else if (!reverse && !warning) {
    return normalized ? <IconSuccess /> : <IconError />
  } else if (!reverse && warning) {
    return normalized ? <IconSuccess /> : <IconWarning />
  } else if (reverse && !warning) {
    return normalized ? <IconError /> : <IconSuccess />
  } else if (reverse && warning) {
    return normalized ? <IconWarning /> : <IconSuccess />
  }
}

CellBoolean.propTypes = {
  cell: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  warning: PropTypes.bool,
  reverse: PropTypes.bool,
}

/**
 *
 * @param [reverse]
 * @param [warning]
 * @returns {function(*, *, *, *): *}
 */
export const cellBooleanFormatter =
  ({ reverse = false, warning = false } = {}) =>
  (row, index, column, id) => {
    const cell = cellGetProperty(row, index, column, id)
    return CellBoolean({ cell, reverse, warning })
  }

export default CellBoolean
