import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { cellBooleanFormatter, CellTip } from 'src/components/tables'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { Link } from 'react-router-dom'

const Actions = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <Link
      to={`/identity/administration/groups/edit?groupId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
    >
      <CButton size="sm" variant="ghost" color="warning">
        <FontAwesomeIcon icon={faEdit} />
      </CButton>
    </Link>
  )
}

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
    cell: (row) => CellTip(row['displayName']),
    exportSelector: 'displayName',
    grow: 2,
  },
  {
    name: 'Group Type',
    selector: (row) => row['calculatedGroupType'],
    sortable: true,
    exportSelector: 'calculatedGroupType',
    cell: (row) => CellTip(row['calculatedGroupType']),
    minWidth: '165px',
  },
  {
    name: 'Dynamic Group',
    selector: (row) => row['dynamicGroupBool'],
    cell: cellBooleanFormatter({ colourless: true }),
    sortable: true,
    exportSelector: 'dynamicGroupBool',
    minWidth: '145px',
  },
  {
    name: 'Teams Enabled',
    selector: (row) => row['teamsEnabled'],
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    exportSelector: 'teamsEnabled',
    minWidth: '140px',
  },
  {
    name: 'On-Prem Sync',
    selector: (row) => row['onPremisesSyncEnabled'],
    sortable: true,
    cell: cellBooleanFormatter({ colourless: true }),
    exportSelector: 'onPremisessSyncEnabled',
    minWidth: '140px',
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
    exportSelector: 'mail',
    cell: (row) => CellTip(row['mail']),
    grow: 2,
  },
  {
    name: 'Actions',
    cell: Actions,
    maxWidth: '20px',
  },
]

const Groups = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Groups"
      titleButton={<TitleButton href="/identity/administration/groups/add" title="Add Group" />}
      datatable={{
        reportName: `${tenant?.defaultDomainName}-Groups`,
        path: '/api/ListGroups',
        params: { TenantFilter: tenant?.defaultDomainName },
        columns,
      }}
    />
  )
}

export default Groups
