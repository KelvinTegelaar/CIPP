import { CProgress, CProgressBar } from '@coreui/react'
import PropTypes from 'prop-types'
import React from 'react'
import { CellBadge } from 'src/components/tables'

export const CellProgressBar = ({ value, reverse = false }) => {
  let color
  if (!reverse) {
    if (value <= 40) {
      color = 'danger'
    } else if (value <= 75) {
      color = 'warning'
    } else if (value > 75) {
      color = 'success'
    } else {
      color = 'info'
    }
  } else {
    if (value >= 90) {
      color = 'danger'
    } else if (value >= 75) {
      color = 'warning'
    } else {
      color = 'success'
    }
  }
  if (value > 0) {
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
    const value = column.selector(row)
    return CellProgressBar({ value, reverse })
  }
