import React from 'react'
import PropTypes from 'prop-types'
import { CSpinner } from '@coreui/react'
import { CippDatatable } from 'src/components/tables'
import { CippContentCard } from 'src/components/layout'

export default function DatatableContentCard({
  title,
  icon,
  datatable: { reportName, path, columns, params, ...rest },
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
        <CippDatatable
          reportName={reportName}
          path={path}
          columns={columns}
          params={params}
          {...rest}
        />
      )}
    </CippContentCard>
  )
}

DatatableContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  datatable: PropTypes.shape({
    reportName: PropTypes.string,
    path: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    params: PropTypes.object,
  }),
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
