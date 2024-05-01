import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { CellTip } from 'src/components/tables'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { faEye, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippPageList } from 'src/components/layout'
import { ModalService } from 'src/components/utilities'
import { TitleButton } from 'src/components/buttons'
import { Editor } from '@monaco-editor/react'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'

const ConnectorListTemplates = () => {
  const tenant = useSelector((state) => state.app.currentTenant)
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const [ocVisible, setOCVisible] = useState(false)
    const handleDeleteEXConnectorTemplate = (apiurl, message) => {
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
            handleDeleteEXConnectorTemplate(
              `/api/RemoveExConnectorTemplate?ID=${row.GUID}`,
              'Do you want to delete the template?',
            )
          }
        >
          <FontAwesomeIcon icon={faTrash} href="" />
        </CButton>

        <CippCodeOffCanvas
          row={row}
          state={ocVisible}
          type="ExConnectorTemplate"
          hideFunction={() => setOCVisible(false)}
        />
      </>
    )
  }

  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['name'],
      sortable: true,
      cell: (row) => CellTip(row['name']),
      exportSelector: 'name',
    },
    {
      name: 'Type',
      selector: (row) => row['cippconnectortype'],
      sortable: true,
      cell: (row) => CellTip(row['cippconnectortype']),
      exportSelector: 'cippconnectortype',
    },
    {
      name: 'GUID',
      selector: (row) => row['GUID'],
      sortable: true,
      cell: (row) => CellTip(row['GUID']),
      exportSelector: 'GUID',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
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
        title="Exchange Connector Templates"
        titleButton={
          <TitleButton href="/email/connectors/add-connector-templates" title="Add Template" />
        }
        datatable={{
          reportName: `${tenant?.defaultDomainName}-Groups`,
          path: '/api/ListExconnectorTemplates',
          params: { TenantFilter: tenant?.defaultDomainName },
          columns,
        }}
      />
    </>
  )
}

export default ConnectorListTemplates
