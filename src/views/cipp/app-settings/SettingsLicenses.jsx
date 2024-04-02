import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import React, { useRef } from 'react'
import { ModalService } from 'src/components/utilities/index.js'
import { Form } from 'react-final-form'
import { RFFCFormInput } from 'src/components/forms/index.js'
import { TitleButton } from 'src/components/buttons/index.js'
import { CButton, CCallout, CSpinner } from '@coreui/react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { CippCallout, CippPageList } from 'src/components/layout/index.js'

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
  const [executeGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const Offcanvas = (row, rowIndex, formatExtraData) => {
    const handleDeleteIntuneTemplate = (apiurl, message) => {
      ModalService.confirm({
        title: 'Confirm',
        body: <div>{message}</div>,
        onConfirm: () => executeGetRequest({ path: apiurl }),
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
          <CippCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CippCallout>
        ))}
      {setExclusionResults.isSuccess && !setExclusionResults.isFetching && (
        <CippCallout color="info" dismissible>
          {setExclusionResults.data?.Results}
        </CippCallout>
      )}
      {setExclusionResults.isError && !setExclusionResults.isFetching && (
        <CippCallout color="danger" dismissible>
          Could not connect to API: {setExclusionResults.error.message}
        </CippCallout>
      )}
      {getResults.isError && !getResults.isFetching && (
        <CippCallout color="danger" dismissible>
          Could not connect to API: {getResults.error.message}
        </CippCallout>
      )}
      {getResults.isSuccess && !getResults.isFetching && (
        <CippCallout color="info" dismissible>
          {getResults.data?.Results}
        </CippCallout>
      )}
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
