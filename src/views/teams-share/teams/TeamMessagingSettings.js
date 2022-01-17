import React from 'react'
import PropTypes from 'prop-types'
import { faBullhorn } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellBoolean } from 'src/components/tables'

export default function TeamMessagingSettings({
  messagingSettings,
  funSettings,
  className = null,
  isFetching,
  error,
  errorMessage,
}) {
  const content = [
    {
      heading: 'Allow @channel mentions',
      body: CellBoolean(messagingSettings.allowChannelMentions),
    },
    {
      heading: 'Allow @team mentions',
      body: CellBoolean(messagingSettings.allowTeamMentions),
    },
    {
      heading: 'Allow owners to delete messages',
      body: CellBoolean(messagingSettings.allowOwnerDeleteMessages),
    },
    {
      heading: 'Allow users to delete messages',
      body: CellBoolean(messagingSettings.allowUserDeleteMessages),
    },
    {
      heading: 'Allow users to edit messages',
      body: CellBoolean(messagingSettings.allowUserEditMessages),
    },
    {
      heading: 'Allow GIFs',
      body: CellBoolean(funSettings.allowGiphy),
    },
    {
      heading: 'Allow stickers and memes',
      body: CellBoolean(funSettings.allowStickersAndMemes),
    },
    {
      heading: 'GIF content rating',
      body: funSettings.giphyContentRating,
    },
  ]

  return (
    <ListGroupContentCard
      title="Messaging Settings"
      icon={faBullhorn}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team member settings"
    />
  )
}

TeamMessagingSettings.propTypes = {
  messagingSettings: PropTypes.object.isRequired,
  funSettings: PropTypes.object.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
