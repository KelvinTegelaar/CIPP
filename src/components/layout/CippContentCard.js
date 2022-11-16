import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'

export default function CippContentCard({
  title,
  children,
  icon,
  button,
  bodyClass = null,
  className = null,
}) {
  return (
    <CCard className={`content-card h-100 ${className ?? ''}`}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <CCardTitle>{title}</CCardTitle>
        {icon ? <FontAwesomeIcon icon={icon} /> : null}
        {button ? button : null}
      </CCardHeader>
      <CCardBody className={bodyClass}>{children}</CCardBody>
    </CCard>
  )
}

CippContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  icon: PropTypes.object,
  button: PropTypes.element,
  bodyClass: PropTypes.string,
  className: PropTypes.string,
}
