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

  let anonymized = false // Assuming default value is false
  const regex = new RegExp('^[A-Z0-9]+$')
  const principalNameOrUPN =
    data[0]?.userPrincipalName ??
    data[0]?.UPN ??
    data[0]?.Owner ??
    data.Results?.[0]?.upn ??
    data.Results?.[0]?.userPrincipalName ??
    data.Results?.[0]?.Owner

  if (principalNameOrUPN && regex.test(principalNameOrUPN)) {
    anonymized = true
  }

  var defaultFilterText = ''
  if (params?.Parameters?.$filter) {
    defaultFilterText = 'Graph: ' + params?.Parameters?.$filter
  }
  return (
    <>
      {anonymized && (
        <CCallout color="info">
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
