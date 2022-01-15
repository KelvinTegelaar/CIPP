import React from 'react'
import PropTypes from 'prop-types'
import { CSpinner } from '@coreui/react'

export default function Loading({ style = {}, size = 'md' }) {
  return <CSpinner size={size} style={style} />
}

Loading.propTypes = {
  style: PropTypes.object,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
}

export function FullScreenLoading() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100vh',
      }}
    >
      <CSpinner
        style={{
          border: '3em solid currentColor',
          borderRightColor: 'transparent',
          width: '50vh',
          height: '50vh',
        }}
      />
    </div>
  )
}
