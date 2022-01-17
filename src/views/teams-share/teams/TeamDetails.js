import React from 'react'
import PropTypes from 'prop-types'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellBoolean } from 'src/components/tables'

export default function TeamDetails({ team, className = null, isFetching, error, errorMessage }) {
  const content = [
    {
      heading: 'Display Name',
      body: team.displayName,
    },
    {
      heading: 'Description',
      body: team.description,
    },
    {
      heading: 'Archived',
      body: CellBoolean(team.isArchived),
    },
    {
      heading: 'Created',
      body: team.createdDateTime,
    },
    {
      heading: 'Visibility',
      body: team.visibility,
    },
    {
      heading: 'URL',
      link: team.webUrl,
      linkText: 'Link',
    },
  ]

  return (
    <ListGroupContentCard
      title="Team Details"
      icon={faUsers}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team details"
    />
  )
}

TeamDetails.propTypes = {
  team: PropTypes.object.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
