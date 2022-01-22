import React from 'react'
import PropTypes from 'prop-types'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { TableContentCard } from 'src/components/contentcards'

export default function TeamOwners({ data, className = null, isFetching, error, errorMessage }) {
  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
    },
    {
      name: 'Mail',
      selector: (row) => row['mail'],
    },
  ]

  return (
    <TableContentCard
      title="Team Owners"
      icon={faUser}
      table={{
        reportName: 'TeamOwners',
        columns: columns,
        data: data,
      }}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team owners"
    />
  )
}

TeamOwners.propTypes = {
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
