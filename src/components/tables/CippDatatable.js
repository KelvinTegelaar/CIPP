import React from 'react'
import { useListDatatableQuery } from 'src/store/api/datatable'
import PropTypes from 'prop-types'
import { CippTable } from 'src/components/tables'
import { CippTablePropTypes } from 'src/components/tables/CippTable'

export default function CippDatatable({ path, params, ...rest }) {
  const { data = [], isFetching, error } = useListDatatableQuery({ path, params })

  return <CippTable {...rest} data={data} isFetching={isFetching} error={error} />
}

CippDatatable.propTypes = {
  path: PropTypes.string.isRequired,
  params: PropTypes.object,
  ...CippTablePropTypes,
}
