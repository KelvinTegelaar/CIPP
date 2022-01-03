import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardHeader, CCardTitle, CLink, CSpinner } from '@coreui/react'
import { CellBoolean, CippDatatable } from '../../../components/cipp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { useListUserGroupsQuery } from '../../../store/api/groups'
import DataTable from 'react-data-table-component'

const formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    name: 'Display Name',
    selector: 'DisplayName',
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
    selector: 'MailEnabled',
    formatter,
  },
  {
    name: 'Email Address',
    selector: 'Mail',
  },
  {
    name: 'Security Group',
    selector: 'SecurityGroup',
    formatter,
  },
  {
    name: 'Group Types',
    selector: 'GroupTypes',
  },
  {
    name: 'On Premises Sync',
    selector: 'OnPremisesSync',
    formatter,
  },
  {
    name: 'Assignable To Role',
    selector: 'IsAssignableToRole',
    formatter,
  },
]

export default function UserGroups({ userId, tenantDomain }) {
  const { data: list = [], isFetching, error } = useListUserGroupsQuery({ userId, tenantDomain })

  // inject tenantDomain into list for formatter
  const mapped = list.map((val) => ({ ...val, tenantDomain }))

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>User Groups</CCardTitle>
        <FontAwesomeIcon icon={faUsers} />
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Error loading groups</>}
        {!isFetching && !error && (
          <DataTable
            keyField="id"
            columns={columns}
            data={mapped}
            striped
            bordered={false}
            dense
            wrapperClasses="table-responsive"
          />
        )}
      </CCardBody>
    </CCard>
  )
}

UserGroups.propTypes = {
  userId: PropTypes.string.isRequired,
  tenantDomain: PropTypes.string.isRequired,
}
