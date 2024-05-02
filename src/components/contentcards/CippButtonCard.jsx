import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCardTitle } from '@coreui/react'
import Skeleton from 'react-loading-skeleton'

export default function CippButtonCard({
  title,
  titleType = 'normal',
  CardButton,
  children,
  isFetching,
}) {
  return (
    <CCard className="h-100 mb-3">
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
