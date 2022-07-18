import React from 'react'
import PropTypes from 'prop-types'
import { faClock } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { useListUserQuery } from 'src/store/api/users'

export default function UserLastLoginDetails({ tenantDomain, userId, className = null }) {
  const { data: user = {}, isFetching, error } = useListUserQuery({ tenantDomain, userId })

  const content = [
    {
      heading: 'Last Sign in Date (UTC)',
      body: user.lastSigninDate,
    },
    {
      heading: 'Last Sign in Application',
      body: user.lastSigninApplication,
    },
    {
      heading: 'Last Sign in Status',
      body: user.lastSigninStatus,
    },
    {
      heading: 'Last Sign in Result',
      body: user.lastSigninResult,
    },
    {
      heading: 'Last Sign in Failure Reason',
      body: user.lastSigninFailureReason,
    },
  ]

  return (
    <ListGroupContentCard
      title="Last Login Details"
      icon={faClock}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch last login details"
    />
  )
}

UserLastLoginDetails.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
