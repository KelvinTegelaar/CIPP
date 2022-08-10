import React from 'react'
import PropTypes from 'prop-types'
import { faCog } from '@fortawesome/free-solid-svg-icons'
import { CellBoolean } from 'src/components/tables'
import { useListMailboxDetailsQuery } from 'src/store/api/mailbox'
import { ListGroupContentCard } from 'src/components/contentcards'

const formatter = (cell, warning = false, reverse = false, colourless = false) =>
  CellBoolean({ cell, warning, reverse, colourless })

export default function UserEmailSettings({ userId, tenantDomain, className = null }) {
  const { data: details, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  const content = [
    {
      heading: 'User Not Restricted',
      body: formatter(details?.BlockedForSpam, false, true),
    },
    {
      heading: 'Litigation Hold',
      body: formatter(details?.LitiationHold, false, false, true),
    },
    {
      heading: 'Hidden from Address Lists',
      body: formatter(details?.HiddenFromAddressLists, false, false, true),
    },
    {
      heading: 'EWS Enabled',
      body: formatter(details?.EWSEnabled, false, false, true),
    },
    {
      heading: 'MAPI Enabled',
      body: formatter(details?.MailboxMAPIEnabled, false, false, true),
    },
    {
      heading: 'OWA Enabled',
      body: formatter(details?.MailboxOWAEnabled, false, false, true),
    },
    {
      heading: 'IMAP Enabled',
      body: formatter(details?.MailboxImapEnabled, false, false, true),
    },
    {
      heading: 'POP Enabled',
      body: formatter(details?.MailboxPopEnabled, false, false, true),
    },
    {
      heading: 'Active Sync Enabled',
      body: formatter(details?.MailboxActiveSyncEnabled, false, false, true),
    },
    {
      heading: 'Forward and Deliver',
      body: formatter(details?.ForwardAndDeliver, false, false, true),
    },
    {
      heading: 'Forwarding Address',
      body: formatter(details?.ForwardingAddress, false, false, true),
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
