import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CButton, CCard, CCardBody, CCardFooter, CCardHeader, CCardTitle } from '@coreui/react'
import Skeleton from 'react-loading-skeleton'
import { CChart } from '@coreui/react-chartjs'
import { getStyle } from '@coreui/utils'
import PropTypes from 'prop-types'

export default function CippChartCard({
  title,
  titleType = 'normal',
  ChartData,
  ChartLabels,
  ChartType = 'pie',
  LegendLocation = 'bottom',
  isFetching,
  refreshFunction,
}) {
  return (
    <CCard className="h-100 mb-3">
      <CCardHeader>
        <CCardTitle>
          {titleType === 'big' ? <h3 className="underline mb-3">{title}</h3> : title}
          {refreshFunction && (
            <CButton
              className="position-absolute top-0 end-0 mt-2 me-2"
              variant="ghost"
              onClick={refreshFunction}
            >
              <FontAwesomeIcon icon="sync" />
            </CButton>
          )}
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
                  label: title,
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
CippChartCard.propTypes = {
  title: PropTypes.string.isRequired,
  titleType: PropTypes.oneOf(['normal', 'big']),
  ChartData: PropTypes.array.isRequired,
  ChartLabels: PropTypes.array.isRequired,
  ChartType: PropTypes.oneOf(['pie', 'bar', 'line']),
  LegendLocation: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  isFetching: PropTypes.bool,
  refreshFunction: PropTypes.func,
}
