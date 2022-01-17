import React from 'react'
import { useSelector } from 'react-redux'
import { CippDatatable } from 'src/components/tables'
import { CCardBody, CButton, CCallout, CSpinner } from '@coreui/react'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippPage } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'

//todo: expandable with RAWJson property.
/* eslint-disable-next-line react/prop-types */
const ExpandedComponent = ({ data }) => <pre>{data.RAWJson}</pre>

const AutopilotListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const Actions = (row, index, column) => {
    const handleDeleteIntuneTemplate = (apiurl, message) => {
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
          handleDeleteIntuneTemplate(
            `/api/RemoveIntuneTemplate?ID=${row.GUID}`,
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
      exportSelector: 'Displayname',
    },
    {
      name: 'Description',
      selector: (row) => row['Description'],
      sortable: true,
      exportSelector: 'Description',
    },
    {
      name: 'Type',
      selector: (row) => row['Type'],
      sortable: true,
      exportSelector: 'Type',
    },
    {
      name: 'GUID',
      selector: (row) => row['GUID'],
      omit: true,
      exportSelector: 'GUID',
    },
    {
      name: 'Actions',
      cell: Actions,
    },
  ]

  return (
    <CippPage title="Available Endpoint Manager Templates" tenantSelector={false}>
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
    </CippPage>
  )
}

export default AutopilotListTemplates
