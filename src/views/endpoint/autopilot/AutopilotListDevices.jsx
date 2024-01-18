import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CButton, CCallout, CSpinner } from '@coreui/react'
import {
  faArrowCircleDown,
  faEllipsisV,
  faSyncAlt,
  faTrash,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { CippActionsOffcanvas, ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CellTip } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'

const AutopilotListDevices = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const [ocVisible, setOCVisible] = useState(false)

  const Actions = (row, index, column) => {
    return (
      <>
        <CButton size="sm" color="link" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEllipsisV} />
        </CButton>
        <CippActionsOffcanvas
          title="User Information"
          extendedInfo={[
            {
              label: 'Assigned User',
              value: `${row.userPrincipalName ?? ' '}`,
            },
            { label: 'Windows PKID', value: `${row.productKey ?? ' '}` },
            { label: 'Serial', value: `${row.serialNumber ?? ' '}` },
            { label: 'Model', value: `${row.model ?? ' '}` },
            { label: 'Manufacturer', value: `${row.manufacturer ?? ' '}` },
          ]}
          actions={[
            {
              label: 'Assign device',
              color: 'info',
              modal: true,
              modalType: 'POST',
              modalBody: {
                username: row.userPrincipalName,
                userid: row.id,
                TenantFilter: tenant.defaultDomainName,
                message: row.message,
                Device: row.id,
              },
              modalUrl: `/api/ExecAssignAPDevice`,
              modalDropdown: {
                url: `/api/listUsers?TenantFilter=${tenant.defaultDomainName}`,
                labelField: 'userPrincipalName',
                valueField: 'id',
                addedField: {
                  userPrincipalName: 'userPrincipalName',
                  addressableUserName: 'displayName',
                  groupName: 'displayName',
                },
              },
              modalMessage: 'Select the user to assign',
            },
            {
              label: 'Delete Device',
              color: 'danger',
              modal: true,
              modalUrl: `/api/RemoveAPDevice?ID=${row.id}&tenantFilter=${tenant.defaultDomainName}`,
              modalMessage: 'Are you sure you want to delete this device?',
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
      selector: (row) => row['displayName'],
      name: 'Display Name',
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'displayName',
    },
    {
      selector: (row) => row['serialNumber'],
      name: 'Serial',
      sortable: true,
      cell: (row) => CellTip(row['serialNumber']),
      exportSelector: 'serialNumber',
    },
    {
      selector: (row) => row['model'],
      name: 'Model',
      sortable: true,
      cell: (row) => CellTip(row['model']),
      exportSelector: 'model',
    },
    {
      selector: (row) => row['manufacturer'],
      name: 'Manufacturer',
      sortable: true,
      cell: (row) => CellTip(row['manufacturer']),
      exportSelector: 'manufacturer',
    },
    {
      selector: (row) => row['groupTag'],
      name: 'Group Tag',
      sortable: true,
      cell: (row) => CellTip(row['groupTag']),
      exportSelector: 'groupTag',
    },
    {
      selector: (row) => row['enrollmentState'],
      name: 'Enrollment',
      sortable: true,
      cell: (row) => CellTip(row['enrollmentState']),
      exportSelector: 'enrollmentState',
    },
    {
      name: (row) => row['Actions'],
      cell: Actions,
    },
  ]

  return (
    <>
      {getResults.isFetching && (
        <CCallout color="info">
          <CSpinner>Loading</CSpinner>
        </CCallout>
      )}
      {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}
      <CippPageList
        title="Autopilot Devices"
        titleButton={
          <div style={{ display: 'flex', alignItems: 'right' }}>
            <TitleButton href={`/endpoint/autopilot/add-device`} title="Deploy Autopilot Device" />
            <div style={{ marginLeft: '10px' }}>
              <TitleButton
                icon={faSyncAlt}
                onClick={() =>
                  ExecuteGetRequest({
                    path: `/api/ExecSyncAPDevices?tenantFilter=${tenant.defaultDomainName}`,
                  })
                }
                title="Sync Devices"
              />
            </div>
          </div>
        }
        datatable={{
          keyField: 'id',
          reportName: `${tenant?.defaultDomainName}-AutopilotDevices-List`,
          path: `/api/ListAPDevices`,
          columns,
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </>
  )
}

export default AutopilotListDevices
