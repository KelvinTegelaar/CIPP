import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from '../../../components'
import { CButton } from '@coreui/react'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippOffcanvas } from 'src/components/cipp'

const Offcanvas = (row, rowIndex, formatExtraData) => {
  const [ocVisible, setOCVisible] = useState(false)
  return (
    <>
      <CButton size="sm" variant="ghost" color="success" onClick={() => setOCVisible(true)}>
        <FontAwesomeIcon icon={faEye} />
      </CButton>
      <CippOffcanvas
        title="Member List"
        placement="end"
        visible={ocVisible}
        id={row.id}
        hideFunction={() => setOCVisible(false)}
      >
        {row.Members ? <p>{row.Members}</p> : <p>Role has no members.</p>}
      </CippOffcanvas>
    </>
  )
}

const columns = [
  {
    selector: (row) => row['DisplayName'],
    name: 'Role Name',
    sortable: true,
    exportSelector: 'DisplayName',
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    wrap: true,
    exportSelector: 'Description',
  },
  {
    selector: (row) => 'View Members',
    name: 'Members',
    cell: Offcanvas,
    exportSelector: 'Members',
  },
]

const RolesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Roles"
      datatable={{
        reportName: `${tenant?.defaultDomainName}-Roles`,
        path: '/api/ListRoles',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default RolesList
