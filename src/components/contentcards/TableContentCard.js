import React from 'react'
import PropTypes from 'prop-types'
import { CippDatatable } from 'src/components/tables'
import { CippContentCard } from 'src/components/layout'

export default function TableContentCard({
  title,
  icon,
  datatable: { reportName, path, columns, params, ...rest },
  className = null,
}) {
  return (
    <CippContentCard title={title} icon={icon} className={className ?? ''}>
      <CippDatatable
        reportName={reportName}
        path={path}
        columns={columns}
        params={params}
        {...rest}
      />
    </CippContentCard>
  )
}

TableContentCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.object,
  datatable: PropTypes.shape({
    reportName: PropTypes.string,
    path: PropTypes.string.isRequired,
    columns: PropTypes.array.isRequired,
    params: PropTypes.object,
  }),
  className: PropTypes.string,
}
