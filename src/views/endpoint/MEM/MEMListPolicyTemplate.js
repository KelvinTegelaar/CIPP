import React from 'react'
import { useSelector } from 'react-redux'
import CippDatatable from '../../../components/cipp/CippDatatable'
import {
  CCard,
  CCardHeader,
  CCardTitle,
  CCardBody,
  CButton,
  CCallout,
  CSpinner,
} from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { ModalService } from 'src/components'

//todo: expandable with RAWJson property.
/* eslint-disable-next-line react/prop-types */
const ExpandedComponent = ({ data }) => <pre>{data.RAWJson}</pre>

const AutopilotListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const dropdown = (row, index, column) => {
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
            `api/RemoveIntuneTemplate?ID=${row.GUID}`,
            'Do you want to delete the template?',
          )
        }
      >
        <FontAwesomeIcon icon={faTrash} href="" />
      </CButton>
    )
  }

  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['Displayname'],
      sortable: true,
    },
    {
      name: 'Description',
      selector: (row) => row['Description'],
      sortable: true,
    },
    {
      name: 'Type',
      selector: (row) => row['Type'],
      sortable: true,
    },
    {
      name: 'GUID',
      selector: (row) => row['GUID'],
      omit: true,
    },
    {
      name: 'Action',
      cell: dropdown,
    },
  ]

  return (
    <div>
      <hr />
      <CCard className="page-card">
        <CCardHeader>
          <CCardTitle>Available Endpoint Manager Templates</CCardTitle>
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
            tableProps={{
              expandableRows: true,
              expandableRowsComponent: ExpandedComponent,
              expandOnRowClicked: true,
            }}
            keyField="id"
            reportName={`${tenant?.defaultDomainName}-MEMPolicyTemplates-List`}
            path="/api/ListIntuneTemplates"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </div>
  )
}

export default AutopilotListTemplates
