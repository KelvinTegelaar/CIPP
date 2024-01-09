import React from 'react'
import PropTypes from 'prop-types'
import { faUsersCog } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellBoolean } from 'src/components/tables'

const formatter = (cell, warning = false, reverse = false, colourless = false) =>
  CellBoolean({ cell, warning, reverse, colourless })

export default function TeamMemberPolicies({
  memberSettings,
  className = null,
  isFetching,
  error,
  errorMessage,
}) {
  const content = [
    {
      heading: 'Can edit and remove apps',
      body: formatter(memberSettings.allowAddRemoveApps, false, false, true),
    },
    {
      heading: 'Can create private channels',
      body: formatter(memberSettings.allowCreatePrivateChannels, false, false, true),
    },
    {
      heading: 'Can create and edit channels',
      body: formatter(memberSettings.allowCreateUpdateChannels, false, false, true),
    },
    {
      heading: 'Can create and edit connectors',
      body: formatter(memberSettings.allowCreateUpdateRemoveConnectors, false, false, true),
    },
    {
      heading: 'Can create and edit tabs',
      body: formatter(memberSettings.allowCreateUpdateRemoveTabs, false, false, true),
    },
    {
      heading: 'Can delete channels',
      body: formatter(memberSettings.allowDeleteChannels, false, false, true),
    },
  ]

  return (
    <ListGroupContentCard
      title="Member Policies"
      icon={faUsersCog}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch team member settings"
    />
  )
}

TeamMemberPolicies.propTypes = {
  memberSettings: PropTypes.object.isRequired,
  className: PropTypes.string,
  isFetching: PropTypes.bool,
  error: PropTypes.object,
  errorMessage: PropTypes.string,
}
