import React from 'react'
import PropTypes from 'prop-types'
import { faUserFriends } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellBoolean } from 'src/components/tables'

export default function TeamGuestPolicies({
  guestSettings,
  className = null,
  isFetching,
  error,
  errorMessage,
}) {
  const content = [
    {
      heading: 'Guests can create channels',
      body: CellBoolean(guestSettings.allowCreateUpdateChannels),
    },
    {
      heading: 'Guests can delete channels',
      body: CellBoolean(guestSettings.allowDeleteChannels),
    },
  ]

  return (
    <ListGroupContentCard
      title="Guest Policies"
      icon={faUserFriends}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team guest settings"
    />
  )
}

TeamGuestPolicies.propTypes = {
  guestSettings: PropTypes.object.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
