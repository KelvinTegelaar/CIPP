import React, { useState } from 'react'
import { CDropdown, CDropdownItem, CDropdownMenu, CDropdownToggle, CButton } from '@coreui/react'
import { useDispatch, useSelector } from 'react-redux'
import { faPlus, faBars } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { cellBooleanFormatter, CippOffcanvas } from '../../../components/cipp'
import { setModalContent } from 'src/store/features/modal'
import { CSpinner } from '@coreui/react'
import { useLazyGenericGetRequestQuery } from '../../../store/api/app'
import { CippPageList } from '../../../components'
import { TitleButton } from '../../../components/cipp'

const Dropdown = (row, rowIndex, formatExtraData) => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const dispatch = useDispatch()
  const [ExecuteGetRequest, getRequestResult] = useLazyGenericGetRequestQuery()
  const CreateOffCanvas = (row) => {
    console.log(row)
  }
  const id = row.id
  const [ocVisible, setOCVisible] = useState(false)

  return (
    <>
      {console.log(row)}
      <CButton size="sm" color="link" onClick={setOCVisible(true)}>
        <FontAwesomeIcon icon={faBars} />
      </CButton>
      <CippOffcanvas
        title="This is our first off Canvas"
        extendedInfo={[{ label: 'Given Name: ', value: `${row.givenName}` }]}
        actions={[{ label: 'ThisIsAnActionButton', link: 'dothis' }]}
        placement="end"
        isVisible={ocVisible}
        id={row.id}
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
    cell: Dropdown,
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
        tableProps: {
          responsive: false,
        },
      }}
    />
  )
}

export default Users
