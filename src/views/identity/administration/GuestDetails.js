import React from 'react'
import PropTypes from 'prop-types'
import { faPortrait } from '@fortawesome/free-solid-svg-icons'
import { useListGuestQuery } from 'src/store/api/users'
import { ListGroupContentCard } from 'src/components/contentcards'

export default function GuestDetails({ tenantDomain, userId, className = null }) {
  const { data: user = {}, isFetching, error } = useListGuestQuery({ tenantDomain, userId })

  const content = [
    {
      heading: 'First Name',
      body: user.givenName,
    },
    {
      heading: 'Last Name',
      body: user.surname,
    },
    {
      heading: 'User Principal Name',
      body: user.userPrincipalName,
    },
    {
      heading: 'Job Title',
      body: user.jobTitle,
    },
    {
      heading: 'Mobile Phone',
      body: user.mobilePhone,
    },
    {
      heading: 'Business Phone',
      body: user.businessPhones,
    },
  ]

  return (
    <ListGroupContentCard
      title="Guest Details"
      icon={faPortrait}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch Guest details"
    />
  )
}

GuestDetails.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
