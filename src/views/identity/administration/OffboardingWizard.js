import React from 'react'
import { CCallout, CCol, CListGroup, CListGroupItem, CRow, CSpinner } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { RFFCFormInput, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import { TenantSelector } from 'src/components/utilities'
import { useListUsersQuery } from 'src/store/api/users'
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

const OffboardingWizard = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    const shippedValues = {
      TenantFilter: tenantDomain,
      OOO: values.OOO ? values.OOO : '',
      forward: values.forward ? values.forward.value : '',
      OnedriveAccess: values.OnedriveAccess ? values.OnedriveAccess.value : '',
      AccessNoAutomap: values.AccessNoAutomap ? values.AccessNoAutomap.value : '',
      AccessAutomap: values.AccessAutomap ? values.AccessAutomap.value : '',
      ConvertToShared: values.ConvertToShared,
      HideFromGAL: values.HideFromGAL,
      DisableSignIn: values.DisableSignIn,
      RemoveGroups: values.RemoveGroups,
      RemoveLicenses: values.RemoveLicenses,
      ResetPass: values.ResetPass,
      RevokeSessions: values.RevokeSessions,
      user: values.User.value,
      deleteuser: values.DeleteUser,
      removeRules: values.RemoveRules,
      removeMobile: values.RemoveMobile,
    }

    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ path: '/api/ExecOffboardUser', values: shippedValues })
  }

  return (
    <CippWizard onSubmit={handleSubmit} wizardTitle="Offboarding Wizard">
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenant in which to offboard a user"
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        title="Select User"
        description="Select the user to offboard from the tenant."
      >
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Select the user that will be offboarded</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <RFFSelectSearch
            label={'Users in ' + tenantDomain}
            values={users?.map((user) => ({
              value: user.mail,
              name: `${user.displayName} <${user.mail}>`,
            }))}
            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
            name="User"
          />
          {usersError && <span>Failed to load list of users</span>}
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Offboarding Settings" description="Select the offboarding options.">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5>Choose offboarding options</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <RFFCFormSwitch name="RevokeSessions" label="Revoke all sessions" />
          <RFFCFormSwitch name="RemoveMobile" label="Remove all Mobile Devices" />
          <RFFCFormSwitch name="RemoveRules" label="Remove all Rules" />
          <RFFCFormSwitch name="RemoveLicenses" label="Remove Licenses" />
          <RFFCFormSwitch name="ConvertToShared" label="Convert to Shared Mailbox" />
          <RFFCFormSwitch name="DisableSignIn" label="Disable Sign in" />
          <RFFCFormSwitch name="ResetPass" label="Reset Password" />
          <RFFCFormSwitch name="RemoveGroups" label="Remove from all groups" />
          <RFFCFormSwitch name="HideFromGAL" label="Hide from Global Address List" />
          <CCol md={6}>
            <RFFCFormInput
              name="OOO"
              label="Out of Office"
              type="text"
              placeholder="leave blank to not set"
            />
          </CCol>
          <CCol md={6}>
            <RFFSelectSearch
              label="Give other user full access on mailbox without automapping"
              values={users?.map((user) => ({
                value: user.mail,
                name: `${user.displayName} <${user.mail}>`,
              }))}
              placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
              name="AccessNoAutomap"
            />
          </CCol>
          <CCol md={6}>
            <RFFSelectSearch
              label="Give other user full access on mailbox with automapping"
              values={users?.map((user) => ({
                value: user.mail,
                name: `${user.displayName} <${user.mail}>`,
              }))}
              placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
              name="AccessAutomap"
            />
          </CCol>
          <CCol md={6}>
            <RFFSelectSearch
              label="Give other user full access on Onedrive"
              values={users?.map((user) => ({
                value: user.mail,
                name: `${user.displayName} <${user.mail}>`,
              }))}
              placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
              name="OnedriveAccess"
            />
          </CCol>
          <CCol md={6}>
            <RFFSelectSearch
              label="Forward email to other user"
              values={users?.map((user) => ({
                value: user.mail,
                name: `${user.displayName} <${user.mail}>`,
              }))}
              placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
              name="forward"
            />
          </CCol>
          <RFFCFormSwitch name="DeleteUser" label="Delete user" />
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Review and Confirm" description="Confirm the settings to apply">
        <center>
          <h3 className="text-primary">Step 4</h3>
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
            <CCallout color="success">
              {postResults.data.Results.map((message, idx) => {
                return <li key={idx}>{message}</li>
              })}
            </CCallout>
          )}
          {!postResults.isSuccess && (
            <FormSpy>
              {(props) => (
                /* eslint-disable react/prop-types */ <>
                  <CRow>
                    <CCol md={{ span: 6, offset: 3 }}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Selected Tenant:</h5>
                          {tenantDomain}
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Selected User:</h5>
                          {props.values.User.value}
                        </CListGroupItem>
                      </CListGroup>
                      <hr />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={{ span: 6, offset: 3 }}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Revoke Sessions
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RevokeSessions ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove Licenses
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RemoveLicenses ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Convert to Shared
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.ConvertToShared ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Disable Sign-in
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.DisableSignIn ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Reset Password
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.ResetPass ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove from all groups
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RemoveGroups ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Hide from Global Address List
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.HideFromGAL ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Set Out of Office
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.OOO ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Give another user access to the mailbox with automap
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.AccessAutomap ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Give another user access to the mailbox without automap
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.AccessNoAutomap ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Give another user access to OneDrive
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.OnedriveAccess ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Forward all e-mail to another user
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.forward ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                      </CListGroup>
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

export default OffboardingWizard
