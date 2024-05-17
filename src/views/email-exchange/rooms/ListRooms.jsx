import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const Rooms = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  /* const Actions = (row, rowIndex, formatExtraData) => (
    <>
      <Link
        to={`/rooms/management/list-rooms?tenantDomain=${tenant.defaultDomainName}`}
      >
        <CButton size="sm" variant="ghost" color="success">
          <FontAwesomeIcon icon={faEye} />
        </CButton>
      </Link>
    </>
  )*/

  const columns = [
    {
      name: 'Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      name: 'Building',
      selector: (row) => row['building'],
      sortable: true,
      exportSelector: 'building',
      maxWidth: '200px',
    },
    {
      name: 'Floor',
      selector: (row) => row['floorNumber'],
      sortable: true,
      cell: (row) => CellTip(row['floorNumber']),
      exportSelector: 'floorNumber',
      maxWidth: '100px',
    },
    {
      name: 'Capacity',
      selector: (row) => row['capacity'],
      sortable: true,
      cell: (row) => CellTip(row['capacity']),
      exportSelector: 'capacity',
      maxWidth: '100px',
    },
    {
      name: 'bookingType',
      selector: (row) => row['bookingType'],
      sortable: true,
      cell: (row) => CellTip(row['bookingType']),
      exportSelector: 'bookingType',
      maxWidth: '200px',
    },
    /*{
      name: 'Address',
      selector: (row) => row['address'],
      sortable: true,
      cell: (row) => CellTip(row['address']),
      exportSelector: 'address',
    maxWidth: '100px',
    },*/
    /*{
      name: 'Actions',
      cell: Actions,
      maxWidth: '80px',
    },*/
  ]

  return (
    <CippPageList
      title="Rooms"
      datatable={{
        columns,
        path: '/api/ListRooms',
        reportName: `${tenant?.defaultDomainName}-Rooms`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default Rooms
