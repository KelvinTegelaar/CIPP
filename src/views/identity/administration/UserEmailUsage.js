import React from 'react'
import PropTypes from 'prop-types'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellProgressBar } from 'src/components/tables'
import { useListMailboxDetailsQuery } from 'src/store/api/mailbox'

export default function UserEmailUsage({ userId, tenantDomain, className = null }) {
  const { data: usage, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  const content = [
    {
      heading: 'Total Items',
      body: usage?.ItemCount,
    },
    {
      heading: 'Total Size',
      body: String(`${usage?.TotalItemSize} GB`),
    },
    {
      heading: 'Prohibit Send',
      body: String(`${usage?.ProhibitSendQuota} GB`),
    },
    {
      heading: 'Total Send & Receive',
      body: String(`${usage?.ProhibitSendReceiveQuota} GB`),
    },
    {
      heading: 'Usage',
      body: CellProgressBar({
        // round to 2 decimal places
        value:
          Math.round((usage?.TotalItemSize / usage?.ProhibitSendReceiveQuota) * 100 * 100) / 100,
        reverse: true,
      }),
    },
    {
      heading: 'Total Archive Size',
      body: String(`${usage?.TotalArchiveItemSize} GB`),
    },
    {
      heading: 'Total Archive Items',
      body: usage?.TotalArchiveItemCount,
    },
  ]
  return (
    <ListGroupContentCard
      title="Email Usage"
      icon={faEnvelope}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage="Failed to fetch email usage"
    />
  )
}

UserEmailUsage.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
