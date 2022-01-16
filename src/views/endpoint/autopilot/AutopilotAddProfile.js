import React from 'react'
import {
  CAlert,
  CCol,
  CRow,
  CForm,
  CListGroup,
  CListGroupItem,
  CCallout,
  CSpinner,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheckCircle,
  faExclamationTriangle,
  faTimesCircle,
} from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import PropTypes from 'prop-types'
import { RFFCFormInput, RFFCFormSwitch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'

const Error = ({ name }) => (
  <Field
    name={name}
    subscription={{ touched: true, error: true }}
    render={({ meta: { touched, error } }) =>
      touched && error ? (
        <CAlert color="danger">
          <FontAwesomeIcon icon={faExclamationTriangle} color="danger" />
          {error}
        </CAlert>
      ) : null
    }
  />
)

Error.propTypes = {
  name: PropTypes.string.isRequired,
}

const requiredArray = (value) => (value && value.length !== 0 ? undefined : 'Required')

const ApplyStandard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddAutopilotConfig', values: values })
  }

  const formValues = {
    Assignto: true,
    DeploymentMode: true,
    HideTerms: true,
    HidePrivacy: true,
    CollectHash: true,
    NotLocalAdmin: true,
    allowWhiteglove: true,
    Autokeyboard: true,
    HideChangeAccount: true,
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Autopilot Profile Wizard"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the profile for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose tenants</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Add-Autopilot-Profile-Tenant-Selector"
              keyField="defaultDomainName"
              path="/api/ListTenants"
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
          <h5 className="card-title mb-4">Supply the ESP Information</h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="DisplayName"
                label="Display name"
                placeholder="Enter a profile name"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="Description"
                label="Description"
                placeholder="leave blank for none"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="DeviceNameTemplate"
                label="Unique name template"
                placeholder="leave blank for none"
              />
              <br></br>
            </CCol>
          </CRow>
          <RFFCFormSwitch
            value={true}
            name="CollectHash"
            label="Convert all targeted devices to Autopilot"
          />
          <RFFCFormSwitch value={true} name="Assignto" label="Assign to all devices" />
          <RFFCFormSwitch value={true} name="DeploymentMode" label="Self-deploying mode" />
          <RFFCFormSwitch value={true} name="HideTerms" label="Hide Terms and conditions" />
          <RFFCFormSwitch value={true} name="HidePrivacy" label="Hide Privacy Settings" />
          <RFFCFormSwitch
            value={true}
            name="HideChangeAccount"
            label="Hide Change Account Options"
          />
          <RFFCFormSwitch
            value={true}
            name="NotLocalAdmin"
            label="Setup user as standard user (Leave unchecked to setup user as local admin)"
          />
          <RFFCFormSwitch value={true} name="allowWhiteglove" label="Allow White Glove OOBE" />
          <RFFCFormSwitch
            value={true}
            name="Autokeyboard"
            label="Automatically configure keyboard"
          />
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
                    <CCol md={6}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Display Name: {props.values.DisplayName}
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.DisplayName ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Naming template: {props.values.DeviceNameTemplate}
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.DeviceNameTemplate ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Self-Deploying
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.DeploymentMode ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Hide Terms
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.HideTerms ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Hide Privacy
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.HidePrivacy ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Convert to Autopilot device
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.CollectHash ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Standard Account
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.NotLocalAdmin ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Allow Whiteglove
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.allowWhiteglove ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Automatically setup keyboard
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.Autokeyboard ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Allow Whiteglove
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.HideChangeAccount ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                      </CListGroup>
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
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default ApplyStandard
