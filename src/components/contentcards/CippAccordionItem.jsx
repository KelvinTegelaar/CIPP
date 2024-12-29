import React from 'react'
import {
  CAccordionBody,
  CAccordionHeader,
  CAccordionItem,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCardTitle,
} from '@coreui/react'
import Skeleton from 'react-loading-skeleton'
import PropTypes from 'prop-types'

export default function CippAccordionItem({
  title,
  titleType = 'normal',
  CardButton,
  children,
  isFetching,
}) {
  return (
    <CAccordionItem>
      <CAccordionHeader>{title}</CAccordionHeader>
      <CAccordionBody>
        <CCard>
          <CCardHeader>
            <CCardTitle>
              {titleType === 'big' ? <h3 className="underline mb-3">{title}</h3> : title}
            </CCardTitle>
          </CCardHeader>
          <CCardBody className="my-3">
            {isFetching && <Skeleton />}
            {children}
          </CCardBody>
          <CCardFooter>{CardButton}</CCardFooter>
        </CCard>
      </CAccordionBody>
    </CAccordionItem>
  )
}

CippAccordionItem.propTypes = {
  title: PropTypes.string.isRequired,
  titleType: PropTypes.string,
  CardButton: PropTypes.element.isRequired,
  children: PropTypes.element.isRequired,
  isFetching: PropTypes.bool.isRequired,
}
