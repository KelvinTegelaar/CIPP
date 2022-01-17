import React from 'react'
import PropTypes from 'prop-types'
import { faUsersCog } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellBoolean } from 'src/components/tables'

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
      body: CellBoolean(memberSettings.allowAddRemoveApps),
    },
    {
      heading: 'Can create private channels',
      body: CellBoolean(memberSettings.allowCreatePrivateChannels),
    },
    {
      heading: 'Can create and edit channels',
      body: CellBoolean(memberSettings.allowCreateUpdateChannels),
    },
    {
      heading: 'Can create and edit connectors',
      body: CellBoolean(memberSettings.allowCreateUpdateRemoveConnectors),
    },
    {
      heading: 'Can create and edit tabs',
      body: CellBoolean(memberSettings.allowCreateUpdateRemoveTabs),
    },
    {
      heading: 'Can delete channels',
      body: CellBoolean(memberSettings.allowDeleteChannels),
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
