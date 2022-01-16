import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faTimesCircle,
  faCheckCircle,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons'
import { CellBadge } from 'src/components/tables'

const IconWarning = () => <FontAwesomeIcon icon={faExclamationCircle} className="text-warning" />
const IconError = () => <FontAwesomeIcon icon={faTimesCircle} className="text-danger" />
const IconSuccess = () => <FontAwesomeIcon icon={faCheckCircle} className="text-success" />

export default function CellBoolean({ cell, warning = false, reverse = false }) {
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
    const cell = column.selector(row)
    return CellBoolean({ cell, reverse, warning })
  }
