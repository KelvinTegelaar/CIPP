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

function nocolour(iscolourless, content) {
  if (iscolourless) {
    return <span className="no-colour">{content}</span>
  }

  return content
}

/**
 *
 * @param [cell]
 * @param [warning]
 * @param [reverse]
 * @param [colourless]
 * @returns {function(*, *, *, *): *}
 */
export default function CellBoolean({
  cell,
  warning = false,
  reverse = false,
  colourless = false,
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

  if (cell === '') {
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

CellBoolean.propTypes = {
  cell: PropTypes.oneOfType([PropTypes.bool, PropTypes.string, PropTypes.any]),
  warning: PropTypes.bool,
  reverse: PropTypes.bool,
  colourless: PropTypes.bool,
}

/**
 *
 * @param [warning]
 * @param [reverse]
 * @param [colourless]
 * @returns {function(*, *, *, *): *}
 */
export const cellBooleanFormatter =
  ({ warning = false, reverse = false, colourless = false } = {}) =>
  (row, index, column, id) => {
    const cell = column.selector(row)
    return CellBoolean({ cell, warning, reverse, colourless })
  }
