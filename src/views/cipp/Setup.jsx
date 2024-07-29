import React, { useEffect, useRef, useState } from 'react'
import { CCol, CRow, CCallout, CSpinner, CButton } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { Condition, RFFCFormInput, RFFCFormRadio } from 'src/components/forms'
import {
  useLazyExecPermissionsAccessCheckQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { Link } from 'react-router-dom'

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
  const [checkPermissions, permissionsResult] = useLazyExecPermissionsAccessCheckQuery()
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
  }

  useInterval(
    async () => {
      if (getResults.data?.step < 5 && getResults.data?.step > 0) {
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

  const stepsDetails = [
    { id: 1, text: 'Step 1 - First Login' },
    { id: 2, text: 'Step 2 - Creating Application & Approving Application' },
    { id: 3, text: 'Step 3 - Receiving Token' },
    { id: 4, text: 'Step 4 - Finishing Authentication Setup' },
  ]
  const RenderSteps = ({ currentStep = 0 }) => (
    <>
      {currentStep > 0 &&
        stepsDetails.slice(0, currentStep - 1).map((step) => (
          <div key={step.id}>
            <FontAwesomeIcon icon={faCheck} /> {step.text} - Completed
          </div>
        ))}
    </>
  )
  return (
    <CippWizard
      onSubmit={onSubmit}
      initialValues={{ ...formValues }}
      wizardTitle="Secure Application Model Setup Wizard"
      hideSubmit={true}
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
            here
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
      <CippWizard.Page
        hideSubmit={true}
        title="Perform setup"
        description="Perform setup to allow CIPP access to your M365 environment"
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Enter the secure application model credentials.</h5>
        </center>
        <hr className="my-4" />
        <Condition when="SetupType" is="RefreshTokensOnly">
          <CRow className="mb-3">
            <CCol md={6} className="mb-3">
              Click the buttons below to refresh your token.
              <br /> Remember to login under a service account that has been added to the correct
              GDAP groups and the group 'AdminAgents'.
              <br />
            </CCol>
            {getResults.isUninitialized && genericGetRequest({ path: 'api/ExecListAppId' })}
            {getResults.isSuccess && (
              <>
                <CRow className="mb-3">
                  <CCol md={2} className="mb-3">
                    <a target="_blank" rel="noreferrer" href={`${getResults.data.refreshUrl}`}>
                      <CButton className="mb-3" color="primary">
                        Refresh Graph Token
                      </CButton>
                    </a>
                  </CCol>
                </CRow>
                <CRow></CRow>
              </>
            )}
            <CCol md={2}></CCol>
          </CRow>
        </Condition>
        <Condition when="SetupType" is="CreateSAM">
          <CRow>
            <p>
              Click the button below to start the setup wizard. You will need the following
              prerequisites:
              <li>
                A CIPP Service Account. For more information on how to create a service account
                click{' '}
                <a
                  href="https://docs.cipp.app/setup/installation/samwizard"
                  rel="noreferrer"
                  target="_blank"
                >
                  here
                </a>
              </li>
              <li>(Temporary) Global Administrator permissions for the CIPP Service Account</li>
              <li>
                Multi-factor authentication enabled for the CIPP Service Account, with no trusted
                locations or other exclusions.
              </li>
            </p>
            <CCol md={12}>
              <Field
                name="start"
                component="button"
                className="btn btn-primary"
                type="button"
                onClick={() => startCIPPSetup(true)}
              >
                {getResults.isFetching && <CSpinner size="sm" />} Start Setup Wizard
              </Field>
            </CCol>
            <hr className="my-4" />
          </CRow>
          <CRow>
            <CCol md={12}>
              {getResults.isSuccess && (
                <>
                  <RenderSteps currentStep={getResults.data?.step} />
                  {getResults.data?.step < 5 && getResults.data?.step > 0 && (
                    <CSpinner size="sm"></CSpinner>
                  )}
                  {getResults.data?.step > 0 && getResults.data?.step < 5 && (
                    <>
                      Step {getResults.data?.step} - {getResults.data.message}{' '}
                      {getResults.data.url && (
                        <a target="_blank" rel="noopener noreferrer" href={getResults.data?.url}>
                          HERE
                        </a>
                      )}
                    </>
                  )}
                </>
              )}
            </CCol>
            {getResults.data?.step === 5 && (
              <p>
                {permissionsResult.isFetching && <CSpinner />} Authentication has been received.
                Checking if all prerequisites are met to connect to your tenants.
                {permissionsResult.isUninitialized && checkPermissions()}
              </p>
            )}
            <CRow>
              {permissionsResult.data?.Results && (
                <>
                  <CCol>
                    <CCallout color="success">
                      {permissionsResult.data.Results?.Messages && (
                        <>
                          {permissionsResult.data.Results?.Messages?.map((m, idx) => (
                            <div key={idx}>{m}</div>
                          ))}
                        </>
                      )}
                    </CCallout>
                  </CCol>
                  <CCol>
                    {permissionsResult.data.Results?.ErrorMessages?.length >= 1 && (
                      <CCallout color="danger">
                        {permissionsResult.data.Results?.ErrorMessages?.map((m, idx) => (
                          <div key={idx}>{m}</div>
                        ))}
                      </CCallout>
                    )}
                  </CCol>
                </>
              )}
            </CRow>
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
                placeholder="Enter the Tenant ID. e.g. 1111-1111-1111-1111-11111. Leave blank to retain a previous key if this exists."
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
          <CRow>
            <CCol md={12}>
              <div className="d-flex justify-content-end">
                <CButton type="submit">Submit info</CButton>
              </div>
            </CCol>
          </CRow>
          {postResults.isFetching && (
            <CCallout color="info">
              <CSpinner>Loading</CSpinner>
            </CCallout>
          )}
          {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
        </Condition>
        <FormSpy>
          {(props) => {
            if (props.values.SetupType === 'ExistingSAM') {
              setNoSubmit(false)
            } else {
              setNoSubmit(true)
            }
          }}
        </FormSpy>
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default Setup
