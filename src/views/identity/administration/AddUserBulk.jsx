import React, { useState } from 'react'
import { CButton, CCallout, CCol, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { CippCallout, CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { RFFCFormInput } from 'src/components/forms'
import { CippTable } from 'src/components/tables'
import { CippCodeBlock, TenantSelector } from 'src/components/utilities'
import { CSVReader } from 'react-papaparse'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { useSelector } from 'react-redux'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CCallout color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CCallout>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const AddUserBulk = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [BulkUser, setBulkUser] = useState([])
  const currentSettings = useSelector((state) => state.app)
  const addedFields = currentSettings?.userSettingsDefaults?.defaultAttributes
    ? //if we have default attributes, add the label object to the fields array
      currentSettings.userSettingsDefaults.defaultAttributes.map((item) => item.label)
    : []
  const fields = [
    'givenName',
    'surName',
    'displayName',
    'mailNickName',
    'domain',
    'usageLocation',
    'JobTitle',
    'streetAddress',
    'PostalCode',
    'City',
    'State',
    'Department',
    'MobilePhone',
    'businessPhones',
    ...addedFields,
  ]
  const columns = fields.map((field) => {
    return {
      name: field,
      selector: (row) => row[field],
      sortable: true,
    }
  })

  const tableColumns = [
    ...columns,
    {
      name: 'Remove',
      button: true,
      cell: (row, index) => {
        return (
          <CButton onClick={() => handleRemove(row)} size="sm" variant="ghost" color="danger">
            <FontAwesomeIcon icon={faTrash} />
          </CButton>
        )
      },
    },
  ]
  const valbutton = (value) =>
    BulkUser.length
      ? undefined
      : 'You must add at least one user. Did you forget to click add or upload the CSV?'
  const handleOnDrop = (data) => {
    const importdata = data.map((item) => {
      //find any keys that have a null or blank string value, and remove them
      Object.keys(item.data).forEach((key) => {
        if (item.data[key] === null || item.data[key] === '') {
          delete item.data[key]
        }
      })
      return item.data
    })
    setBulkUser([...BulkUser, ...importdata])
  }

  const handleOnError = (err, file, inputElem, reason) => {
    //set upload error
  }
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)

  const handleSubmit = async (values) => {
    const shippedValues = {
      TenantFilter: tenantDomain,
      BulkUser,
      ...values,
    }
    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ path: '/api/AddUserBulk', values: shippedValues })
  }
  const addRowtoData = (values) => {
    setBulkUser((prevState) => {
      if (prevState) {
        return [values, ...prevState]
      } else {
        return [values]
      }
    })
  }
  const handleRemove = async (itemindex) => {
    let RemovedItems = BulkUser.filter((item) => item !== itemindex)
    setBulkUser((prevState) => {
      return RemovedItems
    })
  }
  return (
    <CippWizard onSubmit={handleSubmit} wizardTitle="Add Bulk User Wizard">
      <CippWizard.Page title="Tenant Choice" description="Choose the tenant to add users to">
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants">{(props) => <TenantSelector />}</Field>
        <Error name="selectedTenants" />
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Enter User Information" description="Enter the information">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Enter user information</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <br />
          <p>
            <a
              href={`data:text/csv;charset=utf-8,%EF%BB%BF${encodeURIComponent(
                fields.join(',') + '\n',
              )}`}
              download="BulkUserAdd.csv"
            >
              Example CSV
            </a>
          </p>
        </div>
        <CCol xs={'auto'}>
          <CSVReader
            onDrop={handleOnDrop}
            onError={handleOnError}
            config={{ header: true, skipEmptyLines: true }}
          >
            <span>Drop CSV file here or click to upload.</span>
          </CSVReader>
        </CCol>
        <br></br>
        <CRow>
          {fields.map((field, idx) => {
            return (
              <CCol key={idx} xs={'auto'}>
                <RFFCFormInput name={field} label={field} type="text" />
              </CCol>
            )
          })}
          <CCol xs={'auto'} className="align-self-end">
            <FormSpy>
              {/* eslint-disable react/prop-types */}
              {(props) => {
                return (
                  <>
                    <CButton
                      onClick={() => addRowtoData(props.values)}
                      name="addButton"
                      className="mb-3"
                    >
                      <FontAwesomeIcon icon={faPlus} className="me-2" />
                      Add
                    </CButton>
                  </>
                )
              }}
            </FormSpy>
          </CCol>
          <Field
            key={BulkUser}
            name="BlockNext"
            component="hidden"
            type="hidden"
            validate={valbutton}
          ></Field>
          <Error name="BlockNext" />
        </CRow>
        <CRow>
          <CCol>
            {BulkUser && (
              <CippTable
                reportName="none"
                tableProps={{ subheader: false }}
                data={BulkUser}
                columns={tableColumns}
              />
            )}
          </CCol>
        </CRow>

        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
          <h5 className="mb-4">Confirm and apply</h5>
          <hr className="my-4" />
          {postResults.isFetching && (
            <CCallout color="info">
              <CSpinner>Loading</CSpinner>
            </CCallout>
          )}
          <p>
            {postResults.isSuccess && (
              <CippCodeBlock
                code={postResults.data?.map((item) => {
                  return <li key={item.Results}>{item.Results}</li>
                })}
                callout={true}
                calloutCopyValue={postResults.data?.Results}
              />
            )}
          </p>
          {BulkUser && (
            <CippTable
              reportName="none"
              tableProps={{ subheader: false }}
              data={BulkUser}
              columns={tableColumns}
            />
          )}
        </center>
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default AddUserBulk
