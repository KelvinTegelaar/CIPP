import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippCodeBlock, CippOffcanvas } from 'src/components/utilities'
import { CippDatatable } from 'src/components/tables'
import { CCardBody, CButton, CCallout, CSpinner } from '@coreui/react'
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippPage } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'

//todo: expandable with RAWJson property.
/* eslint-disable-next-line react/prop-types */

const AutopilotListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)

  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
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
      <>
        <CButton size="sm" color="success" variant="ghost" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={faEye} />
        </CButton>
        <CButton
          size="sm"
          variant="ghost"
          color="danger"
          onClick={() =>
            handleDeleteIntuneTemplate(
              `/api/RemoveCATemplate?ID=${row.GUID}`,
              'Do you want to delete the template?',
            )
          }
        >
          <FontAwesomeIcon icon={faTrash} href="" />
        </CButton>
        <CippOffcanvas
          title="Template JSON"
          placement="end"
          visible={ocVisible}
          id={row.id}
          hideFunction={() => setOCVisible(false)}
        >
          <CippCodeBlock language="json" code={JSON.stringify(row, null, 2)} />
        </CippOffcanvas>
      </>
    )
  }

  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
    },
    {
      name: 'GUID',
      selector: (row) => row['GUID'],
      omit: true,
      exportSelector: 'GUID',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
    },
  ]

  return (
    <CippPage title="Available Conditional Access Templates" tenantSelector={false}>
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
          reportName={`${tenant?.defaultDomainName}-CaTemplates-List`}
          path="/api/ListCATemplates"
          columns={columns}
          params={{ TenantFilter: tenant?.defaultDomainName }}
        />
      </CCardBody>
    </CippPage>
  )
}

export default AutopilotListTemplates
