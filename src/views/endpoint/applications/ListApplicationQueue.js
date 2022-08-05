import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CButton, CCallout } from '@coreui/react'
import { faCheck, faExclamationTriangle, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CellTip } from 'src/components/tables'

const RefreshAction = () => {
  const [execStandards, execStandardsResults] = useLazyGenericGetRequestQuery()

  const showModal = () =>
    ModalService.confirm({
      body: (
        <div>
          Deploy all queued applications to tenants?
          <br />
          <i>Please note: This job runs automatically every 12 hours.</i>
        </div>
      ),
      onConfirm: () => execStandards({ path: 'api/AddChocoApp_OrchestrationStarter' }),
    })

  return (
    <>
      {execStandardsResults.data?.Results ===
        'Already running. Please wait for the current instance to finish' && (
        <div> {execStandardsResults.data?.Results}</div>
      )}
      <CButton onClick={showModal} size="sm" className="m-1">
        {execStandardsResults.isLoading && <CSpinner size="sm" />}
        {execStandardsResults.error && (
          <FontAwesomeIcon icon={faExclamationTriangle} className="pe-1" />
        )}
        {execStandardsResults.isSuccess && <FontAwesomeIcon icon={faCheck} className="pe-1" />}
        Deploy now
      </CButton>
    </>
  )
}
const ListApplicationQueue = () => {
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
            `api/RemoveQueuedApp?ID=${row.id}`,
            'Do you want to delete the queued application?',
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
      cell: (row) => CellTip(row['tenantName']),
      exportSelector: 'tenantName',
      minWidth: '200px',
    },
    {
      name: 'Application Name',
      selector: (row) => row['applicationName'],
      sortable: true,
      cell: (row) => CellTip(row['applicationName']),
      exportSelector: 'applicationName',
      minWidth: '200px',
    },
    {
      name: 'Install command',
      selector: (row) => row['cmdLine'],
      sortable: true,
      cell: (row) => CellTip(row['cmdLine']),
      exportSelector: 'cmdLine',
    },
    {
      name: 'Assign To',
      selector: (row) => row['assignTo'],
      sortable: true,
      cell: (row) => CellTip(row['assignTo']),
      exportSelector: 'assignTo',
    },
    {
      name: 'Actions',
      cell: Actions,
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
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Queued Applications"
        tenantSelector={false}
        datatable={{
          tableProps: {
            actions: [<RefreshAction key="refresh-action-button" />],
          },
          keyField: 'id',
          columns,
          reportName: `ApplicationQueue-List`,
          path: '/api/ListApplicationQueue',
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </div>
  )
}

export default ListApplicationQueue
