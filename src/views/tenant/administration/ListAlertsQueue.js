import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CButton, CCallout } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const ListAlertsQueue = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const Actions = (row, index, column) => {
    const handleDeleteStandard = (apiurl, message) => {
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
          handleDeleteStandard(
            `api/RemoveQueuedAlert?ID=${row.tenant}`,
            'Do you want to delete the queued alert?',
          )
        }
      >
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    )
  }
  const columns = [
    {
      name: 'Tenant',
      selector: (row) => row['tenantName'],
      sortable: true,
      exportSelector: 'tenantName',
      grow: 0,
    },
    {
      name: 'Alerts',
      selector: (row) => row['alerts'],
      sortable: true,
      exportSelector: 'alerts',
      grow: 1,
    },
    {
      name: 'Actions',
      cell: Actions,
      grow: 0,
    },
  ]
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
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
        title="Scheduled Alerts"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `AlertsQueue-List`,
          path: '/api/ListAlertsQueue',
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </div>
  )
}

export default ListAlertsQueue
