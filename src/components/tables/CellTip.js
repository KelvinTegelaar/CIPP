import React from 'react'
import { CTooltip } from '@coreui/react'

/**
 *
 * @param value
 * @returns {JSX.Element}
 * @constructor
 */

export const CellTipButton = (value, display) => {
  if (!value) {
    return <div />
  }
  return (
    <CTooltip content={value}>
      <div>
        <a href={value} target="_blank" rel="noreferrer">
          <button>{String(display)}</button>
        </a>
      </div>
    </CTooltip>
  )
}

export const CellTip = (value, overflow = false) => {
  if (!value) {
    return <div />
  }
  if (!overflow) {
    return (
      <CTooltip content={value}>
        <div className="celltip-content-nowrap">{String(value)}</div>
      </CTooltip>
    )
  } else {
    return (
      <CTooltip content={value}>
        <div>{String(value)}</div>
      </CTooltip>
    )
  }
}

export const CellTipIcon = (value, icon) => {
  if (!value) {
    return <div>{icon}</div>
  }
  return (
    <CTooltip content={value}>
      <div>{icon}</div>
    </CTooltip>
  )
}
