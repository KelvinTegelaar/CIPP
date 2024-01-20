import React from 'react'
import PropTypes from 'prop-types'
import { faWindowRestore } from '@fortawesome/free-solid-svg-icons'
import { TableContentCard } from 'src/components/contentcards'

export default function TeamApplications({
  data,
  className = null,
  isFetching,
  error,
  errorMessage,
}) {
  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row.teamsAppDefinition['displayName'],
      sortable: true,
      minWidth: '20rem',
    },
    {
      name: 'Description',
      selector: (row) => row.teamsAppDefinition['description'],
      sortable: true,
    },
    {
      name: 'Version',
      selector: (row) => row.teamsAppDefinition['version'],
      sortable: true,
    },
    {
      name: 'Created by',
      selector: (row) => row.teamsAppDefinition['createdBy'],
      sortable: true,
    },
  ]

  return (
    <TableContentCard
      title="Installed Applications"
      icon={faWindowRestore}
      table={{
        reportName: 'TeamApplications',
        columns,
        data,
      }}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team applications"
    />
  )
}

TeamApplications.propTypes = {
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
