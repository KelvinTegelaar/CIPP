import React from 'react'
import PropTypes from 'prop-types'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { TableContentCard } from 'src/components/contentcards'
import { CellTip } from 'src/components/tables'

export default function TeamMembers({ data, className = null, isFetching, error, errorMessage }) {
  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
    },
    {
      name: 'Mail',
      selector: (row) => row['email'],
      sortable: true,
      cell: (row) => CellTip(row['email']),
    },
  ]

  return (
    <TableContentCard
      title="Team Members"
      icon={faUserFriends}
      table={{
        reportName: 'TeamMembers',
        columns,
        data,
      }}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team members"
    />
  )
}

TeamMembers.propTypes = {
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
