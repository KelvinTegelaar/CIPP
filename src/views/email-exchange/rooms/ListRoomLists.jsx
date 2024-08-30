import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faEye, faEdit } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Link } from 'react-router-dom'
import { CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables'

const RoomLists = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  /* const Actions = (row, rowIndex, formatExtraData) => (
    <>
      <Link
        to={`/resources/management/list-rooms?tenantDomain=${tenant.defaultDomainName}`}
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
      maxWidth: '500px',
    },
    {
      name: 'Coordinates',
      selector: (row) => row['geoCoordinates'],
      sortable: true,
      exportSelector: 'geoCoordinates',
      maxWidth: '200px',
    },
    {
      name: 'PlaceId',
      selector: (row) => row['placeId'],
      sortable: true,
      cell: (row) => CellTip(row['placeId']),
      exportSelector: 'placeId',
      maxWidth: '300px',
    },
    /*{
      name: 'Address',
      selector: (row) => row['address'],
      sortable: true,
      cell: (row) => CellTip(row['address']),
      exportSelector: 'address',
      maxWidth: '200px',
    },*/
    /*{
      name: 'Actions',
      cell: Actions,
      maxWidth: '80px',
    },*/
  ]

  return (
    <CippPageList
      title="Room Lists"
      datatable={{
        columns,
        path: '/api/ListRoomLists',
        reportName: `${tenant?.defaultDomainName}-RoomLists`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default RoomLists
