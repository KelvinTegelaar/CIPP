import React from 'react'
import { useSelector } from 'react-redux'
import { CButton, CCallout, CSpinner } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const AutopilotListDevices = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const Actions = (row, index, column) => {
    const handleDeleteAPDevice = (apiurl, message) => {
      ModalService.confirm({
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => ExecuteGetRequest({ path: apiurl }),
        confirmLabel: 'Continue',
        cancelLabel: 'Cancel',
      })
    }
    return (
      <CButton
        size="sm"
        variant="ghost"
        color="danger"
        onClick={() =>
          handleDeleteAPDevice(
            `api/RemoveAPDevice?ID=${row.id}&tenantFilter=${tenant.defaultDomainName}`,
            'Do you want to delete the Autopilot Device?',
          )
        }
      >
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    )
  }

  const columns = [
    {
      selector: (row) => row['displayName'],
      name: 'Display Name',
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      selector: (row) => row['serialNumber'],
      name: 'Serial',
      sortable: true,
      exportSelector: 'serialNumber',
    },
    {
      selector: (row) => row['model'],
      name: 'Model',
      sortable: true,
      exportSelector: 'model',
    },
    {
      selector: (row) => row['manufacturer'],
      name: 'Manufacturer',
      sortable: true,
      exportSelector: 'manufacturer',
    },
    {
      selector: (row) => row['groupTag'],
      name: 'Group Tag',
      sortable: true,
      exportSelector: 'groupTag',
    },
    {
      selector: (row) => row['enrollmentState'],
      name: 'Enrollment',
      sortable: true,
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
