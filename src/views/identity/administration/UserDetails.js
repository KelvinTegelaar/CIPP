import React from 'react'
import PropTypes from 'prop-types'
import { faPortrait } from '@fortawesome/free-solid-svg-icons'
import { useListUserQuery } from 'src/store/api/users'
import { ListGroupContentCard } from 'src/components/contentcards'

export default function UserDetails({ tenantDomain, userId, className = null }) {
  const { data: user = {}, isFetching, error } = useListUserQuery({ tenantDomain, userId })

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
      heading: 'Licenses',
      body: user.LicJoined,
    },
    {
      heading: 'Alias',
      body: user.mailNickname,
    },
    {
      heading: 'Primary Domain',
      body: user.primDomain,
    },
    {
      heading: 'Job Title',
      body: user.jobTitle,
    },
    {
      heading: 'Usage Location',
      body: user.usageLocation,
    },
    {
      heading: 'Street Address',
      body: user.streetAddress,
    },
    {
      heading: 'City',
      body: user.city,
    },
    {
      heading: 'Postcode',
      dataField: user.postalCode,
    },
    {
      heading: 'Country',
      body: user.country,
    },
    {
      heading: 'Company Name',
      body: user.companyName,
    },
    {
      heading: 'Department',
      body: user.department,
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
      title="User Details"
      icon={faPortrait}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch user details"
    />
  )
}

UserDetails.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
