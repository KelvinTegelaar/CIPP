import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CCard, CCardBody, CCardFooter, CCardHeader, CCardTitle } from '@coreui/react'
import Skeleton from 'react-loading-skeleton'
import { CChart } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'

export default function CippChartCard({
  title,
  titleType = 'normal',
  ChartData,
  ChartLabels,
  ChartType = 'pie',
  LegendLocation = 'bottom',
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
          <CChart
            type={ChartType}
            data={{
              labels: ChartLabels,
              datasets: [
                {
                  backgroundColor: [
                    getStyle('--cyberdrain-warning'),
                    getStyle('--cyberdrain-info'),
                    getStyle('--cyberdrain-success'),
                    getStyle('--cyberdrain-danger'),
                    getStyle('--cyberdrain-primary'),
                    getStyle('--cyberdrain-secondary'),
                  ],
                  data: ChartData,
                  borderWidth: 3,
                },
              ],
            }}
            options={{
              plugins: {
                legend: {
                  position: LegendLocation,
                  labels: {
                    color: getStyle('--cui-body-color'),
                  },
                },
              },
            }}
          />
        )}
      </CCardBody>
    </CCard>
  )
}
