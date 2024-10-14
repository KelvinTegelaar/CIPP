import PropTypes from 'prop-types'
import React from 'react'
import { CBadge, CCol, CRow } from '@coreui/react'

export const CellBadge = ({ label = '', color = '', children, ...rest }) => {
  //Create a case select, and return the color based on the label
  switch (label.toLowerCase()) {
    case 'planned':
      color = 'info'
      break
    case 'failed':
      color = 'danger'
      break
    case 'completed':
      color = 'success'
      break
    case 'banned':
      color = 'danger'
      break
    case 'running':
      color = 'primary'
      break
  }
  //if a label contains a comma, split it, and return multiple badges, if not, return one badge. force the badges to be on their own line

  if (label.includes(',')) {
    const labels = label.split(',')
    return labels.map((label, idx) => (
      <>
        <CBadge key={idx} className="me-2" color={color} {...rest}>
          {label}
          {children}
        </CBadge>
      </>
    ))
  } else {
    return (
      <CBadge className="me-2" color={color} {...rest}>
        {label}
        {children}
      </CBadge>
    )
  }
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
