import React, { useState } from 'react'
import { CButton } from '@coreui/react'
import { useSelector } from 'react-redux'
import { faPlus, faEdit, faTrash, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter } from '../../../components/cipp'
import { CippPageList } from '../../../components'
import { TitleButton } from '../../../components/cipp'
import CippGroupedOffcanvas from 'src/components/cipp/CippGroupedOffcanvas'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)
  return (
    <>
      <CButton size="sm" variant="ghost" color="warning">
        <FontAwesomeIcon icon={faEdit} href="" />
      </CButton>
      <CButton size="sm" variant="ghost" color="danger">
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
      <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEllipsisV} />
      </CButton>
      <CippGroupedOffcanvas
        title="This is our first off Canvas"
        extendedInfo={[
          { label: 'Given Name: ', value: `${row.givenName}` },
          { label: 'Surname:', value: `${row.surname}` },
        ]}
        actions={[{ label: 'ThisIsAnActionButton', link: 'dothis', color: 'primary' }]}
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
  },
  {
    name: 'Email',
    selector: (row) => row['mail'],
    sortable: true,
    exportSelector: 'mail',
  },
  {
    name: 'User Type',
    selector: (row) => row['userType'],
    sortable: true,
    exportSelector: 'userType',
    minWidth: '75px',
  },
  {
    name: 'Enabled',
    selector: (row) => row['accountEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportSelector: 'accountEnabled',
    maxWidth: '100px',
  },
  {
    name: 'On Premise Sync',
    selector: (row) => row['onPremisesSyncEnabled'],
    cell: cellBooleanFormatter(),
    sortable: true,
    exportSelector: 'onPremisesSyncEnabled',
    maxWidth: '150px',
  },
  {
    name: 'Licenses',
    selector: (row) => row['LicJoined'],
    exportSelector: 'LicJoined',
    grow: 2,
  },
  {
    name: 'id',
    selector: (row) => row['id'],
    omit: true,
  },
  {
    name: 'Action',
    button: true,
    cell: Offcanvas,
  },
]

const Users = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const titleButton = (
    <TitleButton href="/identity/administration/users/add" title="Add User" icon={faPlus} />
  )
  return (
    <CippPageList
      title="Users"
      titleButton={titleButton}
      datatable={{
        columns,
        path: '/api/ListUsers',
        reportName: `${tenant?.defaultDomainName}-Users`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default Users
