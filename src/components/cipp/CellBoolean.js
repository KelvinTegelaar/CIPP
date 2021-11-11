import React from 'react'
import PropTypes from 'prop-types'
import CIcon from '@coreui/icons-react'
import { cilXCircle, cilCheckCircle } from '@coreui/icons'

export default function CellBoolean({ cell }) {
  return cell ? (
    <CIcon icon={cilCheckCircle} className="text-success" />
  ) : (
    <CIcon icon={cilXCircle} className="text-danger" />
  )
}

CellBoolean.propTypes = {
  cell: PropTypes.bool,
}
