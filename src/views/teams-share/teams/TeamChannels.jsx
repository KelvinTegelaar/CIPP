import React from 'react'
import PropTypes from 'prop-types'
import { faUser } from '@fortawesome/free-solid-svg-icons'
import { TableContentCard } from 'src/components/contentcards'
import { CLink } from '@coreui/react'
import { CellTip, cellBooleanFormatter, cellDateFormatter } from 'src/components/tables'

export default function TeamChannels({ data, className = null, isFetching, error, errorMessage }) {
  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
    },
    {
      name: 'Description',
      selector: (row) => row['description'],
      sortable: true,
      cell: (row) => CellTip(row['description']),
    },
    {
      name: 'Created Date (Local)',
      selector: (row) => row['createdDateTime'],
      sortable: true,
      cell: cellDateFormatter(),
    },
    {
      name: 'Favorite by default',
      selector: (row) => row['isFavoriteByDefault'],
      sortable: true,
      cell: cellBooleanFormatter({ colourless: true }),
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
      sortable: true,
      cell: (row) => CellTip(row['email']),
    },
    {
      name: 'Moderation Settings',
      selector: (row) => row['moderationSettings'],
      sortable: true,
      cell: (row) => CellTip(row['moderationSettings']),
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
