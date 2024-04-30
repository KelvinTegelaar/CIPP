import React from 'react'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCardTitle, CCol, CRow } from '@coreui/react'
import Skeleton from 'react-loading-skeleton'
import { CircularProgressbar } from 'react-circular-progressbar'
import 'react-circular-progressbar/dist/styles.css'

export default function CippPrettyCard({
  title,
  titleType = 'normal',
  percentage,
  topLabel,
  smallLabel,
  ringcolor = '#f89226',
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
        {!isFetching && (
          <CRow>
            <CCol>
              <CircularProgressbar
                styles={{ width: '50%', path: { stroke: ringcolor }, text: { fill: ringcolor } }}
                strokeWidth={3}
                value={percentage}
                text={`${percentage}%`}
              />
            </CCol>
            <CCol className="my-5">
              <h4>{topLabel}</h4>
              <small className="text-medium-emphasis">{smallLabel}</small>
            </CCol>
          </CRow>
        )}
      </CCardBody>
    </CCard>
  )
}
