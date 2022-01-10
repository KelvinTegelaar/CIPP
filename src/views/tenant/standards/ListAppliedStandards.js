import React from 'react'
import { useSelector } from 'react-redux'
import { CButton, CSpinner } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippPageList, ModalService } from 'src/components'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const TenantsList = () => {
  const Actions = (row, index, column) => {
    const [ExecuteGetRequest, GetRequestResult] = useLazyGenericGetRequestQuery()
    const handleDeleteConfirm = (apiurl) => {
      ExecuteGetRequest({ url: apiurl })
      //this isnt working all the way yet.
      ModalService.confirm({
        title: 'Results',
        body: (
          <div>
            {GetRequestResult.isSuccess && (
              <>
                <CSpinner />
              </>
            )}
            {GetRequestResult.isSuccess && GetRequestResult.data.Results}
          </div>
        ),
        confirmLabel: 'Continue',
      })
    }
    const handleDelete = (apiurl, message) => {
      ModalService.confirm({
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => handleDeleteConfirm(apiurl),
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
          handleDelete(
            `api/RemoveStandard?ID=${row.displayName}`,
            `Are you sure you want to remove the standard for ${row.displayName}. Note that this does not revert the effects of the standard.`,
          )
        }
      >
        <FontAwesomeIcon icon={faTrash} />
      </CButton>
    )
  }
  const columns = [
    {
      name: 'Tenant Name',
      selector: (row) => row['displayName'],
      sortable: true,
    },
    {
      name: 'Standard',
      selector: (row) => row['standardName'],
      sortable: true,
    },
    {
      name: 'Applied By',
      selector: (row) => row['appliedBy'],
      sortable: true,
    },
    {
      name: 'Action',
      cell: Actions,
    },
  ]
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
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
  )
}

export default TenantsList
