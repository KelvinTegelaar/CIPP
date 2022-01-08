import React from 'react'
import { useSelector } from 'react-redux'
import { CButton } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components'

const dropdown = (row, rowIndex, formatExtraData) => {
  return (
    <>
      <CButton size="sm" variant="ghost" color="danger">
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    </>
  )
}

const columns = [
  {
    selector: 'displayName',
    name: 'Display Name',
    sortable: true,
  },
  {
    selector: 'serialNumber',
    name: 'Serial',
    sortable: true,
  },
  {
    selector: 'model',
    name: 'Model',
    sortable: true,
  },
  {
    selector: 'manufacturer',
    name: 'Manufacturer',
    sortable: true,
  },
  {
    selector: 'groupTag',
    name: 'Group Tag',
    sortable: true,
  },
  {
    selector: 'enrollmentState',
    name: 'Enrollment',
    sortable: true,
  },
  {
    name: 'Actions',
    cell: dropdown,
  },
]

const AutopilotListDevices = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Autopilot Devices"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-AutopilotDevices-List`,
        path: `/api/ListAPDevices`,
        columns,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default AutopilotListDevices
