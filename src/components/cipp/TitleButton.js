import React from 'react'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'

export default function TitleButton({ icon = faPlus, title, href }) {
  return (
    <CButton size="sm" color="primary" href={href}>
      <FontAwesomeIcon icon={faPlus} className="pe-1" />
      {title}
    </CButton>
  )
}

TitleButton.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
}
