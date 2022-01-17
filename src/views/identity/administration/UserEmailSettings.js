import React from 'react'
import PropTypes from 'prop-types'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { CellBoolean } from 'src/components/tables'
import { useListMailboxDetailsQuery } from 'src/store/api/mailbox'
import { ListGroupContentCard } from 'src/components/contentcards'

const formatter = (cell) => CellBoolean({ cell })

export default function UserEmailSettings({ userId, tenantDomain, className = null }) {
  const { data: details, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  const content = [
    {
      heading: 'User Not Restricted',
      body: formatter(details?.BlockedForSpam),
    },
    {
      heading: 'Litigation Hold',
      body: formatter(details?.LitiationHold),
    },
    {
      heading: 'Hidden from Address Lists',
      body: formatter(details?.HiddenFromAddressLists),
    },
    {
      heading: 'EWS Enabled',
      body: formatter(details?.EWSEnabled),
    },
    {
      heading: 'MAPI Enabled',
      body: formatter(details?.MailboxMAPIEnabled),
    },
    {
      heading: 'OWA Enabled',
      body: formatter(details?.MailboxOWAEnabled),
    },
    {
      heading: 'IMAP Enabled',
      body: formatter(details?.MailboxImapEnabled),
    },
    {
      heading: 'POP Enabled',
      body: formatter(details?.MailboxPopEnabled),
    },
    {
      heading: 'Active Sync Enabled',
      body: formatter(details?.MailboxActiveSyncEnabled),
    },
    {
      heading: 'Forward and Deliver',
      body: formatter(details?.ForwardAndDeliver),
    },
    {
      heading: 'Forwarding Address',
      body: formatter(details?.ForwardingAddress),
    },
  ]
  return (
    <ListGroupContentCard
      title="Email Settings"
      icon={faCog}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMsg="Unable to fetch email settings"
    />
  )
}

UserEmailSettings.propTypes = {
  tenantDomain: PropTypes.string.isRequired,
  userId: PropTypes.string.isRequired,
  className: PropTypes.string,
}
