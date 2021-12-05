import React from 'react'
import PropTypes from 'prop-types'

export default function CellNullText({ cell }) {
  return cell ?? 'n/a'
}

CellNullText.propTypes = {
  cell: PropTypes.string,
}
