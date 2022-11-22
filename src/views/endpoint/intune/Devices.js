import { CButton } from '@coreui/react'
import { faEllipsisV } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippPageList } from 'src/components/layout'
import { cellBooleanFormatter, cellDateFormatter, CellTip } from 'src/components/tables'
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
        title="Device Information"
        extendedInfo={[
          { label: 'Device Name', value: `${row.deviceName ?? ' '}` },
          { label: 'UPN', value: `${row.userPrincipalName ?? ' '}` },
        ]}
        actions={[
          {
            label: 'Sync Device',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=syncDevice`,
            modalMessage: 'Are you sure you want to Sync this device data?',
          },
          {
            label: 'Reboot Device',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=rebootNow`,
            modalMessage: 'Are you sure you want to reboot this device?',
          },
          {
            label: 'Locate Device',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=locateDevice`,
            modalMessage: 'Are you sure you want to locate this device?',
          },
          {
            label: 'Windows Defender Full Scan',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: { quickScan: false },
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=WindowsDefenderScan`,
            modalMessage: 'Are you sure you want to perform a scan on this device?',
          },
          {
            label: 'Windows Defender Quick Scan',
            color: 'info',
            modal: true,
            modalType: 'POST',
            modalBody: { quickScan: true },
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=WindowsDefenderScan`,
            modalMessage: 'Are you sure you want to perform a quick scan on this device?',
          },
          {
            label: 'Update Windows Defender',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=windowsDefenderUpdateSignatures`,
            modalMessage:
              'Are you sure you want to update the Windows Defender signatures for this device?',
          },
          {
            label: 'Generate logs and ship to MEM',
            color: 'info',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=CreateDeviceLogCollectionRequest`,
            modalMessage: 'Are you sure you want to generate logs and ship these to MEM?',
          },
          {
            label: 'Fresh Start (Remove user data)',
            color: 'danger',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=cleanWindowsDevice`,
            modalType: 'POST',
            modalBody: { keepUserData: false },
            modalMessage: 'Are you sure you want to Fresh Start this device?',
          },
          {
            label: 'Fresh Start (Do not remove user data)',
            color: 'danger',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=cleanWindowsDevice`,
            modalType: 'POST',
            modalBody: { keepUserData: true },
            modalMessage: 'Are you sure you want to Fresh Start this device?',
          },
          {
            label: 'Wipe Device, keep enrollment data',
            color: 'danger',
            modal: true,
            modalType: 'POST',
            modalBody: { keepUserData: 'false', keepEnrollmentData: 'true' },
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=cleanWindowsDevice`,
            modalMessage: 'Are you sure you want to wipe this device',
          },
          {
            label: 'Wipe Device and continue at powerloss',
            color: 'danger',
            modal: true,
            modalType: 'POST',
            modalBody: { keepEnrollmentData: false, keepUserData: false, useProtectedWipe: true },
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=cleanWindowsDevice`,
            modalMessage: 'Are you sure you want to wipe this device',
          },
          {
            label: 'Autopilot Reset',
            color: 'danger',
            modal: true,
            modalType: 'POST',
            modalBody: { keepUserData: 'false', keepEnrollmentData: 'true' },
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=wipe`,
            modalMessage: 'Are you sure you want to wipe this device',
          },
          {
            label: 'Retire device',
            color: 'danger',
            modal: true,
            modalUrl: `/api/ExecDeviceAction?TenantFilter=${tenant.defaultDomainName}&GUID=${row.id}&Action=retire`,
            modalMessage: 'Are you sure you want to retire this device?',
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
    name: 'Name',
    selector: (row) => row['deviceName'],
    sortable: true,
    cell: (row) => CellTip(row['deviceName']),
    exportSelector: 'deviceName',
  },
  {
    name: 'Used by',
    selector: (row) => row['userPrincipalName'],
    sortable: true,
    cell: (row) => CellTip(row['userPrincipalName']),
    exportSelector: 'userPrincipalName',
  },
  {
    name: 'complianceState',
    selector: (row) => row['complianceState'],
    sortable: true,
    cell: cellBooleanFormatter(),
    exportSelector: 'complianceState',
  },
  {
    name: 'Manufacturer',
    selector: (row) => row['manufacturer'],
    sortable: true,
    cell: (row) => CellTip(row['manufacturer']),
    exportSelector: 'manufacturer',
  },
  {
    name: 'Model',
    selector: (row) => row['model'],
    sortable: true,
    cell: (row) => CellTip(row['model']),
    exportSelector: 'model',
  },
  {
    name: 'Operating System',
    selector: (row) => row['operatingSystem'],
    sortable: true,
    exportSelector: 'operatingSystem',
  },
  {
    name: 'Operating System Version',
    selector: (row) => row['osVersion'],
    sortable: true,
    exportSelector: 'osVersion',
  },
  {
    name: 'Enrolled on',
    selector: (row) => row['enrolledDateTime'],
    sortable: true,
    cell: cellDateFormatter({ format: 'short', showTime: false }),
    exportSelector: 'enrolledDateTime',
  },

  {
    name: 'Ownership',
    selector: (row) => row['managedDeviceOwnerType'],
    sortable: true,
    exportSelector: 'managedDeviceOwnerType',
  },
  {
    name: 'Enrollment Type',
    selector: (row) => row['deviceEnrollmentType'],
    sortable: true,
    exportSelector: 'deviceEnrollmentType',
    cell: (row) => CellTip(row['deviceEnrollmentType']),
  },
  {
    name: 'Management Type',
    selector: (row) => row['joinType'],
    sortable: true,
    exportSelector: 'joinType',
  },
  {
    name: 'Actions',
    cell: Offcanvas,
  },
]

const DevicesList = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <CippPageList
      title="Devices"
      datatable={{
        columns,
        path: '/api/ListDevices',
        reportName: `${tenant?.defaultDomainName}-Device-List`,
        params: { TenantFilter: tenant?.defaultDomainName },
      }}
    />
  )
}

export default DevicesList
