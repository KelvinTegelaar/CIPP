import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { CellTip, cellBooleanFormatter } from 'src/components/tables'
import { CippPageList } from 'src/components/layout'
import { Link } from 'react-router-dom'
import { CButton } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { CippActionsOffcanvas } from 'src/components/utilities'

const DevicesList = () => {
  const [tenantColumnSet, setTenantColumn] = useState(true)
  const tenant = useSelector((state) => state.app.currentTenant)
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const tenant = useSelector((state) => state.app.currentTenant)
    const [ocVisible, setOCVisible] = useState(false)
    const editLink = `/identity/administration/groups/edit?groupId=${row.id}&tenantDomain=${tenant.defaultDomainName}`
    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="Group Information"
          extendedInfo={[
            { label: 'Created Date (UTC)', value: `${row.createdDateTime ?? ' '}` },
            { label: 'Display Name', value: `${row.displayName ?? ' '}` },
            { label: 'Unique ID', value: `${row.id ?? ' '}` },
          ]}
          actions={[
            {
              label: 'Disable Device',
              color: 'info',
              modal: true,
              modalUrl: `/api/ExecDeviceDelete?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&Action=Disable`,
              modalMessage: 'Are you sure you want to disable this device.',
            },
            {
              label: 'Delete Device',
              color: 'warning',
              modal: true,
              modalUrl: `/api/ExecGroupsDelete?TenantFilter=${tenant.defaultDomainName}&ID=${row.id}&Action=Enable`,
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
      name: 'Tenant',
      selector: (row) => row['Tenant'],
      sortable: true,
      cell: (row) => CellTip(row['Tenant']),
      exportSelector: 'Tenant',
      omit: tenantColumnSet,
    },
    {
      name: 'Retrieval Status',
      selector: (row) => row['CippStatus'],
      sortable: true,
      cell: (row) => CellTip(row['CippStatus']),
      exportSelector: 'CippStatus',
      omit: tenantColumnSet,
    },
    {
      selector: (row) => row['displayName'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      selector: (row) => row['deviceOwnership'],
      name: 'Device Ownership',
      sortable: true,
      cell: (row) => CellTip(row['deviceOwnership']),
      exportSelector: 'recipientType',
    },
    {
      selector: (row) => row['enrollmentType'],
      name: 'Enrollment Type',
      sortable: true,
      exportSelector: 'enrollmentType',
    },
    {
      selector: (row) => row['manufacturer'],
      name: 'Manufacturer',
      sortable: true,
      exportSelector: 'manufacturer',
    },
    {
      selector: (row) => row['model'],
      name: 'Model',
      sortable: true,
      exportSelector: 'model',
    },
    {
      selector: (row) => row['operatingSystem'],
      name: 'OS',
      sortable: true,
      exportSelector: 'operatingSystem',
    },
    {
      selector: (row) => row['operatingSystemVersion'],
      name: 'Version',
      sortable: true,
      exportSelector: 'operatingSystemVersion',
    },
    {
      selector: (row) => row['profileType'],
      name: 'Profile Type',
      sortable: true,
      exportSelector: 'profileType',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '20px',
    },
  ]
  useEffect(() => {
    if (tenant.defaultDomainName === 'AllTenants') {
      setTenantColumn(false)
    }
    if (tenant.defaultDomainName !== 'AllTenants') {
      setTenantColumn(true)
    }
  }, [tenant.defaultDomainName, tenantColumnSet])
  return (
    <CippPageList
      title="All Devices"
      capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
      datatable={{
        keyField: 'id',
        reportName: `${tenant?.defaultDomainName}-Devices-List`,
        path: '/api/ListGraphRequest',
        params: {
          TenantFilter: tenant?.defaultDomainName,
          Endpoint: 'devices',
          $format: 'application/json',
        },
        columns,
      }}
    />
  )
}

export default DevicesList
