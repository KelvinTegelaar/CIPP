import React from 'react'
import PropTypes from 'prop-types'
import { faBullhorn } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellBoolean } from 'src/components/tables'

const formatter = (cell, warning = false, reverse = false, colourless = false) =>
  CellBoolean({ cell, warning, reverse, colourless })

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
      body: formatter(messagingSettings.allowChannelMentions, false, false, true),
    },
    {
      heading: 'Allow @team mentions',
      body: formatter(messagingSettings.allowTeamMentions, false, false, true),
    },
    {
      heading: 'Allow owners to delete messages',
      body: formatter(messagingSettings.allowOwnerDeleteMessages, false, false, true),
    },
    {
      heading: 'Allow users to delete messages',
      body: formatter(messagingSettings.allowUserDeleteMessages, false, false, true),
    },
    {
      heading: 'Allow users to edit messages',
      body: formatter(messagingSettings.allowUserEditMessages, false, false, true),
    },
    {
      heading: 'Allow GIFs',
      body: formatter(funSettings.allowGiphy, false, false, true),
    },
    {
      heading: 'Allow stickers and memes',
      body: formatter(funSettings.allowStickersAndMemes, false, false, true),
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
