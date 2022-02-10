import React from 'react'
import { CCol, CRow, CForm, CListGroup, CListGroupItem, CCallout, CSpinner } from '@coreui/react'
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

const ApplyStandard = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    values.selectedTenants.map(
      (tenant) => (values[`Select_${tenant.defaultDomainName}`] = tenant.defaultDomainName),
    )
    genericPostRequest({ path: '/api/AddEnrollment', values: values })
  }

  const formValues = {
    InstallAsSystem: true,
    DisableRestart: true,
  }

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="Autopilot Status Page Wizard"
    >
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenants to create the ESP for."
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose tenants</h5>
        </center>
        <hr className="my-4" />
        <Field name="selectedTenants" validate={requiredArray}>
          {(props) => (
            <WizardTableField
              reportName="Autopilot-Status-Page-Tenant-Selector"
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
            <CCol md={2}>
              <RFFCFormInput
                type="text"
                name="TimeOutInMinutes"
                label="Timeout in minutes"
                placeholder="60"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="ErrorMessage"
                label="Custom Error Message"
                placeholder="leave blank to not set."
              />
            </CCol>
          </CRow>
          <RFFCFormSwitch value={true} name="ShowProgress" label="Show progress to users" />
          <RFFCFormSwitch value={true} name="EnableLog" label="Turn on log collection" />
          <RFFCFormSwitch
            value={true}
            name="OBEEOnly"
            label="Show status page only with OOBE setup"
          />
          <RFFCFormSwitch value={true} name="blockDevice" label="Block device usage during setup" />
          <RFFCFormSwitch value={true} name="Allowretry" label="Allow retry" />
          <RFFCFormSwitch value={true} name="AllowReset" label="Allow reset" />
          <RFFCFormSwitch
            value={true}
            name="AllowFail"
            label="Allow users to use device if setup fails"
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
                          Timeout: {props.values.TimeOutInMinutes}
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.TimeOutInMinutes ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Show Progress
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.ShowProgress ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Turn on log collection
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.EnableLog ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Show OOBE page
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.OBEEOnly ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Block during setup
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.blockDevice ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Allow retry
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.Allowretry ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Allow device reset
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.AllowReset ? faCheckCircle : faTimesCircle}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Allow usage if failed
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.AllowFail ? faCheckCircle : faTimesCircle}
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
        {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}{' '}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default ApplyStandard
