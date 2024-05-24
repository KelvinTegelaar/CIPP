import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  CBadge,
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CForm,
  CLink,
  CRow,
  CSpinner,
} from '@coreui/react'
import { Form } from 'react-final-form'
import { RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms/index.js'
import React, { useEffect } from 'react'
import { CippCallout } from 'src/components/layout/index.js'
import { CippCodeBlock } from 'src/components/utilities'
import { CellDate } from 'src/components/tables'

/**
 * Sets the notification settings.
 * @returns {JSX.Element} The notification settings component.
 */
export function SettingsPartner() {
  const webhookConfig = useGenericGetRequestQuery({
    path: '/api/ExecPartnerWebhook',
    params: { Action: 'ListSubscription' },
  })
  const webhookEvents = useGenericGetRequestQuery({
    path: '/api/ExecPartnerWebhook',
    params: { Action: 'ListEventTypes' },
  })
  const [submitWebhook, webhookCreateResult] = useLazyGenericPostRequestQuery()
  const [sendTest, sendTestResult] = useLazyGenericGetRequestQuery()
  const [checkTest, checkTestResult] = useLazyGenericGetRequestQuery()

  const onSubmit = (values) => {
    const shippedValues = {
      EventType: values?.EventType?.map((event) => event.value),
      standardsExcludeAllTenants: values?.standardsExcludeAllTenants,
    }
    submitWebhook({
      path: '/api/ExecPartnerWebhook?Action=CreateSubscription',
      values: shippedValues,
    }).then((res) => {
      webhookConfig.refetch()
    })
  }

  useEffect(() => {
    if (
      sendTestResult.isSuccess &&
      sendTestResult?.data?.Results?.correlationId &&
      !checkTestResult?.data?.Results?.results
    ) {
      setTimeout(
        checkTest({
          path: '/api/ExecPartnerWebhook',
          params: {
            Action: 'ValidateTest',
            CorrelationId: sendTestResult?.data?.Results?.correlationId,
          },
        }),
        1000,
      )
    }
  }, [sendTestResult, checkTest, checkTestResult])

  return (
    <CCard className="h-100">
      <CCardHeader></CCardHeader>
      <CCardBody>
        <>
          <CButton
            size="sm"
            onClick={() => webhookConfig.refetch()}
            className="mb-2"
            disabled={webhookConfig.isFetching}
          >
            {webhookConfig.isFetching ? (
              <>
                <CSpinner className="me-2" size="sm" /> Loading...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon="sync" className="me-2" />
                Refresh
              </>
            )}
          </CButton>

          {!webhookConfig.isFetching && webhookConfig.error && (
            <CippCallout color="danger">Error loading data</CippCallout>
          )}
          {webhookConfig.isSuccess && (
            <>
              <h3 className="underline mb-5"> Webhook Configuration</h3>
              <CRow>
                <CCol sm={12} md={6} lg={8} className="mb-3">
                  Subscribe to Microsoft Partner center webhooks to enable automatic tenant
                  onboarding and alerting. Updating the settings will replace any existing webhook
                  subscription with one pointing to CIPP. Refer to the{' '}
                  <CLink
                    href="https://learn.microsoft.com/en-us/partner-center/developer/partner-center-webhooks"
                    target="_blank"
                  >
                    Microsoft Partner Center documentation
                  </CLink>{' '}
                  for more information on the webhook types.
                </CCol>
              </CRow>
              <CRow>
                <CCol sm={12} md={6} className="mb-3">
                  <p className="fw-lighter">Webhook URL</p>
                  <CippCodeBlock
                    code={webhookConfig?.data?.Results?.webhookUrl ?? 'No webhook URL found'}
                    language="plain"
                    showLineNumbers={false}
                  />
                </CCol>
                <CCol sm={12} md={6} className="mb-3">
                  <p className="fw-lighter">Last Updated</p>
                  <CellDate
                    cell={webhookConfig?.data?.Results?.lastModifiedTimestamp}
                    format="short"
                  />
                </CCol>
                <CCol sm={12} md={12} className="mb-3">
                  <p className="fw-lighter">Subscribed Events</p>
                  <Form
                    onSubmit={onSubmit}
                    initialValues={{
                      EventType: webhookConfig?.data?.Results?.webhookEvents.map((event) => ({
                        label: event,
                        value: event,
                      })),
                      standardsExcludeAllTenants:
                        webhookConfig?.data?.Results?.standardsExcludeAllTenants,
                    }}
                    render={({ handleSubmit }) => (
                      <>
                        <CForm onSubmit={handleSubmit}>
                          <RFFSelectSearch
                            name="EventType"
                            label="Event Types"
                            values={webhookEvents.data?.Results?.map((event) => ({
                              name: event,
                              value: event,
                            }))}
                            multi={true}
                            refreshFunction={() => webhookEvents.refetch()}
                            helpText="Select the events you want to receive notifications for."
                          />
                          <RFFCFormSwitch
                            name="standardsExcludeAllTenants"
                            helpText='Enabling this feature excludes tenants from any top-level
                                      "All Tenants" standard. This means that only the standards you
                                      explicitly set for this tenant will be applied.'
                            label="Exclude onboarded tenants from top-level standards"
                            className="mt-3"
                          />
                          <CButton
                            type="submit"
                            color="primary"
                            className="my-3"
                            disabled={webhookCreateResult.isFetching}
                          >
                            {webhookCreateResult.isFetching ? (
                              <>
                                <CSpinner size="sm" className="me-2" />
                                Saving...
                              </>
                            ) : (
                              'Save'
                            )}
                          </CButton>
                        </CForm>
                      </>
                    )}
                  />
                  {webhookCreateResult.isSuccess && (
                    <CippCallout color="info" dismissible>
                      {webhookCreateResult?.data?.Results}
                    </CippCallout>
                  )}
                </CCol>
              </CRow>
              <h3 className="underline mb-5">Webhook Test</h3>
              <CRow>
                <CCol sm={12} md={12} className="mb-3">
                  <CButton
                    className="me-3"
                    onClick={() =>
                      sendTest({
                        path: '/api/ExecPartnerWebhook',
                        params: { Action: 'SendTest' },
                      })
                    }
                  >
                    {sendTestResult.isFetching ? (
                      <>
                        <CSpinner size="sm" className="me-2" />
                        Running Test...
                      </>
                    ) : (
                      'Start Test'
                    )}
                  </CButton>
                  {checkTestResult.isFetching && !checkTestResult?.data?.Results?.result && (
                    <>
                      <CSpinner size="sm" className="me-2" /> Waiting for results
                    </>
                  )}
                  {sendTestResult.isSuccess && sendTestResult?.data?.Results?.code && (
                    <>
                      <FontAwesomeIcon icon="times-circle" color="red" className="me-2" /> Error{' '}
                      {sendTestResult?.data?.Results?.code} -{' '}
                      {sendTestResult?.data?.Results?.description}
                    </>
                  )}
                </CCol>
              </CRow>
              <CRow>
                {checkTestResult.isSuccess && (
                  <>
                    <CCol sm={12} md={4} className="mb-3">
                      <p className="fw-lighter">Status</p>
                      {checkTestResult?.data?.Results.status}
                    </CCol>
                    {Array.isArray(checkTestResult?.data?.Results?.results) && (
                      <>
                        <CCol sm={12} md={4} className="mb-3">
                          <p className="fw-lighter">Status Code</p>
                          <FontAwesomeIcon
                            icon={
                              checkTestResult?.data?.Results?.results[0].responseCode == 200
                                ? 'check-circle'
                                : 'times-circle'
                            }
                            color={
                              checkTestResult?.data?.Results?.results[0].responseCode == 200
                                ? 'green'
                                : 'red'
                            }
                            className="me-2"
                          />
                          {checkTestResult?.data?.Results?.results[0].responseCode}
                        </CCol>
                        {checkTestResult?.data?.Results?.results[0].responseMessage !== '' && (
                          <CCol sm={12} md={4} className="mb-3">
                            <p className="fw-lighter">Response Message</p>
                            {checkTestResult.data.Results.results[0].responseMessage}
                          </CCol>
                        )}
                        <CCol sm={12} md={4} className="mb-3">
                          <p className="fw-lighter">Date/Time</p>
                          <CellDate
                            cell={Date(
                              Date.parse(
                                checkTestResult?.data?.Results?.results[0].dateTimeUtc + 'Z',
                              ),
                            ).toLocaleString()}
                            format="short"
                          />
                        </CCol>
                      </>
                    )}
                  </>
                )}
              </CRow>
            </>
          )}
        </>
      </CCardBody>
    </CCard>
  )
}
