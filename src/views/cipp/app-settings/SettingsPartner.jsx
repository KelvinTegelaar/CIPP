import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app.js'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
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
  CRow,
  CSpinner,
} from '@coreui/react'
import { Form, useForm } from 'react-final-form'
import { RFFCFormInput, RFFCFormSwitch, RFFSelectSearch } from 'src/components/forms/index.js'
import React, { useEffect, useState } from 'react'
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

  const onSubmit = (values) => {
    const shippedValues = {
      EventType: values?.EventType?.map((event) => event.value),
    }
    submitWebhook({
      path: '/api/ExecPartnerWebhook?Action=CreateSubscription',
      values: shippedValues,
    }).then((res) => {
      webhookConfig.refetch()
    })
  }

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
                <CCol sm={12} md={6} className="mb-3">
                  <p className="fw-lighter">Webhook URL</p>
                  <CippCodeBlock
                    code={webhookConfig?.data?.Results?.webhookUrl}
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
                <CCol sm={12} md={6} className="mb-3">
                  <p className="fw-lighter">Subscribed Events</p>
                  <Form
                    onSubmit={onSubmit}
                    initialValues={{
                      EventType: webhookConfig?.data?.Results?.webhookEvents.map((event) => ({
                        label: event,
                        value: event,
                      })),
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
                          <CButton
                            type="submit"
                            color="primary"
                            className="my-2"
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
            </>
          )}
        </>
      </CCardBody>
    </CCard>
  )
}
