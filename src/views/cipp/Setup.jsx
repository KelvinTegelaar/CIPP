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
  const [setupDone, setSetupdone] = useState(false)
  const valbutton = (value) =>
    getResults.data?.step < 5
      ? undefined
      : `You do not have to click next. Finish the wizard via the setup button below. After it says "Setup Completed" you may browse away from this page.`
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
      params: { CreateSAM: true, partnersetup: true },
    })
    setSetupdone(false)
  }

  useInterval(
    async () => {
      if (getResults.data?.step < 5 && getResults.data?.step > 0) {
        genericGetRequest({
          path: 'api/ExecSAMSetup',
          params: { CheckSetupProcess: true, step: getResults.data?.step },
        })
      } else {
        setSetupdone(true)
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
        This wizard will guide you through setting up CIPPs access to your client tenants. If this
        is your first time setting up CIPP you will want to choose the option "I would like CIPP to
        create an application for me".
        <CCallout color="warning">
          To successfully finish setup you must follow the instructions{' '}
          <a
            href="https://docs.cipp.app/setup/installation/samwizard"
            rel="noreferrer"
            target="_blank"
          >
            here.
          </a>
        </CCallout>
        <CRow className="mt-3">
          <RFFCFormRadio
            value="CreateSAM"
            name="SetupType"
            label="I would like CIPP to create an application for me"
          ></RFFCFormRadio>
          <RFFCFormRadio
            value="RefreshTokensOnly"
            name="SetupType"
            label="I would like to refresh my token or replace the user I've used for my previous token."
          ></RFFCFormRadio>
          <RFFCFormRadio
            value="ExistingSAM"
            name="SetupType"
            label="I have an existing application and would like to manually enter my token, or update them."
          ></RFFCFormRadio>
        </CRow>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Select Options" description="Select which options you want to apply.">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Enter the secure application model credentials.</h5>
        </center>
        <hr className="my-4" />
        <Condition when="SetupType" is="RefreshTokensOnly">
          <CRow className="mb-3">
            <CCol md={6} className="mb-3">
              Click the buttons below to refresh your token.
              <br /> Remember to login under a account that has been added to the correct GDAP
              groups and the group 'AdminAgents'.
              <br />
              {getResults.isUninitialized && genericGetRequest({ path: 'api/ExecListAppId' })}
              {getResults.isSuccess && (
                <>
                  <CRow className="mb-3">
                    <CCol md={2} className="mb-3">
                      <a target="_blank" rel="noreferrer" href={`${getResults.data.refreshUrl}`}>
                        <CButton color="primary">Refresh Graph Token</CButton>
                      </a>
                    </CCol>
                  </CRow>
                  <CRow></CRow>
                </>
              )}
            </CCol>
            <CCol md={2}></CCol>
          </CRow>
        </Condition>
        <Condition when="SetupType" is="CreateSAM">
          <CRow>
            <p>
              When clicking the button below, the setup wizard starts. This is a 5 step process.
              Please use a Global Administrator to perform these tasks. You can restart the process
              at any time, by clicking on the start button once more.
            </p>
            <CCol md={12}>
              <Field
                name="start"
                component="button"
                className="btn btn-primary"
                type="button"
                onClick={() => startCIPPSetup(true)}
                validate={() => valbutton()}
              >
                Start Setup Wizard
              </Field>
              <Field name="BlockNext" component="hidden" type="hidden" validate={valbutton}></Field>
              <Error name="start" />
            </CCol>
            <hr className="my-4" />
          </CRow>
          <CRow>
            <CCol md={12}>
              {getResults.isFetching && <CSpinner size="sm">Loading</CSpinner>}
              {getResults.isSuccess && (
                <>
                  {getResults.data?.step < 5 ? (
                    <CSpinner size="sm"></CSpinner>
                  ) : (
                    <FontAwesomeIcon icon={faCheck}></FontAwesomeIcon>
                  )}
                  Step {getResults.data?.step} - {getResults.data.message}{' '}
                  {getResults.data.url && (
                    <a target="_blank" rel="noopener noreferrer" href={getResults.data?.url}>
                      HERE
                    </a>
                  )}
                </>
              )}
            </CCol>
          </CRow>
        </Condition>
        <Condition when="SetupType" is="ExistingSAM">
          you may enter your secrets below, if you only want to update a single value, leave the
          other fields blank.
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="TenantID"
                label="Tenant ID"
                placeholder="Enter the Tenant ID. e.g. mymsp.onmicrosoft.com. Leave blank to retain a previous key if this exists."
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="text"
                name="ApplicationID"
                label="Application ID"
                placeholder="Enter the application ID. e.g 1111-1111-1111-1111-11111. Leave blank to retain a previous key if this exists."
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="password"
                name="ApplicationSecret"
                label="Application Secret"
                placeholder="Enter the application secret. Leave blank to retain a previous key if this exists."
              />
            </CCol>
          </CRow>
          <CRow>
            <CCol md={12}>
              <RFFCFormInput
                type="password"
                name="RefreshToken"
                label="Refresh Token"
                placeholder="Enter the refresh token. Leave blank to retain a previous key if this exists."
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
              return (
                <>
                  <CRow>
                    <CCol md={3}></CCol>
                    <CCol md={6}>
                      {usedWizard &&
                        'You have used the setup wizard. You can close this screen. Setup has been completed.'}
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
