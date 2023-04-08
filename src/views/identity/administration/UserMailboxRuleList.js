import React from 'react'
import PropTypes from 'prop-types'
import { cellBooleanFormatter, CellTip } from 'src/components/tables'
import { DatatableContentCard } from 'src/components/contentcards'
import { faEnvelope } from '@fortawesome/free-solid-svg-icons'

const rowStyle = (row, rowIndex) => {
  const style = {}

  return style
}

export default function UserMailboxRuleList({ userId, tenantDomain, className = null }) {
  const formatter = (cell) => CellBoolean({ cell })
  const columns = [
    {
      selector: (row) => row['Name'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['Name']),
      exportSelector: 'Name',
      width: '200px',
    },
    {
      selector: (row) => row['Description'],
      name: 'Description',
      sortable: true,
      cell: (row) => CellTip(row['Description']),
      exportSelector: 'Description',
      width: '350px',
    },
    {
      selector: (row) => row['ForwardTo'],
      name: 'Forwards To',
      sortable: true,
      cell: (row) => CellTip(row['ForwardTo']),
      exportSelector: 'ForwardTo',
      width: '250px',
    },
    {
      selector: (row) => row['RedirectTo'],
      name: 'Redirect To',
      sortable: true,
      cell: (row) => CellTip(row['RedirectTo']),
      exportSelector: 'RedirectTo',
      maxwidth: '250px',
    },
    {
      selector: (row) => row['CopyToFolder'],
      name: 'Copy To Folder',
      sortable: true,
      cell: (row) => CellTip(row['CopyToFolder']),
      exportSelector: 'CopyToFolder',
      maxwidth: '200px',
    },
    {
      selector: (row) => row['MoveToFolder'],
      name: 'Move To Folder',
      sortable: true,
      cell: (row) => CellTip(row['MoveToFolder']),
      exportSelector: 'MoveToFolder',
      maxwidth: '200px',
    },
    {
      selector: (row) => row['DeleteMessage'],
      name: 'Delete Message',
      sortable: true,
      cell: cellBooleanFormatter({ colourless: true }),
      formatter,
      exportSelector: 'DeleteMessage',
      width: '200px',
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
