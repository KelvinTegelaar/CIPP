import React from 'react'
import PropTypes from 'prop-types'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { useListMailboxDetailsQuery } from 'src/store/api/mailbox'
import { ListGroupContentCard } from 'src/components/contentcards'

export default function UserEmailPermissions({ userId, tenantDomain, className = null }) {
  const { data: report, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  let permissions = (report && report.Permissions) || []
  if (!Array.isArray(permissions)) {
    permissions = [permissions]
  }
  const content = []
  permissions?.map((permission, index) =>
    content.push({
      heading: permission.User,
      body: permission.AccessRights,
    }),
  )

  return (
    <ListGroupContentCard
      title="Email Permissions"
      icon={faEnvelope}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch email permissions"
    />
  )
}

UserEmailPermissions.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
