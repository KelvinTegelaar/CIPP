import React from 'react'
import { CCallout, CCol, CListGroup, CListGroupItem, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { RFFCFormCheck, RFFCFormInput, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import { TenantSelector } from 'src/components/utilities'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

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

const TenantOffboardingWizard = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const currentSettings = useSelector((state) => state.app)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    const shippedValues = {
      TenantFilter: tenantDomain,
      RemoveCSPGuestUsers: values.RemoveCSPGuestUsers ? values.RemoveCSPGuestUsers : '',
      RemoveCSPnotificationContacts: values.RemoveCSPnotificationContacts
        ? values.RemoveCSPnotificationContacts
        : '',
      RemoveMultitenantCSPApps: values.RemoveMultitenantCSPApps
        ? values.RemoveMultitenantCSPApps
        : '',
      TerminateGDAP: values.TerminateGDAP ? values.TerminateGDAP : '',
      TerminateContract: values.TerminateContract ? values.TerminateContract : '',
    }

    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ path: '/api/ExecOffboardTenant', values: shippedValues })
  }

  return (
    <CippWizard
      initialValues={currentSettings.offboardingDefaults}
      onSubmit={handleSubmit}
      wizardTitle="Tenant Offboarding Wizard"
    >
      <CippWizard.Page title="Tenant Choice" description="Choose the tenant to offboard">
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        initialvalues={currentSettings.tenantOffboardingDefaults}
        title="Tenant Offboarding Settings"
        description="Select the tenant offboarding actions you wish to take."
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Choose tenant offboarding options</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow>
            <CCol className="mb-3" md={6}>
              <RFFCFormSwitch
                name="RemoveCSPGuestUsers"
                label="Remove all guest users originating from the CSP tenant."
              />
              <RFFCFormSwitch
                name="RemoveCSPnotificationContacts"
                label="Remove all notification contacts originating from the CSP tenant (technical,security,marketing notifications)."
              />
              <center>
                <CCallout color="danger">
                  These actions will terminate all delegated access to the customer tenant!
                  <hr className="my-4" />
                  <RFFCFormSwitch
                    name="RemoveMultitenantCSPApps"
                    label="Remove all multitenant applications originating from CSP tenant (including CIPP-SAM)."
                  />
                  <RFFCFormSwitch
                    name="TerminateGDAP"
                    label="Terminate all active GDAP relationships (will send email to tenant admins and contacts)."
                  />
                  <RFFCFormSwitch
                    name="TerminateContract"
                    label="Terminate contract relationship (reseller, etc)."
                  />
                </CCallout>
              </center>
            </CCol>
          </CRow>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="mb-4">Confirm and apply</h5>
          <hr className="my-4" />
        </center>
        <div className="mb-2">
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
              <CCallout color="danger">
                {postResults.data.Errors.map((message, idx) => {
                  return <li key={idx}>{message}</li>
                })}
              </CCallout>
            </>
          )}
          {!postResults.isSuccess && (
            <FormSpy>
              {/* eslint-disable react/prop-types */}
              {(props) => (
                <>
                  <CRow>
                    <CCol md={{ span: 6, offset: 3 }}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Selected Tenant:</h5>
                          {tenantDomain}
                        </CListGroupItem>
                      </CListGroup>
                      <hr />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={{ span: 6, offset: 3 }}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove all notification contacts originating from the CSP tenant
                          (technical,security,marketing notifications)
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RemoveCSPnotificationContacts ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove all guest users originating from the CSP tenant
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RemoveCSPGuestUsers ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove all multitenant applications originating from CSP tenant
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RemoveMultitenantApps ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Terminate all active GDAP relationships
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.TerminateGDAP ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Terminate contract relationship
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.TerminateContract ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                      </CListGroup>
                      <hr />
                    </CCol>
                  </CRow>
                </>
              )}
            </FormSpy>
          )}
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default TenantOffboardingWizard
