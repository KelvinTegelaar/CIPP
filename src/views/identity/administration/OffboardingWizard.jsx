import React, { useState } from 'react'
import { CCallout, CCol, CListGroup, CListGroupItem, CRow, CSpinner, CTooltip } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import {
  Condition,
  RFFCFormCheck,
  RFFCFormInput,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
import { TenantSelector } from 'src/components/utilities'
import { useListUsersQuery } from 'src/store/api/users'
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

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
  const currentDate = new Date()
  const [startDate, setStartDate] = useState(currentDate)

  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  const {
    data: recipients = [],
    isFetching: recipientsIsFetching,
    error: recipientsError,
  } = useGenericGetRequestQuery({ path: `/api/ListRecipients?tenantFilter=${tenantDomain}` })

  const currentSettings = useSelector((state) => state.app)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
    const unixTime = Math.floor(startDate.getTime() / 1000)
    const shippedValues = {
      TenantFilter: tenantDomain,
      OOO: values.OOO ? values.OOO : '',
      forward: values.forward ? values.forward.value : '',
      OnedriveAccess: values.OnedriveAccess ? values.OnedriveAccess : '',
      AccessNoAutomap: values.AccessNoAutomap ? values.AccessNoAutomap : '',
      AccessAutomap: values.AccessAutomap ? values.AccessAutomap : '',
      ConvertToShared: values.ConvertToShared,
      HideFromGAL: values.HideFromGAL,
      DisableSignIn: values.DisableSignIn,
      RemoveGroups: values.RemoveGroups,
      RemoveLicenses: values.RemoveLicenses,
      ResetPass: values.ResetPass,
      RevokeSessions: values.RevokeSessions,
      user: values.User,
      deleteuser: values.DeleteUser,
      removeRules: values.RemoveRules,
      removeMobile: values.RemoveMobile,
      keepCopy: values.keepCopy,
      removePermissions: values.removePermissions,
      Scheduled: values.Scheduled?.enabled ? { enabled: true, date: unixTime } : { enabled: false },
      PostExecution: values.Scheduled?.enabled
        ? { webhook: values.webhook, psa: values.psa, email: values.email }
        : '',
    }

    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ path: '/api/ExecOffboardUser', values: shippedValues })
  }

  return (
    <CippWizard
      initialValues={currentSettings?.userSettingsDefaults}
      onSubmit={handleSubmit}
      wizardTitle="Offboarding Wizard"
    >
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
            multi
            label={'Users in ' + tenantDomain}
            values={users?.map((user) => ({
              value: user.userPrincipalName,
              name: `${user.displayName} <${user.userPrincipalName}>`,
            }))}
            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
            name="User"
          />
          {usersError && <span>Failed to load list of users</span>}
          <FormSpy>
            {/* eslint-disable react/prop-types */}
            {(props) => (
              <>
                {props.values.User?.length >= 3 && (
                  <CCallout color="warning">A maximum of three users is recommend.</CCallout>
                )}
              </>
            )}
          </FormSpy>
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page
        initialvalues={currentSettings?.userSettingsDefaults}
        title="Offboarding Settings"
        description="Select the offboarding options."
      >
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5>Choose offboarding options</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow>
            <CCol className="mb-3" md={6}>
              <RFFCFormSwitch name="RevokeSessions" label="Revoke all sessions" />
              <RFFCFormSwitch name="RemoveMobile" label="Remove all Mobile Devices" />
              <RFFCFormSwitch name="RemoveRules" label="Remove all Rules" />
              <RFFCFormSwitch name="RemoveLicenses" label="Remove Licenses" />
              <RFFCFormSwitch name="removePermissions" label="Remove users mailbox permissions" />
              <RFFCFormSwitch name="ConvertToShared" label="Convert to Shared Mailbox" />
              <RFFCFormSwitch name="DisableSignIn" label="Disable Sign in" />
              <RFFCFormSwitch name="ResetPass" label="Reset Password" />
              <RFFCFormSwitch name="RemoveGroups" label="Remove from all groups" />
              <RFFCFormSwitch name="HideFromGAL" label="Hide from Global Address List" />
              <RFFCFormSwitch name="DeleteUser" label="Delete user" />
            </CCol>
            <CCol className="mb-3" md={6}>
              <RFFCFormInput
                name="OOO"
                label="Out of Office"
                type="text"
                placeholder="leave blank to not set"
              />
              <RFFSelectSearch
                label="Give other user full access on mailbox without automapping"
                multi
                values={users
                  ?.filter((x) => x.mail)
                  .map((user) => ({
                    value: user.mail,
                    name: `${user.displayName} <${user.mail}>`,
                  }))}
                placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                name="AccessNoAutomap"
              />
              <RFFSelectSearch
                label="Give other user full access on mailbox with automapping"
                multi
                values={users
                  ?.filter((x) => x.mail)
                  .map((user) => ({
                    value: user.mail,
                    name: `${user.displayName} <${user.mail}>`,
                  }))}
                placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                name="AccessAutomap"
              />
              <RFFSelectSearch
                label="Give other user full access on Onedrive"
                multi
                values={users
                  ?.filter((x) => x.mail)
                  .map((user) => ({
                    value: user.mail,
                    name: `${user.displayName} <${user.mail}>`,
                  }))}
                placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                name="OnedriveAccess"
              />
              <RFFSelectSearch
                label="Forward email to other user"
                values={recipients
                  ?.filter((x) => x.mail)
                  .map((user) => ({
                    value: user.mail,
                    name: `${user.displayName} <${user.mail}>`,
                  }))}
                placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                name="forward"
              />
              <RFFCFormCheck
                name="keepCopy"
                label="Keep a copy of the forwarded mail in the source mailbox"
              />
            </CCol>
          </CRow>
          <hr className="my-4" />
          <CRow>
            <CCol>
              <RFFCFormSwitch name="Scheduled.enabled" label="Schedule this offboarding" />
            </CCol>
          </CRow>
          <CRow>
            <Condition when="Scheduled.enabled" is={true}>
              <CCol xs={2}>
                <label>Scheduled Offboarding Date</label>
                <DatePicker
                  className="form-control mb-3"
                  selected={startDate}
                  showTimeSelect
                  timeFormat="HH:mm"
                  timeIntervals={15}
                  dateFormat="Pp"
                  onChange={(date) => setStartDate(date)}
                />
              </CCol>
              <CCol>
                <label>Send results to</label>
                <RFFCFormSwitch name="webhook" label="Webhook" />
                <RFFCFormSwitch name="email" label="E-mail" />
                <RFFCFormSwitch name="psa" label="PSA" />
              </CCol>
            </Condition>
          </CRow>
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

                        {props.values.User.map((user) => (
                          <CListGroupItem
                            key={user.value}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <h5 className="mb-0">Selected User:</h5>
                            <span>
                              {users.find((x) => x.userPrincipalName === user.value)
                                .onPremisesSyncEnabled === true ? (
                                <CTooltip content="This user is AD sync enabled, offboarding will fail for some steps">
                                  <FontAwesomeIcon
                                    icon="triangle-exclamation"
                                    color="yellow"
                                    className="me-2"
                                  />
                                </CTooltip>
                              ) : (
                                ''
                              )}
                              {user.value}
                            </span>
                          </CListGroupItem>
                        ))}
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
                          Remove all mobile devices
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RemoveMobile ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove all mailbox rules
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.RemoveRules ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Remove all mailbox permissions
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.removePermissions ? faCheck : faTimes}
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
