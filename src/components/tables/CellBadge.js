import PropTypes from 'prop-types'
import React from 'react'
import { CBadge } from '@coreui/react'

export const CellBadge = ({ label = '', color = '', children, ...rest }) => {
  return (
    <CBadge color={color} {...rest}>
      {label}
      {children}
    </CBadge>
  )
}

CellBadge.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string, PropTypes.number]),
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  color: PropTypes.oneOf(['primary', 'info', 'success', 'warning', 'danger']),
}

export const cellBadgeFormatter =
  ({ color, ...rest } = {}) =>
  (row, index, column, id) => {
    const label = column.selector(row)
    return CellBadge({ label, color, rest })
  }
