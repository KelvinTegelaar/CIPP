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

  const handleSubmit = (values) => {
    const startDate = new Date()
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45
    const shippedValues = {
      TenantFilter: tenantDomain,
      Name: `CIPP Restore ${tenantDomain}`,
      Command: { value: `New-CIPPRestore` },
      Parameters: { Type: 'Scheduled', RestoreValues: { ...values } },
      ScheduledTime: unixTime,
      PostExecution: {
        Webhook: values.webhook,
        Email: values.email,
        PSA: values.psa,
      },
    }
    genericPostRequest({ path: '/api/AddScheduledItem', values: shippedValues }).then((res) => {})
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
            name="backup"
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
              <RFFCFormSwitch name="users" label="User List" />
              <RFFCFormSwitch name="groups" label="Groups" />
              <h3 className="underline mb-4">Conditional Access</h3>
              <RFFCFormSwitch name="ca" label="Conditional Access Configuration" />
            </CCol>
            <CCol>
              <h3 className="underline mb-4">Intune</h3>
              <RFFCFormSwitch name="intuneconfig" label="Intune Configuration Policies" />
              <RFFCFormSwitch name="intunecompliance" label="Intune Compliance Policies" />
              <RFFCFormSwitch name="intuneprotection" label="Intune Protection Policies" />
              <h3 className="underline mb-4">CIPP</h3>
              <RFFCFormSwitch name="CippWebhookAlerts" label="Webhook Alerts Configuration" />
              <RFFCFormSwitch name="CippScriptedAlerts" label="Scripted Alerts Configuration" />
              <RFFCFormSwitch name="CippStandards" label="Standards Configuration" />
            </CCol>
          </CRow>
          <hr className="my-4" />
          <CRow>
            <CCol>
              <RFFCFormSwitch name="overwrite" label="Overwrite existing entries" />
            </CCol>
            <Condition when="overwrite" is={true}>
              <CippCallout color="warning">
                <h5>Warning</h5>
                <p>
                  Overwriting existing entries will remove the current settings and replace them
                  with the backup settings. If you have selected to restore users, all properties
                  will be overwritten with the backup settings.
                </p>

                <p>
                  To prevent and skip already existing entries, deselect the setting from the list
                  above, or disable overwrite.
                </p>
              </CippCallout>
            </Condition>
          </CRow>
          <hr className="my-4" />
          <CRow>
            <CCol>
              <label>Send Restore results to:</label>
              <RFFCFormSwitch name="webhook" label="Webhook" />
              <RFFCFormSwitch name="email" label="E-mail" />
              <RFFCFormSwitch name="psa" label="PSA" />
            </CCol>
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
          {postResults.isSuccess && <CCallout color="success">{postResults.data.Results}</CCallout>}
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
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          <h5 className="mb-0">Selected Backup:</h5>
                          {props.values.backup.value}
                        </CListGroupItem>
                      </CListGroup>
                      <hr />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol md={{ span: 6, offset: 3 }}>
                      <CListGroup flush>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Overwrite existing configuration
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.overwrite ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Send results to Webhook
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.webhook ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Send results to E-Mail
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.email ? faCheck : faTimes}
                          />
                        </CListGroupItem>
                        <CListGroupItem className="d-flex justify-content-between align-items-center">
                          Send results to PSA
                          <FontAwesomeIcon
                            color="#f77f00"
                            size="lg"
                            icon={props.values.psa ? faCheck : faTimes}
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
