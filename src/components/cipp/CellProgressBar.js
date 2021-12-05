import { CProgress, CProgressBar } from '@coreui/react'
import PropTypes from 'prop-types'
import React from 'react'

const CellProgressBar = ({ value, reverse = false }) => {
  let color
  if (!reverse) {
    switch (value) {
      case value <= 40:
        color = 'danger'
        break
      case value <= 75:
        color = 'warning'
        break
      case value > 75:
        color = 'success'
        break
      default:
        color = 'danger'
    }
  } else {
    switch (value) {
      case value >= 95:
        color = 'danger'
        break
      case value >= 90:
        color = 'warning'
        break
      default:
        color = 'success'
    }
  }
  return (
    <CProgress className="mb-3">
      <CProgressBar value={value} color={color}>
        {value}
      </CProgressBar>
    </CProgress>
  )
}

CellProgressBar.propTypes = {
  value: PropTypes.number,
  reverse: PropTypes.bool,
}

export default CellProgressBar
