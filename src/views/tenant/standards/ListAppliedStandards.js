import React from 'react'
import { useSelector } from 'react-redux'
import { CippDatatable } from '../../../components/cipp'
import {
  CCard,
  CCardBody,
  CCardTitle,
  CCardHeader,
  CSpinner,
  CButton,
  CCallout,
} from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ModalService } from '../../../components'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'

const TenantsList = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const Dropdown = (row, index, column) => {
    const handleDropdownEvent = (apiurl, message) => {
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
          handleDropdownEvent(
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
      cell: Dropdown,
    },
  ]
  const tenant = useSelector((state) => state.app.currentTenant)

  return (
    <div>
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle className="text-primary">Applied Standards</CCardTitle>
        </CCardHeader>
        <CCardBody>
          {getResults.isFetching && (
            <CCallout color="info">
              <CSpinner>Loading</CSpinner>
            </CCallout>
          )}
          {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
          {getResults.isError && (
            <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
          )}
          <CippDatatable
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-AppliedStandards-List`}
            path="/api/ListStandards"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default TenantsList
