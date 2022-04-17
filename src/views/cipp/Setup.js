import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CCallout, CSpinner, CButton } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { Condition, RFFCFormInput, RFFCFormRadio } from 'src/components/forms'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'

function useInterval(callback, delay, state) {
  const savedCallback = useRef()

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback
  })

  // Set up the interval.
  useEffect(() => {
    function tick() {
      savedCallback.current()
    }
    if (delay !== null) {
      let id = setInterval(tick, delay)
      return () => clearInterval(id)
    }
  }, [delay, state])
}
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

const Setup = () => {
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const onSubmit = (values) => {
    if (!usedWizard) {
      const shippedValues = {
        setkeys: true,
        ...values,
      }
      genericPostRequest({ path: 'api/ExecSAMSetup', values: shippedValues })
    }
  }
  const [usedWizard, setNoSubmit] = useState(false)

  const startCIPPSetup = (partner) => {
    genericGetRequest({
      path: 'api/ExecSAMSetup',
      params: { CreateSAM: true, partnersetup: partner },
    })
    setNoSubmit(true)
  }

  useInterval(
    async () => {
      if (getResults.data?.step < 7 && getResults.data?.step > 0) {
        genericGetRequest({
          path: 'api/ExecSAMSetup',
          params: { CheckSetupProcess: true, step: getResults.data?.step },
        })
      }
    },
    10000,
    getResults.data,
  )

  const formValues = {}
  return (
    <CippWizard
      onSubmit={onSubmit}
      initialValues={{ ...formValues }}
      wizardTitle="Secure Application Model Setup Wizard"
    >
      <CippWizard.Page title="Step one" description="Choose the type of deployment.">
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose Options</h5>
        </center>
        <hr className="my-4" />
        This wizard will guide you through setting up a SAM application and using the correct keys.
        This setup is still a beta feature, and as such so be treated with care.
        <RFFCFormRadio
          value="CreateSAM"
          name="SetupType"
          label="I'd like CIPP to create a SAM Application for me"
        ></RFFCFormRadio>
        <RFFCFormRadio
          value="ExistingSAM"
          name="SetupType"
          label="I have an existing SAM application and would like to enter my tokens"
        ></RFFCFormRadio>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Select Options" description="Select which options you want to apply.">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Enter the secure application model credentials.</h5>
        </center>
        <hr className="my-4" />
        <Condition when="SetupType" is="CreateSAM">
          <RFFCFormRadio
            value="True"
            name="Partner"
            label="I am a Microsoft Partner, and would like to access all tenants using CIPP"
          ></RFFCFormRadio>
          <RFFCFormRadio
            value="False"
            name="Partner"
            label="I am not a Microsoft Partner, and am using CIPP for only my own tenant"
          ></RFFCFormRadio>
          <Condition when="Partner" is="True">
            <CRow>
              <p>
                When clicking the button below, the setup wizard starts. This is a 7 step process.
                Please use a Global Administrator to perform these tasks. You can restart the
                process at any time, by clicking on the start button once more.
              </p>
              <CCol md={2}>
                <CButton type="button" onClick={() => startCIPPSetup(true)}>
                  Start Setup Wizard
                </CButton>
              </CCol>
              <hr className="my-4" />
            </CRow>
            <CRow>
              <CCol md={12}>
                {getResults.isFetching && <CSpinner size="sm">Loading</CSpinner>}
                {getResults.isSuccess && (
                  <>
                    {getResults.data?.step < 7 ? (
                      <CSpinner size="sm"></CSpinner>
                    ) : (
                      <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
                    )}
                    Step {getResults.data?.step} - {getResults.data.message}{' '}
                    {getResults.data.url && <a href={getResults.data?.url}>HERE</a>}
                  </>
                )}
              </CCol>
            </CRow>
          </Condition>
          <Condition when="Partner" is="False">
            <CRow>
              <CCol md={2}>
                <CButton type="button" onClick={() => startCIPPSetup(false)}>
                  Start Setup Wizard
                </CButton>
              </CCol>
              <hr className="my-4" />
            </CRow>
            <CRow>
              <CCol md={12}>
                {getResults.isFetching && <CSpinner size="sm">Loading</CSpinner>}
                {getResults.isSuccess && (
                  <>
                    {getResults.data?.step < 7 ? (
                      <CSpinner size="sm"></CSpinner>
                    ) : (
                      <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
                    )}
                    Step {getResults.data?.step} - {getResults.data.message}{' '}
                    {getResults.data.url && <a href={getResults.data?.url}>HERE</a>}
                  </>
                )}
              </CCol>
            </CRow>
          </Condition>
        </Condition>
        <Condition when="SetupType" is="ExistingSAM">
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="TenantID"
                label="Tenant ID"
                placeholder="Enter the Tenant ID. e.g. mymsp.onmicrosoft.com"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="ApplicationID"
                label="Application ID"
                placeholder="Enter the application ID. e.g 1111-1111-1111-1111-11111"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="password"
                name="ApplicationSecret"
                label="Application Secret"
                placeholder="Enter the application secret"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="password"
                name="RefreshToken"
                label="Refresh Token"
                placeholder="Enter the refresh token"
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="password"
                name="ExchangeRefreshToken"
                label="Exchange Refresh Token"
                placeholder="Enter the Exchange refresh tokens"
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
                      {usedWizard &&
                        'You have used the setup wizard. You can close this screen. Setup has been completed'}
                      {!usedWizard &&
                        'You are sending your own Secure Application Model setup to the Keyvault. For security reasons we do not show the keys. Please make sure you have entered the keys correctly.'}
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

export default Setup
