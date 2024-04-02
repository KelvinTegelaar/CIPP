import React, { useState } from 'react'
import { CAlert, CCallout } from '@coreui/react'
import PropTypes from 'prop-types'
import './CippCallout.css'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

export function CippCallout({
  dismissible = false,
  color = 'primary',
  children = null,
  className = '',
  style = {},
  ...rest
}) {
  const [open, setOpen] = useState(true)

  if (!open) {
    return null
  }

  return (
    <div
      className={classNames(className, 'cipp-callout', `callout-${color}`, {
        'cipp-callout-dismissible': dismissible,
      })}
      color={color}
      style={{
        backgroundColor: 'rgb(var(--cui-body-color-rgb))',
        color: 'var(--cui-body-color)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        ...style,
      }}
      {...rest}
    >
      <div>{children}</div>
      {dismissible && (
        <button
          type="button"
          className="btn"
          aria-label="Close"
          onClick={() => setOpen(false)}
          style={{ padding: 0, margin: 0 }}
        >
          <FontAwesomeIcon icon={faXmark} size={'xl'} />
        </button>
      )}
    </div>
  )
}

CippCallout.propTypes = {
  dismissible: PropTypes.bool,
  color: PropTypes.oneOf([
    'primary',
    'secondary',
    'success',
    'warning',
    'danger',
    'info',
    'light',
    'dark',
  ]),
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  className: PropTypes.string,
  style: PropTypes.object,
}
