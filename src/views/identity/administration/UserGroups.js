import React from 'react'
import PropTypes from 'prop-types'
import { CCard, CCardBody, CCardHeader, CCardTitle, CLink, CSpinner } from '@coreui/react'
import { CellBoolean, CippDatatable } from 'src/components/cipp'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUsers } from '@fortawesome/free-solid-svg-icons'
import { useListUserGroupsQuery } from 'src/store/api/groups'

const formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['DisplayName'],
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
    formatter,
  },
  {
    name: 'Email Address',
    selector: (row) => row['Mail'],
  },
  {
    name: 'Security Group',
    selector: (row) => row['SecurityGroup'],
    formatter,
  },
  {
    name: 'Group Types',
    selector: (row) => row['GroupTypes'],
  },
  {
    name: 'On Premises Sync',
    selector: (row) => row['OnPremisesSync'],
    formatter,
  },
  {
    name: 'Assignable To Role',
    selector: (row) => row['IsAssignableToRole'],
    formatter,
  },
]

export default function UserGroups({ userId, tenantDomain }) {
  const { data: list = [], isFetching, error } = useListUserGroupsQuery({ userId, tenantDomain })

  // inject tenantDomain into list for formatter
  const mapped = list.map((val) => ({ ...val, tenantDomain }))

  return (
    <CCard className="options-card">
      <CCardHeader className="d-flex justify-content-between">
        <CCardTitle>User Groups</CCardTitle>
        <FontAwesomeIcon icon={faUsers} />
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Error loading groups</>}
        {!isFetching && !error && (
          <CippDatatable
            path="/api/ListUserGroups"
            params={{ tenantFilter: tenantDomain, userId }}
            keyField="id"
            columns={columns}
            data={mapped}
            striped
            bordered={false}
            dense
            responsive={true}
            disablePDFExport={true}
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
