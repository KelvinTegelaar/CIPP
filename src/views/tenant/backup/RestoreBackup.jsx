import React, { useState } from 'react'
import { CCallout, CCol, CListGroup, CListGroupItem, CRow, CSpinner, CTooltip } from '@coreui/react'
import { Field, FormSpy } from 'react-final-form'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faExclamationTriangle, faTimes, faCheck } from '@fortawesome/free-solid-svg-icons'
import { useSelector } from 'react-redux'
import { CippCallout, CippWizard } from 'src/components/layout'
import PropTypes from 'prop-types'
import { Condition, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms'
import { TenantSelector } from 'src/components/utilities'
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
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
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const {
    data: currentBackups = [],
    isFetching: currentBackupsIsFetching,
    error: currentBackupsError,
  } = useGenericGetRequestQuery({
    path: `/api/ExecListBackup?TenantFilter=${tenantDomain}&Type=Scheduled`,
  })

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const handleSubmit = async (values) => {
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
      PostExecution: values.Scheduled?.enabled
        ? { webhook: values.webhook, psa: values.psa, email: values.email }
        : '',
    }

    //alert(JSON.stringify(values, null, 2))
    genericPostRequest({ path: '/api/ExecOffboardUser', values: shippedValues })
  }

  return (
    <CippWizard onSubmit={handleSubmit} wizardTitle="Backup Restore Wizard">
      <CippWizard.Page
        title="Tenant Choice"
        description="Choose the tenant to restore a backup for"
      >
        <center>
          <h3 className="text-primary">Step 1</h3>
          <h5 className="card-title mb-4">Choose a tenant</h5>
        </center>
        <hr className="my-4" />
        <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Select Backup" description="Select the backup to restore">
        <center>
          <h3 className="text-primary">Step 2</h3>
          <h5>Select the backup to restore</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <RFFSelectSearch
            multi={false}
            label={'Backups for ' + tenantDomain}
            values={currentBackups?.map((backup) => ({
              value: backup.RowKey,
              name: `${backup.RowKey}`,
            }))}
            placeholder={!currentBackupsIsFetching ? 'Select a backup' : 'Loading...'}
            name="User"
          />
          {currentBackupsError && <span>Failed to load list of Current Backups</span>}
        </div>
        <hr className="my-4" />
      </CippWizard.Page>
      <CippWizard.Page title="Restore Settings" description="Select the items to restore">
        <center>
          <h3 className="text-primary">Step 3</h3>
          <h5>Choose restore options</h5>
        </center>
        <hr className="my-4" />
        <div className="mb-2">
          <CRow>
            <CCol>
              <h3 className="underline mb-4">Identity</h3>
              <RFFCFormSwitch label="User List" />
              <RFFCFormSwitch label="Groups" />
              <h3 className="underline mb-4">Conditional Access</h3>
              <RFFCFormSwitch label="Conditional Access" />
              <RFFCFormSwitch label="Named Locations" />
              <RFFCFormSwitch label="Authentication Strengths" />
            </CCol>
            <CCol>
              <h3 className="underline mb-4">Intune</h3>
              <RFFCFormSwitch label="Intune Configuration Policies" />
              <RFFCFormSwitch label="Intune Compliance Policies" />
              <RFFCFormSwitch label="Intune Protection Policies" />
              <h3 className="underline mb-4">CIPP</h3>
              <RFFCFormSwitch label="Alerts Configuration" />
              <RFFCFormSwitch label="Standards Configuration" />
            </CCol>
          </CRow>
          <hr className="my-4" />
          <CRow>
            <CCol>
              <RFFCFormSwitch name="overwrite" label="Overwrite existing entries" />
            </CCol>
          </CRow>
          <Condition when="overwrite" is={true}>
            <CippCallout color="warning">
              <h5>Warning</h5>
              <p>
                Overwriting existing entries will remove the current settings and replace them with
                the backup settings. If you have selected to restore users, all properties will be
                overwritten with the backup settings.
              </p>

              <p>
                To prevent and skip already existing entries, deselect the setting from the list
                above, or disable overwrite.
              </p>
            </CippCallout>
          </Condition>
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
