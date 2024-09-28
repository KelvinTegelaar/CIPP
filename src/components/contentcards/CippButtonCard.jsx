import React from 'react'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCardTitle } from '@coreui/react'
import Skeleton from 'react-loading-skeleton'
import PropTypes from 'prop-types'

export default function CippButtonCard({
  title,
  titleType = 'normal',
  CardButton,
  children,
  isFetching,
  className = 'h-100',
}) {
  return (
    <CCard className={`${className} mb-3`}>
      <CCardHeader>
        <CCardTitle>
          {titleType === 'big' ? <h3 className="underline mb-3">{title}</h3> : title}
        </CCardTitle>
      </CCardHeader>
      <CCardBody>
        {isFetching && <Skeleton />}
        {children}
      </CCardBody>
      <CCardFooter>{CardButton}</CCardFooter>
    </CCard>
  )
}

CippButtonCard.propTypes = {
  title: PropTypes.string.isRequired,
  titleType: PropTypes.string,
  CardButton: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired,
  isFetching: PropTypes.bool.isRequired,
  className: PropTypes.string,
}
