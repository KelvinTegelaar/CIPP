import React from 'react'
import PropTypes from 'prop-types'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'

export default function UserEmailDetails({ user, isFetching, error, className = null }) {
  const content = [
    {
      heading: 'Primary Email',
      body: user.mail,
    },
    {
      heading: 'Other Email Addresses',
      body: user.otherMails.length > 0 ? user.otherMails.join('<br />') : 'n/a',
    },
    {
      heading: 'Proxy Addresses',
      body: user.Aliases,
    },
  ]
  return (
    <ListGroupContentCard
      title="Email Details"
      icon={faEnvelope}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch email details"
      tooltip={true}
    />
  )
}

UserEmailDetails.propTypes = {
  user: PropTypes.object,
  isFetching: PropTypes.bool,
  error: PropTypes.any,
  className: PropTypes.string,
}
