import React from 'react'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

export default function TitleButton({ icon = faPlus, title, href }) {
  return (
    <Link to={href}>
      <CButton size="sm" color="primary">
        <FontAwesomeIcon icon={faPlus} className="pe-1" />
        {title}
      </CButton>
    </Link>
  )
}

TitleButton.propTypes = {
  icon: PropTypes.node,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
}
