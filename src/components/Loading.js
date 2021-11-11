import React from 'react'
import PropTypes from 'prop-types'

export default function Loading({ style = {} }) {
  return (
    <div className="spinner-border" role="status" style={style}>
      <span className="sr-only">Loading...</span>
    </div>
  )
}

Loading.propTypes = {
  style: PropTypes.object,
}
