import React from 'react'
import PropTypes from 'prop-types'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CCard, CCardBody, CCardHeader, CCardTitle } from '@coreui/react'

export default function CippContentCard({ title, children, icon, className = null }) {
  return (
    <CCard className={`content-card ${className ?? ''}`}>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <CCardTitle>{title}</CCardTitle>
        {icon ? <FontAwesomeIcon icon={icon} /> : null}
      </CCardHeader>
      <CCardBody>{children}</CCardBody>
    </CCard>
  )
}

CippContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.arrayOf(PropTypes.element).isRequired,
  icon: PropTypes.object,
  className: PropTypes.string,
}
