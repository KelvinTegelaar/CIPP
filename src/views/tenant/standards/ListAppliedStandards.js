import React from 'react'
import { useSelector } from 'react-redux'
import { CSpinner, CButton, CCallout } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const TenantsList = () => {
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
            `api/RemoveStandard?ID=${row.displayName}`,
            'Do you want to delete the standard?',
          )
        }
      >
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    )
  }
  const columns = [
    {
      name: 'Tenant Name',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'Standard',
      selector: (row) => row['standardName'],
      sortable: true,
      exportSelector: 'standardName',
    },
    {
      name: 'Applied By',
      selector: (row) => row['appliedBy'],
      sortable: true,
      exportSelector: 'appliedBy',
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
        title="Applied Standards"
        tenantSelector={false}
        datatable={{
          keyField: 'id',
          columns,
          reportName: `${tenant?.defaultDomainName}-AppliedStandards-List`,
          path: '/api/ListStandards',
          params: { TenantFilter: tenant?.defaultDomainName },
        }}
      />
    </div>
  )
}

export default TenantsList
