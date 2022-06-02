import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useSelector } from 'react-redux'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { TitleButton } from 'src/components/buttons'
import { CippActionsOffcanvas } from 'src/components/utilities'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ocVisible, setOCVisible] = useState(false)
  //console.log(row)
  return (
    <>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippActionsOffcanvas
        title="User Information"
        extendedInfo={[
          { label: 'Created on', value: `${row.createdDateTime}` },
          { label: 'UPN', value: `${row.userPrincipalName}` },
          { label: 'Given Name', value: `${row.givenName}` },
          { label: 'Surname', value: `${row.surname}` },
          { label: 'Job Title', value: `${row.jobTitle}` },
          { label: 'Licenses', value: `${row.LicJoined}` },
          { label: 'Business Phone', value: `${row.businessPhones}` },
          { label: 'Mobile Phone', value: `${row.mobilePhone}` },
          { label: 'Mail', value: `${row.mail}` },
          { label: 'City', value: `${row.city}` },
          { label: 'Department', value: `${row.department}` },
          { label: 'OnPrem Last Sync', value: `${row.onPremisesLastSyncDateTime}` },
          { label: 'Unique ID', value: `${row.id}` },
        ]}
        actions={[
          {
            label: 'Restore Object',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecRestoreDeleted?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}`,
            modalMessage: 'Are you sure you want to create a Temporary Access Pass?',
          },
        ]}
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      />
    </>
  )
}

const columns = [
  {
    name: 'Display Name',
    selector: (row) => row['displayName'],
    sortable: true,
    exportSelector: 'displayName',
    minWidth: '300px',
  },
  {
    name: 'Type',
    selector: (row) => row['TargetType'],
    sortable: true,
    exportSelector: 'targetType',
    minWidth: '350px',
  },
  {
    name: 'User Principal Name',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'Deleted on',
    selector: (row) => row['deletedDateTime'],
    sortable: true,
    exportSelector: 'deletedDateTime',
  },
  {
    name: 'AD Synced',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportSelector: 'onPremisesSyncEnabled',
    minWidth: '50px',
    maxWidth: '110px',
  },

  {
    name: 'id',
    selector: (row) => row['id'],
    omit: true,
  },
  {
    name: 'Actions',
    cell: Offcanvas,
  },
]

const Users = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const titleButton = <TitleButton href="/identity/administration/users/add" title="Add User" />
  return (
    <CippPageList
      title="Users"
      titleButton={titleButton}
      datatable={{
        columns,
        path: '/api/ListDeletedItems',
        reportName: `${tenant?.defaultDomainName}-Deleted-Items`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default Users
