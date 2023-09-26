import React from 'react'
import { useListDatatableQuery } from 'src/store/api/datatable'
import PropTypes from 'prop-types'
import { CippTable } from 'src/components/tables'
import { CippTablePropTypes } from 'src/components/tables/CippTable'
import { CCallout } from '@coreui/react'

export default function CippDatatable({ path, params, ...rest }) {
  const [refreshGuid, setRefreshGuid] = React.useState('')
  const [graphFilter, setGraphFilter] = React.useState(params?.Parameters?.$filter)
  const {
    data = [],
    isFetching,
    error,
  } = useListDatatableQuery({ path, params: { refreshGuid, $filter: graphFilter, ...params } })

  var defaultFilterText = ''
  if (params?.Parameters?.$filter) {
    defaultFilterText = 'Graph: ' + params?.Parameters?.$filter
  }
  return (
    <>
      {data[0]?.Queued && <CCallout color="info">{data[0]?.QueueMessage}</CCallout>}
      <CippTable
        {...rest}
        data={data[0]?.Queued ? [] : data}
        isFetching={isFetching}
        error={error}
        defaultFilterText={defaultFilterText}
        refreshFunction={setRefreshGuid}
        graphFilterFunction={setGraphFilter}
      />
    </>
  )
}

CippDatatable.propTypes = {
  path: PropTypes.string.isRequired,
  params: PropTypes.object,
  ...CippTablePropTypes,
}
