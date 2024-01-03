import React, { useState } from 'react'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { useGenericGetRequestQuery, useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { CippContentCard, CippPage } from 'src/components/layout'
import { useSelector } from 'react-redux'
import { ModalService } from 'src/components/utilities'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { CippTable } from 'src/components/tables'
import CippCodeOffCanvas from 'src/components/utilities/CippCodeOffcanvas'

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

  const { data: listStandardsAllTenants = [] } = useGenericGetRequestQuery({
    path: 'api/listStandards',
  })
  const tableColumns = [
    {
      name: 'Tenant',
      selector: (row) => row['displayName'],
      sortable: true,
      exportSelector: 'displayName',
      maxWidth: '280px',
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
            {listStandardsAllTenants && (
              <CippContentCard title="Currently Applied Standards">
                {getResults.isLoading && <CSpinner size="sm" />}
                {getResults.isSuccess && (
                  <CCallout color="info">{getResults.data?.Results}</CCallout>
                )}
                <CippTable
                  reportName={`Standards`}
                  data={listStandardsAllTenants}
                  columns={tableColumns}
                />
              </CippContentCard>
            )}
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListAppliedStandards
