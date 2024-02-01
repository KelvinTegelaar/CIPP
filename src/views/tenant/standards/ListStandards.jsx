import React, { useState } from 'react'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { useGenericGetRequestQuery, useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippContentCard, CippPage, CippPageList } from 'src/components/layout'
import { useSelector } from 'react-redux'
import { ModalService } from 'src/components/utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippTable, cellBooleanFormatter } from 'src/components/tables'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'
import { cellTableFormatter } from 'src/components/tables/CellTable'

const ListAppliedStandards = () => {
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
        <CButton size="sm" variant="ghost" color="info" onClick={() => setOCVisible(true)}>
          <FontAwesomeIcon icon={'eye'} href="" />
        </CButton>
        <CButton
          size="sm"
          variant="ghost"
          color="danger"
          onClick={() =>
            handleDeleteIntuneTemplate(
              `api/RemoveStandard?ID=${row.displayName}`,
              'Do you want to delete this standard?',
            )
          }
        >
          <FontAwesomeIcon icon={'trash'} href="" />
        </CButton>
        <CippCodeOffCanvas
          hideButton={true}
          row={row}
          state={ocVisible}
          type="CATemplate"
          hideFunction={() => setOCVisible(false)}
        />
      </>
    )
  }

  const tableColumns = [
    {
      name: 'Tenant',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
      maxWidth: '280px',
    },
    {
      name: 'Excluded from all tenants',
      selector: (row) => row.standards.OverrideAllTenants?.remediate,
      sortable: true,
      cell: cellBooleanFormatter({
        warning: false,
        reverse: false,
        colourless: true,
        noDataIsFalse: true,
      }),
      exportSelector: 'row.standards.OverrideAllTenants.remediate',
    },
    {
      name: 'Standards',
      selector: (row) => row['standards'],
      sortable: true,
      exportSelector: 'standards',
      cell: cellTableFormatter('standards'),
    },
    {
      name: 'Actions',
      cell: Offcanvas,
      maxWidth: '80px',
    },
  ]

  return (
    <CippPage title="Standards" tenantSelector={false}>
      <>
        <CRow>
          <CCol>
            {getResults.isLoading && <CSpinner size="sm" />}
            {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
            <CippPageList
              capabilities={{
                allTenants: true,
                helpContext: 'https://google.com',
              }}
              title="Current Tenant Standards"
              tenantSelector={false}
              datatable={{
                columns: tableColumns,
                reportName: `Standards`,
                path: `api/listStandards`,
              }}
            />
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListAppliedStandards
