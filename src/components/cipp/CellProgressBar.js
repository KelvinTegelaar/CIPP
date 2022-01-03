import { CProgress, CProgressBar } from '@coreui/react'
import PropTypes from 'prop-types'
import React from 'react'
import cellGetProperty from './cellGetProperty'
import { CellBadge } from './CellBadge'

export const CellProgressBar = ({ value, reverse = false }) => {
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
  if (value) {
    return (
      <div style={{ width: '100%' }}>
        <CProgress>
          <CProgressBar value={value} color={color}>
            {value}
          </CProgressBar>
        </CProgress>
      </div>
    )
  } else {
    return <CellBadge label="No Data" color="info" />
  }
}

CellProgressBar.propTypes = {
  value: PropTypes.number,
  reverse: PropTypes.bool,
}

export const cellProgressBarFormatter =
  ({ reverse } = {}) =>
  (row, index, column, id) => {
    const value = cellGetProperty(row, index, column, id)
    return CellProgressBar({ value, reverse })
  }
