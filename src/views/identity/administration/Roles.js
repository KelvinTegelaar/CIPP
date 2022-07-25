import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { CButton } from '@coreui/react'
import { faEye } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippOffcanvas } from 'src/components/utilities'
import { CellTip } from 'src/components/tables'

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
        <h5>Role Group Name:</h5> {row.DisplayName}
        <br></br> <br></br>
        <h5>Member Names:</h5> {row.Members ? <p>{row.Members}</p> : <p>Role has no members.</p>}
      </CippOffcanvas>
    </>
  )
}

const columns = [
  {
    selector: (row) => row['DisplayName'],
    name: 'Role Name',
    sortable: true,
    cell: (row) => CellTip(row['DisplayName']),
    exportSelector: 'DisplayName',
    maxWidth: '350px',
  },
  {
    selector: (row) => row['Description'],
    name: 'Description',
    sortable: true,
    cell: (row) => CellTip(row['Description'], true),
    wrap: true,
    exportSelector: 'Description',
  },
  {
    selector: (row) => 'View Members',
    name: 'Members',
    cell: Offcanvas,
    exportSelector: 'Members',
    maxWidth: '80px',
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
