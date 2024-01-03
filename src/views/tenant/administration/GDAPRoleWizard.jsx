import React from 'react'
import { CCol, CRow, CForm, CCallout, CSpinner, CButton } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { RFFCFormInput } from 'src/components/forms'
import { Link } from 'react-router-dom'

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

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

const GDAPRoleWizard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const handleSubmit = async (values) => {
    genericPostRequest({ path: '/api/ExecAddGDAPRole', values: values })
  }

  const formValues = {}

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="GDAP Role Mapping Wizard"
    >
      <CippWizard.Page
        title="Select which roles you want to map to Groups in your Partner Tenant"
        description="Choose roles from the list below"
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">
            Select which roles you want to map to Groups in your Partner Tenant
          </h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <CCallout color="info">
            For each role you select a new group will be created inside of your partner tenant
            called "M365 GDAP RoleName". Add your users to these new groups to set their GDAP
            permissions. If you need to segment your groups for different teams or to define custom
            permissions, use the Custom Suffix to create additional group mappings per role.
          </CCallout>
          <CRow>
            <CCol md={4}>
              <RFFCFormInput
                type="text"
                name="customSuffix"
                label="Custom Group Suffix (optional)"
                isRequired={false}
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <Field name="gdapRoles" validate={requiredArray}>
                {(props) => (
                  <WizardTableField
                    reportName="gdaproles"
                    keyField="defaultDomainName"
                    path="/GDAPRoles.json"
                    columns={[
                      {
                        name: 'Name',
                        selector: (row) => row['Name'],
                        sortable: true,
                        exportselector: 'Name',
                      },
                      {
                        name: 'Description',
                        selector: (row) => row['Description'],
                        sortable: true,
                      },
                    ]}
                    fieldProps={props}
                  />
                )}
              </Field>
            </CCol>
          </CRow>
          <Error name="gdapRoles" />
        </CForm>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 2</h3>
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
                      <h5 className="mb-0">Roles and group names</h5>
                      {props.values.gdapRoles.map((role, idx) => (
                        <>
                          {role.Name == 'Company Administrator' && (
                            <CCallout color="warning">
                              WARNING: The Company Administrator role will prevent GDAP
                              relationships from automatically extending. We recommend against using
                              this in any GDAP relationship.
                            </CCallout>
                          )}
                        </>
                      ))}

                      <CCallout color="info">
                        {props.values.gdapRoles.map((role, idx) => (
                          <li key={idx}>
                            {role.Name} - M365 GDAP {role.Name}
                          </li>
                        ))}
                      </CCallout>
                      {props.values.customSuffix != null && (
                        <>
                          <h5 className="mb-0">Custom Group Suffix</h5>
                          <CCallout color="info">
                            <li>{props.values.customSuffix}</li>
                          </CCallout>
                        </>
                      )}
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
          <>
            <CCallout color="success">
              {postResults.data.Results.map((message, idx) => {
                return <li key={idx}>{message}</li>
              })}
            </CCallout>
            <Link to="/tenant/administration/gdap-invite">
              <CButton>Create GDAP Invite</CButton>
            </Link>
          </>
        )}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default GDAPRoleWizard
