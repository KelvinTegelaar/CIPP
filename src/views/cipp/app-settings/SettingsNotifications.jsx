import {
  useLazyExecNotificationConfigQuery,
  useLazyGenericPostRequestQuery,
  useLazyListNotificationConfigQuery,
} from 'src/store/api/app.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { CButton, CCol, CForm, CSpinner } from '@coreui/react'
import { Form, useForm } from 'react-final-form'
import { RFFCFormInput, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms/index.js'
import React from 'react'
import { CippCallout } from 'src/components/layout/index.js'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'

/**
 * Sets the notification settings.
 * @returns {JSX.Element} The notification settings component.
 */
export function SettingsNotifications() {
  const [configNotifications, notificationConfigResult] = useLazyExecNotificationConfigQuery()
  const [listNotification, notificationListResult] = useLazyListNotificationConfigQuery()
  const [generateAlert, generateAlertResult] = useLazyGenericPostRequestQuery()
  const generateTestAlert = (values) => {
    generateAlert({ path: 'api/ExecAddAlert', values: values })
  }

  const onSubmit = (values) => {
    configNotifications(values)
  }
  return (
    <CCol xs={6}>
      <CippButtonCard
        title="Notification Settings"
        titleType="big"
        CardButton={
          <>
            <CButton
              className="me-2"
              form="notificationform"
              disabled={notificationConfigResult.isFetching}
              type="submit"
            >
              Set Notification Settings
            </CButton>
            <CButton
              className="me-2"
              onClick={() =>
                generateTestAlert({ text: 'Manually Generated Test Alert', Severity: 'Alert' })
              }
              disabled={generateAlertResult.isFetching}
            >
              {generateAlertResult.isFetching ? (
                <CSpinner size="sm" className="me-2" />
              ) : (
                <>
                  {generateAlertResult.isSuccess && (
                    <FontAwesomeIcon icon={'check'} className="me-2" />
                  )}
                </>
              )}
              Generate Test Alert
            </CButton>
          </>
        }
        isFetching={notificationListResult.isFetching}
      >
        {notificationListResult.isUninitialized && listNotification()}
        {notificationListResult.isFetching ||
          (generateAlertResult.isFetching && (
            <FontAwesomeIcon icon={faCircleNotch} spin className="me-2" size="1x" />
          ))}
        {!notificationListResult.isFetching && notificationListResult.error && (
          <CippCallout color="danger">Error loading data</CippCallout>
        )}
        {notificationListResult.isSuccess && (
          <Form
            initialValuesEqual={() => true}
            initialValues={{
              ...notificationListResult.data,
              logsToInclude: notificationListResult.data?.logsToInclude?.map((m) => ({
                label: m,
                value: m,
              })),
              Severity: notificationListResult.data?.Severity?.map((s) => ({
                label: s,
                value: s,
              })),
            }}
            onSubmit={onSubmit}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm id="notificationform" onSubmit={handleSubmit}>
                  {notificationConfigResult.isFetching && (
                    <CippCallout color="success">
                      <CSpinner>Loading</CSpinner>
                    </CippCallout>
                  )}
                  {notificationConfigResult.isSuccess && !notificationConfigResult.isFetching && (
                    <CippCallout color="success" dismissible>
                      {notificationConfigResult.data?.Results}
                    </CippCallout>
                  )}
                  {notificationConfigResult.isError && !notificationConfigResult.isFetching && (
                    <CippCallout color="danger">
                      Could not connect to API: {notificationConfigResult.error.message}
                    </CippCallout>
                  )}
                  <CCol>
                    <CCol>
                      <RFFCFormInput
                        type="text"
                        name="email"
                        label="E-mail (Separate multiple E-mails with commas e.g.: matt@example.com, joe@sample.com)"
                      />
                    </CCol>
                    <CCol>
                      <RFFCFormInput type="text" name="webhook" label="Webhook" />
                    </CCol>
                    <CCol>
                      <RFFSelectSearch
                        multi={true}
                        label="Choose which logs you'd like to receive alerts from. This notification will be sent every 15 minutes."
                        name="logsToInclude"
                        values={[
                          { value: 'Updates', name: 'Updates Status' },
                          { value: 'Standards', name: 'All Standards' },
                          { value: 'TokensUpdater', name: 'Token Events' },
                          {
                            value: 'ExecDnsConfig',
                            name: 'Changing DNS Settings',
                          },
                          {
                            value: 'ExecExcludeLicenses',
                            name: 'Adding excluded licenses',
                          },
                          {
                            value: 'ExecExcludeTenant',
                            name: 'Adding excluded tenants',
                          },
                          { value: 'EditUser', name: 'Editing a user' },
                          {
                            value: 'ChocoApp',
                            name: 'Adding or deploying applications',
                          },
                          {
                            value: 'AddAPDevice',
                            name: 'Adding autopilot devices',
                          },
                          { value: 'EditTenant', name: 'Editing a tenant' },
                          { value: 'AddMSPApp', name: 'Adding an MSP app' },
                          { value: 'AddUser', name: 'Adding a user' },
                          { value: 'AddGroup', name: 'Adding a group' },
                          { value: 'NewTenant', name: 'Adding a tenant' },
                          {
                            value: 'ExecOffboardUser',
                            name: 'Executing the offboard wizard',
                          },
                        ]}
                      />
                    </CCol>
                    <CCol className="mb-3">
                      <RFFSelectSearch
                        multi={true}
                        label="Choose which severity of alert you want to be notified for."
                        name="Severity"
                        values={[
                          { value: 'Alert', name: 'Alert' },
                          { value: 'Error', name: 'Error' },
                          { value: 'Info', name: 'Info' },
                          { value: 'Warning', name: 'Warning' },
                          { value: 'Critical', name: 'Critical' },
                        ]}
                      />
                    </CCol>
                    <CCol>
                      <RFFCFormSwitch
                        name="onePerTenant"
                        label="Receive one email per tenant"
                        value={false}
                      />
                    </CCol>
                    <CCol>
                      <RFFCFormSwitch
                        name="sendtoIntegration"
                        label="Send notifications to configured integration(s)"
                        value={false}
                      />
                    </CCol>
                    <CCol>
                      <RFFCFormSwitch
                        name="includeTenantId"
                        label="Include Tenant ID in alerts"
                        value={false}
                      />
                    </CCol>
                  </CCol>
                </CForm>
              )
            }}
          />
        )}
        <small>
          Use the button below to save the changes, or generate a test alert. The test alert will be
          processed in a batch with other alerts
        </small>
      </CippButtonCard>
    </CCol>
  )
}
