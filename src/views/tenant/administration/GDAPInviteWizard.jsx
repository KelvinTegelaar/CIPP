import React, { useState } from 'react'
import {
  CCol,
  CRow,
  CForm,
  CCallout,
  CSpinner,
  CFormInput,
  CFormLabel,
  CFormRange,
} from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle } from '@fortawesome/free-solid-svg-icons'
import { CippWizard } from 'src/components/layout'
import { WizardTableField } from 'src/components/tables'
import { TitleButton } from 'src/components/buttons'
import PropTypes from 'prop-types'
import { useLazyGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { CippCodeBlock } from 'src/components/utilities'

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

const GDAPInviteWizard = () => {
  const [inviteCount, setInviteCount] = useState(1)
  const [loopRunning, setLoopRunning] = React.useState(false)
  const [massResults, setMassResults] = React.useState([])
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [genericGetRequest, getResults] = useLazyGenericGetRequestQuery()

  const handleSubmit = async (values) => {
    const resultsarr = []
    setLoopRunning(true)
    for (var x = 0; x < inviteCount; x++) {
      const results = await genericPostRequest({ path: '/api/ExecGDAPInvite', values: values })
      resultsarr.push(results)
      setMassResults(resultsarr)
    }
    setLoopRunning(false)
  }

  const formValues = {}

  return (
    <CippWizard
      initialValues={{ ...formValues }}
      onSubmit={handleSubmit}
      wizardTitle="GDAP Invite Wizard"
    >
      <CippWizard.Page
        title="Select which roles you want to add to GDAP relationship invite"
        description="Choose from the mapped GDAP Roles"
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">
            Select which roles you want to add to GDAP relationship.
          </h5>
        </center>
        <hr className="my-4" />
        <CForm onSubmit={handleSubmit}>
          <CCallout color="info">
            CIPP will create a single relationship with all roles you've selected for the maximum
            duration of 730 days using a GUID as a random name for the relationship.
            <br /> It is recommend to put CIPP user in the correct GDAP Role Groups to manage your
            environment secure after deployment of GDAP.
          </CCallout>
          <div className="mb-2">
            <TitleButton href="/tenant/administration/gdap-role-wizard" title="Map GDAP Roles" />
          </div>
          <Field name="gdapRoles" validate={requiredArray}>
            {(props) => (
              <WizardTableField
                reportName="gdaproles"
                keyField="defaultDomainName"
                path="/api/ListGDAPRoles"
                columns={[
                  {
                    name: 'Name',
                    selector: (row) => row['RoleName'],
                    sortable: true,
                    exportselector: 'Name',
                  },
                  {
                    name: 'Group',
                    selector: (row) => row['GroupName'],
                    sortable: true,
                  },
                ]}
                fieldProps={props}
              />
            )}
          </Field>
          <Error name="gdapRoles" />
        </CForm>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Invite Options" description="Select options for the invite">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5 className="card-title mb-4">Invite Options</h5>
        </center>
        <hr className="my-4" />
        <CFormLabel>Number of Invites</CFormLabel>
        <CRow className="mb-3">
          <CCol md={1} xs={6}>
            <CFormInput
              id="invite-count"
              value={inviteCount}
              onChange={(e) => setInviteCount(e.target.value)}
            />
          </CCol>
          <CCol>
            <CFormRange
              className="mt-2"
              min={1}
              max={100}
              defaultValue={1}
              value={inviteCount}
              onChange={(e) => setInviteCount(e.target.value)}
            />
          </CCol>
        </CRow>
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5 className="card-title mb-4">Confirm and apply</h5>
        </center>
        <hr className="my-4" />
        {massResults.length < 1 && (
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
                          {role.RoleName === 'Company Administrator' && (
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
                            {role.RoleName} - {role.GroupName}
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
        {(massResults.length >= 1 || loopRunning) &&
          massResults.map((message, idx) => {
            const results = message?.data
            const displayResults = Array.isArray(results) ? results.join(', ') : results
            return (
              <CCallout color="success" key={idx}>
                {results.Results.map((message, idx) => {
                  return <li key={idx}>{message}</li>
                })}
                <CippCodeBlock
                  key={idx}
                  code={results.Invite.InviteUrl}
                  showLineNumbers={false}
                  wrapLongLines={true}
                  language="text"
                />
              </CCallout>
            )
          })}
        {loopRunning && (
          <li>
            <CSpinner size="sm" />
          </li>
        )}
        <hr className="my-4" />
      </CippWizard.Page>
    </CippWizard>
  )
}

export default GDAPInviteWizard
