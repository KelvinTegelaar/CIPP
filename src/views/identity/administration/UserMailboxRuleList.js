import React from 'react'
import PropTypes from 'prop-types'
import { CellTip } from 'src/components/tables'
import { DatatableContentCard } from 'src/components/contentcards'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

const rowStyle = (row, rowIndex) => {
  const style = {}

  return style
}

export default function UserMailboxRuleList({ userId, tenantDomain, className = null }) {
  const columns = [
    {
      selector: (row) => row['Name'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['Name']),
      exportSelector: 'Name',
      maxwidth: '350px',
    },
    {
      selector: (row) => row['Description'],
      name: 'Description',
      sortable: true,
      cell: (row) => CellTip(row['Description']),
      exportSelector: 'Description',
      width: '600px',
    },
    {
      selector: (row) => row['ForwardTo'],
      name: 'Forwards To',
      sortable: true,
      cell: (row) => CellTip(row['ForwardTo']),
      exportSelector: 'ForwardTo',
      width: '600px',
    },
  ]

  return (
    <DatatableContentCard
      title="User Mailbox Rules"
      icon={faEnvelope}
      className={className}
      datatable={{
        reportName: 'ListUserMailboxRules',
        path: '/api/ListUserMailboxRules',
        params: { tenantFilter: tenantDomain, userId },
        columns,
        keyField: 'id',
        responsive: true,
        dense: true,
        rowStyle: rowStyle,
        striped: true,
      }}
    />
  )
}

UserMailboxRuleList.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
  className: PropTypes.string,
}
