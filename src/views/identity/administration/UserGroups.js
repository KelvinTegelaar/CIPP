import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'
import { listUserGroups } from '../../../store/modules/groups'
import { CCard, CCardBody, CCardHeader, CCardTitle, CLink, CSpinner } from '@coreui/react'
import BootstrapTable from 'react-bootstrap-table-next'
import { CellBoolean } from '../../../components/cipp'
import CIcon from '@coreui/icons-react'
import { cilGroup } from '@coreui/icons'
import { useListUserGroupsQuery } from '../../../store/api/groups'

const formatter = (cell) => CellBoolean({ cell })

const columns = [
  {
    text: 'Display Name',
    dataField: 'DisplayName',
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
    text: 'Mail Enabled',
    dataField: 'MailEnabled',
    formatter,
  },
  {
    text: 'Email Address',
    dataField: 'Mail',
  },
  {
    text: 'Security Group',
    dataField: 'SecurityGroup',
    formatter,
  },
  {
    text: 'Group Types',
    dataField: 'GroupTypes',
  },
  {
    text: 'On Premises Sync',
    dataField: 'OnPremisesSync',
    formatter,
  },
  {
    text: 'Assignable To Role',
    dataField: 'IsAssignableToRole',
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
        <CIcon icon={cilGroup} />
      </CCardHeader>
      <CCardBody>
        {isFetching && <CSpinner />}
        {!isFetching && error && <>Error loading groups</>}
        {!isFetching && !error && (
          <BootstrapTable
            keyField="id"
            columns={columns}
            data={mapped}
            striped
            bordered={false}
            condensed
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
