import React from 'react'
import { useListDatatableQuery } from 'src/store/api/datatable'
import PropTypes from 'prop-types'
import { CippTable } from 'src/components/tables'
import { CippTablePropTypes } from 'src/components/tables/CippTable'
import { CCallout } from '@coreui/react'

export default function CippDatatable({ path, params, ...rest }) {
  const [graphFilter, setGraphFilter] = React.useState(params?.Parameters?.$filter)
  const {
    data = [],
    isFetching,
    error,
    refetch,
  } = useListDatatableQuery({ path, params: { $filter: graphFilter, ...params } })

  //Check if data[0].userPrincipalName OR data[0].UPN OR data.Results[0].upn OR data.Results[0].userPrincipalName
  // follows this regex pattern ^[A-Z0-9]+$. If it does, set the let 'anonimized' to true.
  let anonimized = false
  if (Array.isArray(data?.Results)) {
    anonimized =
      data?.Results[0]?.userPrincipalName?.match(/^[A-Z0-9]+$/) ||
      data?.Results[0]?.UPN?.match(/^[A-Z0-9]+$/)
  } else {
    anonimized = data?.userPrincipalName?.match(/^[A-Z0-9]+$/) || data?.UPN?.match(/^[A-Z0-9]+$/)
  }

  var defaultFilterText = ''
  if (params?.Parameters?.$filter) {
    defaultFilterText = 'Graph: ' + params?.Parameters?.$filter
  }
  return (
    <>
      {anonimized && (
        <CCallout color="warning">
          This table might contain anonymized data. Please check this
          <a
            className="m-1"
            href="https://docs.cipp.app/troubleshooting/frequently-asked-questions#my-usernames-or-sites-are-guids-or-blank"
          >
            documentation link
          </a>
          to resolve this.
        </CCallout>
      )}
      {data?.Metadata?.Queued && <CCallout color="info">{data?.Metadata?.QueueMessage}</CCallout>}
      <CippTable
        {...rest}
        endpointName={path}
        data={Array.isArray(data?.Results) ? data?.Results : data}
        isFetching={isFetching}
        error={error}
        defaultFilterText={defaultFilterText}
        refreshFunction={() => refetch()}
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
