import React from 'react'
import { CCol, CRow, CForm, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { Condition, RFFCFormInput, RFFCFormRadio, RFFSelectSearch } from 'src/components/forms'
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

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

const AddRMM = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddMSPApp', values: values })
  }

  const formValues = {
    arch: true,
    RemoveVersions: true,
    AcceptLicense: true,
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="RMM App Wizard"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to deploy the RMM package to."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Add-RMM-App-Tenant-Selector"
              keyField="defaultDomainName"
              path="/api/ListTenants?AllTenantSelector=false"
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
      <CippWizard.Page
        title="Select RMM Settings"
        description="Select which options you want to apply to the RMM installation."
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Supply the app information</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol md={6}>
              <RFFSelectSearch
                values={[
                  { value: 'datto', name: 'Datto RMM' },
                  { value: 'ninja', name: 'NinjaOne' },
                  //{ value: 'ncentral', name: 'N-Able N-Central' },
                  //{ value: 'nablermm', name: 'N-Able RMM' },
                  { value: 'syncro', name: 'Syncro RMM' },
                  { value: 'immy', name: 'ImmyBot' },
                  { value: 'huntress', name: 'Huntress' },
                ]}
                name="rmmname"
                label="Select MSP Tool"
              />
            </CCol>
            <CCol md={6}>
              <RFFCFormInput
                type="text"
                name="displayName"
                label="Intune Application Display Name"
              />
            </CCol>
          </CRow>
          <FormSpy>
            {(props) => {
              /* eslint-disable react/prop-types */
              return (
                <>
                  <Condition when="rmmname.value" is={'datto'}>
                    <CRow>
                      <CCol md={6}>
                        <RFFCFormInput
                          type="text"
                          name="params.dattoUrl"
                          label="Server URL (e.g. https://pinotage.centrastage.net)"
                        />
                      </CCol>
                    </CRow>
                    <CRow>
                      {props.values.selectedTenants.map((item, index) => (
                        <CCol md={6} key={index}>
                          <RFFCFormInput
                            type="text"
                            name={`params.dattoGuid.${item.customerId}`}
                            label={`Datto ID ${item.defaultDomainName}`}
                          />
                        </CCol>
                      ))}
                    </CRow>
                  </Condition>
                  <Condition when="rmmname.value" is={'ninja'}>
                    <CRow>
                      <CCol md={6}>
                        <RFFCFormInput
                          type="text"
                          name="packagename"
                          label="Chocolatey package name"
                        />
                      </CCol>
                      <CCol md={6}>
                        <RFFCFormInput
                          type="text"
                          name="applicationName"
                          label="Application name"
                        />
                      </CCol>
                    </CRow>
                  </Condition>
                  <Condition when="rmmname.value" is={'syncro'}>
                    {props.values.selectedTenants.map((item, index) => (
                      <CCol md={6} key={index}>
                        <RFFCFormInput
                          type="text"
                          name={`params.ClientURL.${item.customerId}`}
                          label={`Client URL ${item.defaultDomainName}`}
                        />
                      </CCol>
                    ))}
                  </Condition>
                  <Condition when="rmmname.value" is={'immy'}>
                    {props.values.selectedTenants.map((item, index) => (
                      <CCol md={6} key={index}>
                        <RFFCFormInput
                          type="text"
                          name={`params.ClientURL.${item.customerId}`}
                          label={`Client URL ${item.defaultDomainName}`}
                        />
                      </CCol>
                    ))}
                  </Condition>
                  <Condition when="rmmname.value" is={'ncentral'}>
                    <CRow>
                      <CCol md={6}>
                        <RFFCFormInput type="text" name="AgentURL" label="Agent URL" />
                      </CCol>
                    </CRow>
                    <CRow>
                      {props.values.selectedTenants.map((item, index) => (
                        <CCol md={6} key={index}>
                          <RFFCFormInput
                            type="text"
                            name={`registrationToken_${item.defaultDomainName}`}
                            label={`Registration Token ${item.defaultDomainName}`}
                          />
                        </CCol>
                      ))}
                    </CRow>
                  </Condition>
                  <Condition when="rmmname.value" is={'huntress'}>
                    <CRow>
                      <CCol md={6}>
                        <RFFCFormInput type="text" name="params.AccountKey" label="Account Key" />
                      </CCol>
                    </CRow>
                    <CRow>
                      {props.values.selectedTenants.map((item, index) => (
                        <CCol md={6} key={index}>
                          <RFFCFormInput
                            type="text"
                            name={`params.Orgkey.${item.customerId}`}
                            label={`Organization Key ${item.defaultDomainName}`}
                          />
                        </CCol>
                      ))}
                    </CRow>
                  </Condition>
                  <Condition when="rmmname.value" is={'nablermm'}>
                    <CRow>
                      <CCol md={6}>
                        <RFFCFormInput
                          type="text"
                          name="packagename"
                          label="Chocolatey package name"
                        />
                      </CCol>
                      <CCol md={6}>
                        <RFFCFormInput
                          type="text"
                          name="applicationName"
                          label="Application name"
                        />
                      </CCol>
                    </CRow>
                  </Condition>
                </>
              )
            }}
          </FormSpy>
          <RFFCFormRadio
            value="On"
            name="AssignTo"
            label="Do not assign"
            validate={false}
          ></RFFCFormRadio>
          <RFFCFormRadio
            value="allLicensedUsers"
            name="AssignTo"
            label="Assign to all users"
            validate={false}
          ></RFFCFormRadio>
          <RFFCFormRadio
            value="AllDevices"
            name="AssignTo"
            label="Assign to all devices"
            validate={false}
          ></RFFCFormRadio>
          <RFFCFormRadio
            value="AllDevicesAndUsers"
            name="AssignTo"
            label="Assign to all users and devices"
          ></RFFCFormRadio>
        </CForm>
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
            {(props) => {
              /* eslint-disable react/prop-types */
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}></CCol>
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
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default AddRMM
