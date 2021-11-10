import { CProgress, CProgressBar } from '@coreui/react'
import PropTypes from 'prop-types'
import React from 'react'

const CellProgressBar = ({ value }) => {
  let color
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
}

export default CellProgressBar
