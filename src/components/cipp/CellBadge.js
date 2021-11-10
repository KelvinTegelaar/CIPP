import PropTypes from 'prop-types'
import React from 'react'
import { CBadge } from '@coreui/react'

const CellBadge = ({ label = '', color = '', children, ...rest }) => {
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

export default CellBadge
