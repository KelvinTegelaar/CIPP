import React from 'react'
import { CCol, CRow, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { CippTable, WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

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

const AppApproval = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    genericPostRequest({ path: '/api/ExecAddMultiTenantApp', values: values })
  }

  const formValues = {
    TemplateType: 'Admin',
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Add Enterprise Application to tenant(s)"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the application for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose tenants</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants">
          {(props) => (
            <WizardTableField
              reportName="Add-CA-Policy-Tenant-Selector"
              keyField="defaultDomainName"
              path="/api/ListTenants?AllTenantSelector=true"
              columns={[
                {
                  name: 'Display Name',
                  selector: (row) => row['displayName'],
                  sortable: true,
                  exportselector: 'displayName',
                },
                {
                  name: 'Default Domain Name',
                  selector: (row) => row['defaultDomainName'],
                  sortable: true,
                  exportselector: 'mail',
                },
              ]}
              fieldProps={props}
            />
          )}
        </Field>
        <Error name="selectedTenants" />
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Select Options" description="Select which options you want to apply.">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Enter the information for this application</h5>
        </center>
        <hr className="my-4" />
        <CRow>
          <CCol className="mb-3" md={12}>
            <RFFCFormInput name="AppId" label="Enter Application ID" />
          </CCol>
        </CRow>
        <CRow>
          <CCol className="mb-3" md={12}>
            <RFFCFormSwitch
              name="CopyPermissions"
              label="Copy permissions from original app (Only possible if app exists in partner tenant)"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol className="mb-3" md={12}>
            <label>Add permissions</label>
            <Field name="permissions">
              {(props) => (
                <WizardTableField
                  reportName="Add-CA-Policy-Tenant-Selector"
                  keyField="defaultDomainName"
                  path="/PermissionsList.json"
                  columns={[
                    {
                      name: 'Display Name',
                      selector: (row) => row['displayName'],
                      sortable: true,
                      exportselector: 'displayName',
                    },
                    {
                      name: 'Value',
                      selector: (row) => row['value'],
                      sortable: true,
                      exportselector: 'value',
                    },
                    {
                      name: 'Type',
                      selector: (row) => row['origin'],
                      sortable: true,
                      exportselector: 'origin',
                    },
                  ]}
                  fieldProps={props}
                />
              )}
            </Field>
          </CCol>
        </CRow>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {!postResults.isSuccess && (
          <FormSpy>
            {/* eslint-disable react/prop-types */}
            {(props) => {
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}>
                      <h5 className="mb-0">Selected Tenants</h5>
                      <CCallout color="info">
                        {props.values.selectedTenants.map((tenant, idx) => (
                          <li key={idx}>
                            {tenant.displayName}- {tenant.defaultDomainName}
                          </li>
                        ))}
                      </CCallout>
                      <h5 className="mb-0">Application ID</h5>
                      <CCallout color="info">{props.values.AppId}</CCallout>
                      <h5 className="mb-0">Copy Permissions</h5>
                      <CCallout color="info">
                        {props.values.CopyPermissions ? (
                          <FontAwesomeIcon icon={'check'}>Yes</FontAwesomeIcon>
                        ) : (
                          <FontAwesomeIcon icon={'times'}>No</FontAwesomeIcon>
                        )}
                      </CCallout>
                      <h5 className="mb-0">Selected Permissions</h5>
                      <CCallout color="info">
                        {props.values.permissions?.map((tenant, idx) => (
                          <li key={idx}>
                            {tenant.displayName} - {tenant.origin}
                          </li>
                        ))}
                      </CCallout>
                    </CCol>
                  </CRow>
                </>
              )
            }}
          </FormSpy>
        )}
        {postResults.isFetching && (
          <CCallout color="info">
            <CSpinner>Loading</CSpinner>
          </CCallout>
        )}
        {postResults.isSuccess && (
          <CCallout color="success">
            {postResults.data.Results.map((message, idx) => {
              return <li key={idx}>{message}</li>
            })}
          </CCallout>
        )}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default AppApproval
