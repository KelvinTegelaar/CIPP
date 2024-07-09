import React from 'react'
import PropTypes from 'prop-types'
import { faCloud } from '@fortawesome/free-solid-svg-icons'
import { ListGroupContentCard } from 'src/components/contentcards'
import { CellProgressBar } from 'src/components/tables'
import { useListOneDriveUsageQuery } from 'src/store/api/oneDrive'

export default function UserOneDriveUsage({ userUPN, tenantDomain, className = null }) {
  const {
    data: usage = [],
    isFetching,
    error,
  } = useListOneDriveUsageQuery({ userUPN, tenantDomain })

  const noUsage = Object.keys(usage).length === 0 ?? false
  const content = [
    {
      heading: 'Site URL',
      body: usage[0]?.URL,
    },
    {
      heading: 'Usage',
      body: `${usage[0]?.UsedGB} / ${usage[0]?.Allocated}`,
    },
    {
      heading: 'Percent',
      body: CellProgressBar({
        value: ((usage[0]?.UsedGB / usage[0]?.Allocated) * 100).toFixed(2),
        reverse: true,
      }),
    },
    {
      heading: 'Files',
      body: usage[0]?.FileCount,
    },
    {
      heading: 'Last Active',
      body: usage[0]?.LastActive,
    },
  ]

  return (
    <ListGroupContentCard
      title="OneDrive Details"
      icon={faCloud}
      content={content}
      className={className}
      isFetching={isFetching}
      error={error}
      errorMessage={!noUsage ? 'Failed to fetch OneDrive details' : 'No OneDrive usage'}
      tooltip={true}
    />
  )
}

UserOneDriveUsage.propTypes = {
  userUPN: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
  className: PropTypes.string,
}
