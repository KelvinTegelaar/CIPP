import React from 'react'
import PropTypes from 'prop-types'
import { CLink } from '@coreui/react'
import { DatatableContentCard } from 'src/components/contentcards'
import { CellBoolean, CellTip, cellBooleanFormatter } from 'src/components/tables'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { useListUserGroupsQuery } from 'src/store/api/groups'

const formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['DisplayName'],
    sortable: true,
    exportSelector: 'DisplayName',
    cell: (row) => CellTip(row['DisplayName']),
    minWidth: '200px',
    formatter: (cell, row) => {
      return (
        <CLink
          href={`https://aad.portal.azure.com/${row.tenantDomain}/#blade/Microsoft_AAD_IAM/GroupDetailsMenuBlade/Overview/groupId/${row.id}`}
        >
          {row.DisplayName}
        </CLink>
      )
    },
  },
  {
    name: 'Mail Enabled',
    selector: (row) => row['MailEnabled'],
    sortable: true,
    exportSelector: 'MailEnabled',
    formatter,
  },
  {
    name: 'Email Address',
    selector: (row) => row['Mail'],
    sortable: true,
    exportSelector: 'Mail',
    cell: (row) => CellTip(row['Mail']),
    minWidth: '200px',
  },
  {
    name: 'Security Group',
    selector: (row) => row['SecurityGroup'],
    sortable: true,
    exportSelector: 'SecurityGroup',
    cell: cellBooleanFormatter({ colourless: true }),
    formatter,
  },
  {
    name: 'Group Types',
    selector: (row) => row['GroupTypes'],
    sortable: true,
    exportSelector: 'GroupTypes',
    cell: (row) => CellTip(row['GroupTypes']),
  },
  {
    name: 'On Premises Sync',
    selector: (row) => row['OnPremisesSync'],
    sortable: true,
    exportSelector: 'OnPremisessSync',
    formatter,
  },
  {
    name: 'Assignable To Role',
    selector: (row) => row['IsAssignableToRole'],
    sortable: true,
    exportSelector: 'IsAssignableToRole',
    formatter,
  },
]

export default function UserGroups({ userId, tenantDomain, className = null }) {
  const { data: list = [], isFetching, error } = useListUserGroupsQuery({ userId, tenantDomain })

  // inject tenantDomain into list for formatter
  const mapped = list.map((val) => ({ ...val, tenantDomain }))

  return (
    <DatatableContentCard
      title="User Groups"
      icon={faUsers}
      className={className}
      isFetching={isFetching}
      error={error}
      datatable={{
        reportName: 'ListUserGroups',
        path: '/api/ListUserGroups',
        params: { tenantFilter: tenantDomain, userId },
        columns,
        keyField: 'id',
        responsive: true,
        dense: true,
        striped: true,
        data: mapped,
      }}
    />
  )
}

UserGroups.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
  className: PropTypes.string,
}
