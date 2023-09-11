import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CippCodeBlock, CippOffcanvas } from 'src/components/utilities'
import { CellTip, CippDatatable } from 'src/components/tables'
import {
  CCardBody,
  CButton,
  CCallout,
  CSpinner,
  CCardHeader,
  CCardTitle,
  CCard,
} from '@coreui/react'
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippPage } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'

//todo: expandable with RAWJson property.

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
              `/api/RemoveIntuneTemplate?ID=${row.GUID}`,
              'Do you want to delete the template?',
            )
          }
        >
          <FontAwesomeIcon icon={faTrash} href="" />
        </CButton>
        <CippCodeOffCanvas
          row={row}
          state={ocVisible}
          type="IntuneTemplate"
          hideFunction={() => setOCVisible(false)}
        />
      </>
    )
  }

  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['displayName'],
      sortable: true,
      cell: (row) => CellTip(row['displayName']),
      exportSelector: 'Displayname',
      minWidth: '400px',
      maxWidth: '400px',
    },
    {
      name: 'Description',
      selector: (row) => row['description'],
      sortable: true,
      cell: (row) => CellTip(row['description']),
      exportSelector: 'Description',
      minWidth: '400px',
      maxWidth: '400px',
    },
    {
      name: 'Type',
      selector: (row) => row['Type'],
      sortable: true,
      exportSelector: 'Type',
      maxWidth: '100px',
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
      maxWidth: '100px',
    },
  ]

  return (
    <CippPage title="Available Endpoint Manager Templates" tenantSelector={false}>
      <CCard className="content-card">
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <CCardTitle>Endpoint Manager Templates</CCardTitle>
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
            reportName={`${tenant?.defaultDomainName}-MEMPolicyTemplates-List`}
            path="/api/ListIntuneTemplates?View=true"
            columns={columns}
            params={{ TenantFilter: tenant?.defaultDomainName }}
          />
        </CCardBody>
      </CCard>
    </CippPage>
  )
}

export default AutopilotListTemplates
