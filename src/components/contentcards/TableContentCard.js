import React from 'react'
import PropTypes from 'prop-types'
import { CSpinner } from '@coreui/react'
import { CippTable } from 'src/components/tables'
import { CippContentCard } from 'src/components/layout'

export default function TableContentCard({
  title,
  icon,
  table: { reportName, columns, data, ...rest },
  className = null,
  isFetching,
  error,
  errorMessage,
}) {
  return (
    <CippContentCard
      title={title}
      icon={icon}
      className={`datatable-content-card ${className ?? ''}`}
    >
      {isFetching && <CSpinner />}
      {!isFetching && error && <>{errorMessage}</>}
      {!isFetching && !error && (
        <CippTable
          data={data}
          reportName={reportName}
          columns={columns}
          tableProps={{
            striped: true,
            responsive: true,
            className: 'table-responsive',
          }}
          {...rest}
        />
      )}
    </CippContentCard>
  )
}

TableContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  table: PropTypes.shape({
    reportName: PropTypes.string,
    columns: PropTypes.array.isRequired,
    data: PropTypes.array.isRequired,
  }),
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
