import React from 'react'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import PropTypes from 'prop-types'

export default function TitleButton({ icon, title, href }) {
  console.log(icon)
  return (
    <CButton size="sm" color="primary" href={href}>
      {icon ? <FontAwesomeIcon icon={icon} className="pe-1" /> : null}
      {title}
    </CButton>
  )
}

TitleButton.propTypes = {
  icon: PropTypes.object,
  title: PropTypes.string.isRequired,
  href: PropTypes.string.isRequired,
}
