import React from 'react'
import PropTypes from 'prop-types'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { TableContentCard } from 'src/components/contentcards'
import { CLink } from '@coreui/react'

export default function TeamChannels({ data, className = null, isFetching, error, errorMessage }) {
  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
    },
    {
      name: 'Description',
      selector: (row) => row['description'],
    },
    {
      name: 'Created at',
      selector: (row) => row['createdDateTime'],
    },
    {
      name: 'Favorite by default',
      selector: (row) => row['isFavoriteByDefault'],
    },
    {
      name: 'Channel Link',
      selector: (row) => row['webUrl'],
      cell: (row, index, column) => {
        const cell = column.selector(row)
        return <CLink href={cell}>{row['displayName']}</CLink>
      },
    },
    {
      name: 'Email',
      selector: (row) => row['email'],
    },
  ]

  return (
    <TableContentCard
      title="Channels"
      icon={faUser}
      table={{
        reportName: 'TeamChannels',
        columns,
        data,
      }}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team owners"
    />
  )
}

TeamChannels.propTypes = {
  data: PropTypes.array.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
