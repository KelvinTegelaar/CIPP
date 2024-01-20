import React from 'react'
import PropTypes from 'prop-types'
import { faKey } from '@fortawesome/free-solid-svg-icons'
import { useListUserConditionalAccessPoliciesQuery } from 'src/store/api/users'
import { ListGroupContentCard } from 'src/components/contentcards'

export default function UserCAPs({ tenantDomain, userId, className = null }) {
  const {
    data: list,
    isFetching,
    error,
  } = useListUserConditionalAccessPoliciesQuery({ tenantDomain, userId })
  const content = []
  list?.map((policy, index) =>
    content.push({
      body: policy.displayName ?? 'n/a',
    }),
  )
  return (
    <ListGroupContentCard
      title="Applied Conditional Access Policies"
      icon={faKey}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch conditional access policies"
    />
  )
}

UserCAPs.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
