import React, { useState } from 'react'
import { CAlert } from '@coreui/react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

export function CippCallout({
  children,
  color = 'primary',
  borderColor = 'primary',
  dismissible = false,
  ...rest
}) {
  const [open, setOpen] = useState(true)

  const handleDismiss = () => setOpen(false)

  return open ? (
    <div
      className={classNames(
        'callout',
        `callout-${color}`,
        { 'alert-dismissible': dismissible },
        { fade: dismissible },
        { show: dismissible },
      )}
    >
      {children}
      {dismissible && (
        <button
          type="button"
          className={classNames('btn', 'btn-close')}
          aria-label={'Close'}
          onClick={handleDismiss}
        />
      )}
    </div>
  ) : null
}

CippCallout.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  color: PropTypes.string,
  borderColor: PropTypes.string,
  dismissible: PropTypes.bool,
}

export default CippCallout
