import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import useQuery from 'src/hooks/useQuery'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CellTip, cellDateFormatter } from 'src/components/tables'
import { faEye, faEdit, faEllipsisV, faMobileAlt } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'
import { Link } from 'react-router-dom'
import { CButton } from '@coreui/react'

//TODO: Add CellBoolean

const MobileDeviceList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Device Information"
          extendedInfo={[
            {
              label: 'User',
              value: userId,
            },
            {
              label: 'Access State',
              value: row.deviceAccessState,
            },
            {
              label: 'Model',
              value: row.deviceModel,
            },
            {
              label: 'Device Type',
              value: row.deviceType,
            },
            {
              label: 'Device ID',
              value: row.deviceID,
            },
          ]}
          actions={[
            {
              label: 'Allow Device',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecMailboxMobileDevices?TenantFilter=${tenant.defaultDomainName}&DeviceID=${row.deviceID}&UserID=${userId}&quarantine=false`,
              modalMessage: 'Are you sure you want to allow the device?',
            },
            {
              label: 'Block Device',
              color: 'warning',
              modal: true,
              modalUrl: `/api/ExecMailboxMobileDevices?TenantFilter=${tenant.defaultDomainName}&DeviceID=${row.deviceID}&UserID=${userId}&quarantine=true`,
              modalMessage: 'Are you sure you want to block the device?',
            },
            {
              label: 'Delete active sync device ',
              color: 'warning',
              modal: true,
              modalUrl: `/api/ExecMailboxMobileDevices?TenantFilter=${tenant.defaultDomainName}&UserID=${userId}&Guid=${row.Guid}&delete=true`,
              modalMessage: 'Are you sure you want to delete this device.',
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
      selector: (row) => query.get('userId'),
      name: 'User ID',
      sortable: true,
      cell: (row) => CellTip(query.get('userId')),
      exportSelector: 'userId',
    },
    {
      selector: (row) => row['clientType'],
      name: 'Client Type',
      sortable: true,
      cell: (row) => CellTip(row['clientType']),
      exportSelector: 'clientType',
    },
    {
      selector: (row) => row['clientVersion'],
      name: 'Client Version',
      sortable: true,
      exportSelector: 'clientVersion',
    },
    {
      selector: (row) => row['deviceAccessState'],
      name: 'Access State',
      sortable: true,
      exportSelector: 'deviceAccessState',
    },
    {
      selector: (row) => row['deviceFriendlyName'],
      name: 'Friendly Name',
      sortable: true,
      cell: (row) => CellTip(row['deviceFriendlyName']),
      exportSelector: 'deviceFriendlyName',
    },
    {
      selector: (row) => row['deviceModel'],
      name: 'Model',
      sortable: true,
      cell: (row) => CellTip(row['deviceModel']),
      exportSelector: 'deviceModel',
    },
    {
      selector: (row) => row['deviceOS'],
      name: 'OS',
      sortable: true,
      cell: (row) => CellTip(row['deviceOS']),
      exportSelector: 'deviceOS',
    },
    {
      selector: (row) => row['deviceType'],
      name: 'Device Type',
      sortable: true,
      cell: (row) => CellTip(row['deviceType']),
      exportSelector: 'deviceType',
    },
    {
      selector: (row) => row['deviceID'],
      name: 'Device ID',
      sortable: true,
      cell: (row) => CellTip(row['deviceID']),
      exportSelector: 'deviceID',
    },
    {
      selector: (row) => row['firstSync'],
      name: 'First Sync',
      sortable: true,
      exportSelector: 'firstSync',
      cell: cellDateFormatter(),
    },
    {
      selector: (row) => row['lastSyncAttempt'],
      name: 'Last Sync Attempt',
      sortable: true,
      exportSelector: 'lastSyncAttempt',
      cell: cellDateFormatter(),
    },
    {
      selector: (row) => row['lastSuccessSync'],
      name: 'Last Succesfull Sync',
      sortable: true,
      exportSelector: 'lastSuccessSync',
      cell: cellDateFormatter(),
    },
    {
      selector: (row) => row['status'],
      name: 'Status',
      sortable: true,
      exportSelector: 'status',
    },
    {
      selector: (row) => row['Guid'],
      name: 'Guid',
      sortable: true,
      exportSelector: 'Guid',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '75px',
    },
  ]

  let query = useQuery()
  const userId = query.get('userId')
  return (
    <CippPageList
      tenantSelector={false}
      title="Mobile Devices"
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-MobileDevices-List`,
        path: '/api/ListMailboxMobileDevices',
        columns,
        params: { TenantFilter: tenant?.defaultDomainName, mailbox: userId },
        selectableRows: true,
      }}
    />
  )
}
export default MobileDeviceList
