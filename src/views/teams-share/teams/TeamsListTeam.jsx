import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const TeamsList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const Actions = (row, rowIndex, formatExtraData) => (
    <>
      <Link
        to={`/teams-share/teams/view-team-settings?tenantDomain=${tenant.defaultDomainName}&groupId=${row.id}`}
      >
        <CButton size="sm" variant="ghost" color="success">
          <FontAwesomeIcon icon={faEye} />
        </CButton>
      </Link>
      <Link
        to={`/identity/administration/groups/edit?groupId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
      >
        <CButton size="sm" variant="ghost" color="warning">
          <FontAwesomeIcon icon={faEdit} />
        </CButton>
      </Link>
    </>
  )

  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      name: 'Description',
      selector: (row) => row['description'],
      sortable: true,
      cell: (row) => CellTip(row['description']),
      exportSelector: 'description',
    },
    {
      name: 'Visibility',
      selector: (row) => row['visibility'],
      sortable: true,
      exportSelector: 'visibility',
      maxWidth: '100px',
    },
    {
      name: 'Mail nickname',
      selector: (row) => row['mailNickname'],
      sortable: true,
      cell: (row) => CellTip(row['mailNickname']),
      exportSelector: 'mailNickname',
      maxWidth: '200px',
    },
    {
      name: 'ID',
      selector: (row) => row['id'],
      omit: true,
    },
    {
      name: 'Actions',
      cell: Actions,
      maxWidth: '80px',
    },
  ]

  return (
    <CippPageList
      title="Teams"
      datatable={{
        columns,
        path: '/api/ListTeams?type=list',
        reportName: `${tenant?.defaultDomainName}-Teams-List`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default TeamsList
