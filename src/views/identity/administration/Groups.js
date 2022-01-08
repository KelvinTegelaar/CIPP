import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { cellBooleanFormatter } from '../../../components/cipp'
import { faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from '../../../components'
import { TitleButton } from '../../../components/cipp'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  return (
    <>
      <CButton
        size="sm"
        variant="ghost"
        color="warning"
        href={`/identity/administration/groups/edit?groupId=${row.id}&tenantDomain=${tenant.defaultDomainName}`}
      >
        <FontAwesomeIcon icon={faEdit} />
      </CButton>
    </>
  )
}

const columns = [
  {
    name: 'Name',
    selector: (row) => row['displayName'],
    sortable: true,
  },
  {
    name: 'Group Type',
    selector: (row) => row['calculatedGroupType'],
    sortable: true,
  },
  {
    name: 'Dynamic Group',
    selector: (row) => row['dynamicGroupBool'],
    cell: cellBooleanFormatter(),
    sortable: true,
  },
  {
    name: 'Teams Enabled',
    selector: (row) => row['teamsEnabled'],
    sortable: true,
    cell: cellBooleanFormatter(),
  },
  {
    name: 'On-Prem Sync',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter({ warning: true }),
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
  },
  {
    name: 'Action',
    cell: Offcanvas,
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
