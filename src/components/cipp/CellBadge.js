import PropTypes from 'prop-types'
import React from 'react'
import { CBadge } from '@coreui/react'
import cellGetProperty from './cellGetProperty'

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
    const label = cellGetProperty(row, index, column, id)
    return CellBadge({ label, color, rest })
  }
