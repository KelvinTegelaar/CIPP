import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import React, { useRef } from 'react'
import { ModalService } from 'src/components/utilities/index.js'
import { Form } from 'react-final-form'
import { RFFCFormInput } from 'src/components/forms/index.js'
import { TitleButton } from 'src/components/buttons/index.js'
import { CButton, CCallout, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { CippPageList } from 'src/components/layout/index.js'

/**
 * SettingsLicenses component is used to manage excluded licenses in a settings page.
 *
 * @returns {JSX.Element} The generated settings page component.
 */
export function SettingsLicenses() {
  const [setExclusion, setExclusionResults] = useLazyGenericPostRequestQuery()
  const formRef = useRef(null)

  const handleAddLicense = (selected) => {
    ModalService.confirm({
      body: (
        <div style={{ overflow: 'visible' }}>
          <Form
            onSubmit={setExclusion}
            render={({ handleSubmit, submitting, form, values }) => {
              formRef.current = values
              return (
                <>
                  <div>Add a license to exclude</div>
                  <RFFCFormInput label="GUID" name="GUID" />
                  <RFFCFormInput label="SKU Name" name="SKUName" />
                </>
              )
            }}
          />
        </div>
      ),
      title: 'Add Exclusion',
      onConfirm: () =>
        setExclusion({
          path: '/api/ExecExcludeLicenses?AddExclusion=true',
          values: { ...formRef.current },
        }),
    })
  }

  const titleButton = <TitleButton onClick={handleAddLicense} title="Add Excluded License" />
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const Offcanvas = (row, rowIndex, formatExtraData) => {
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
        <CButton
          size="sm"
          variant="ghost"
          color="danger"
          onClick={() =>
            handleDeleteIntuneTemplate(
              `/api/ExecExcludeLicenses?RemoveExclusion=true&GUID=${row.GUID}`,
              'Do you want to delete this exclusion?',
            )
          }
        >
          <FontAwesomeIcon icon={faTrash} href="" />
        </CButton>
      </>
    )
  }

  const columns = [
    {
      name: 'Display Name',
      selector: (row) => row['Product_Display_Name'],
      exportSelector: 'Product_Display_Name',
      sortable: true,
      minWidth: '300px',
    },
    {
      name: 'License ID',
      selector: (row) => row['GUID'],
      exportSelector: 'GUID',
      sortable: true,
      minWidth: '350px',
    },
    {
      name: 'Actions',
      cell: Offcanvas,
    },
  ]
  return (
    <>
      {setExclusionResults.isFetching ||
        (getResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        ))}
      {setExclusionResults.isSuccess && (
        <CCallout color="info">{setExclusionResults.data?.Results}</CCallout>
      )}
      {setExclusionResults.isError && (
        <CCallout color="danger">
          Could not connect to API: {setExclusionResults.error.message}
        </CCallout>
      )}
      {getResults.isError && (
        <CCallout color="danger">Could not connect to API: {getResults.error.message}</CCallout>
      )}
      {getResults.isSuccess && <CCallout color="info">{getResults.data?.Results}</CCallout>}
      <CippPageList
        capabilities={{ allTenants: true, helpContext: 'https://google.com' }}
        title="Excluded Licenses"
        titleButton={titleButton}
        datatable={{
          columns,
          path: 'api/ExecExcludeLicenses',
          reportName: `ExcludedLicenses`,
          params: { List: true },
        }}
      />
    </>
  )
}
