import React from 'react'
import { CCol, CRow, CCallout, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import {
  Condition,
  RFFCFormInput,
  RFFCFormSelect,
  RFFCFormSwitch,
  RFFCFormTextarea,
  RFFSelectSearch,
} from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import langaugeList from 'src/data/countryList'

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
const DeployNamedLocation = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    genericPostRequest({ path: '/api/AddNamedLocation', values: values })
  }
  /* eslint-disable react/prop-types */

  const formValues = {
    TemplateType: 'Admin',
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Add Conditional Access Named Location"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the Named Location for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose tenants</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
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
          <h5 className="card-title mb-4">Enter the information for this policy</h5>
        </center>
        <hr className="my-4" />
        <CRow>
          <CCol md={12}>
            <RFFCFormInput
              name="policyname"
              placeholder="Enter a name"
              label="Please enter a name for the policy"
            />
          </CCol>
        </CRow>
        <CRow>
          <CCol md={12}>
            <RFFCFormSelect
              name="Type"
              values={[
                {
                  value: 'Countries',
                  label: 'Countries Location',
                },
                {
                  value: 'IPLocation',
                  label: 'IP Location',
                },
              ]}
              placeholder="Select a type of location"
              label="Please choose a type of location."
            />
          </CCol>
        </CRow>
        <Condition when="Type" is={'IPLocation'}>
          <CRow>
            <CCol>
              <RFFCFormTextarea
                name="IPs"
                label="Conditional Access Parameters"
                placeholder={
                  'Enter the IPs to add to his named location, one per line, in CIDR format e.g.: 111.111.111.111/24)'
                }
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <RFFCFormSwitch name="Trusted" label="Mark as trusted location" />
            </CCol>
          </CRow>
        </Condition>
        <Condition when="Type" is={'Countries'}>
          <CRow>
            <CCol>
              <RFFSelectSearch
                values={langaugeList.map(({ Code, Name }) => ({
                  value: Code,
                  name: Name,
                }))}
                name="Countries"
                multi={true}
                label="Countries"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol>
              <RFFCFormSwitch
                name="includeUnknownCountriesAndRegions"
                label="Include unknown countries and regions"
              />
            </CCol>
          </CRow>
        </Condition>
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
                    <CCol md={6}>
                      <h5 className="mb-0">Selected Tenants</h5>
                      <CCallout color="info">
                        {props.values.selectedTenants.map((tenant, idx) => (
                          <li key={idx}>
                            {tenant.displayName}- {tenant.defaultDomainName}
                          </li>
                        ))}
                      </CCallout>
                      <h5 className="mb-0">Rule Settings</h5>
                      <CCallout color="info">{props.values.rawjson}</CCallout>
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

export default DeployNamedLocation
