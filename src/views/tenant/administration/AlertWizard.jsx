import React, { useState } from 'react'
import { CBadge, CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch, useSelector } from 'react-redux'
import { Field, Form, FormSpy } from 'react-final-form'
import { CippPage } from 'src/components/layout'
import { TenantSelector, TenantSelectorMultiple } from 'src/components/utilities'
import {
  Condition,
  RFFCFormInput,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms/RFFComponents'
import { useListTenantQuery } from 'src/store/api/tenants'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import CippButtonCard from 'src/components/contentcards/CippButtonCard'
import alertList from 'src/data/alerts.json'
import auditLogSchema from 'src/data/AuditLogSchema.json'
import auditLogTemplates from 'src/data/AuditLogTemplates.json'
import Skeleton from 'react-loading-skeleton'
import { required } from 'src/validators'

const AlertWizard = () => {
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [alertType, setAlertType] = useState(false)
  const [recommendedRecurrence, setRecommendedRecurrence] = useState()
  const [currentFormState, setCurrentFormState] = useState()
  const [selectedTenant, setSelectedTenant] = useState([])
  const { data: tenant = {}, isFetching, error, isSuccess } = useListTenantQuery(tenantDomain)

  const onSubmitAudit = (values) => {
    genericPostRequest({ path: '/api/addAlert', values }).then((res) => {})
  }

  const onSubmitScript = (values) => {
    //get current time as startDate, to the closest 15 minutes in the future
    const startDate = new Date()
    startDate.setMinutes(startDate.getMinutes() + 15 - (startDate.getMinutes() % 15))
    //unix time, minus a couple of seconds to ensure it runs after the current time
    const unixTime = Math.floor(startDate.getTime() / 1000) - 45
    const shippedValues = {
      TenantFilter: tenantDomain,
      Name: `${values.command.label} for ${tenantDomain}`,
      Command: { value: `Get-CIPPAlert${values.command.value.name}` },
      Parameters: { input: values.input },
      ScheduledTime: unixTime,
      Recurrence: values.Recurrence,
      PostExecution: {
        Webhook: values.webhook,
        Email: values.email,
        PSA: values.psa,
      },
    }
    genericPostRequest({ path: '/api/AddScheduledItem?hidden=true', values: shippedValues }).then(
      (res) => {},
    )
  }

  const initialValues = {
    ...tenant[0],
    ...currentFormState?.values,
    ...recommendedRecurrence,
  }
  const [auditFormState, setAuditFormState] = useState()

  const initialValuesAudit = {
    tenantFilter: [...selectedTenant],
    ...auditFormState,
  }
  const recurrenceOptions = [
    { value: '30m', name: 'Every 30 minutes' },
    { value: '1h', name: 'Every hour' },
    { value: '4h', name: 'Every 4 hours' },
    { value: '1d', name: 'Every 1 day' },
    { value: '7d', name: 'Every 7 days' },
    { value: '30d', name: 'Every 30 days' },
    { value: '365d', name: 'Every 365 days' },
  ]

  const presetValues = auditLogTemplates

  const getAuditLogSchema = (logbook) => {
    const common = auditLogSchema.Common
    const log = auditLogSchema[logbook]
    const combined = { ...common, ...log }
    return Object.keys(combined).map((key) => ({
      name: key,
      value: combined[key],
    }))
  }
  const [addedEvent, setAddedEvent] = React.useState(1)

  const getRecurrenceOptions = () => {
    const values = currentFormState?.values
    if (values) {
      const updatedRecurrenceOptions = recurrenceOptions.map((opt) => ({
        ...opt,
        name: opt.name.replace(' (Recommended)', ''),
      }))
      const recommendedValue = values.command?.value?.recommendedRunInterval
      const option = updatedRecurrenceOptions.find((opt) => opt.value === recommendedValue)
      if (option) {
        option.name += ' (Recommended)'
        if (option.value !== recommendedRecurrence?.Recurrence.value) {
          setRecommendedRecurrence({ Recurrence: { value: option.value, label: option.name } })
        }
      }
      return updatedRecurrenceOptions
    }
  }

  const setAuditForm = (e) => {
    const preset = presetValues.find((p) => p.value === e.value)
    setAuditFormState(preset.template)
    setAddedEvent(preset.template.conditions.length)
  }

  const dovalues = [
    //{ value: 'cippcommand', label: 'Execute a CIPP Command' },
    { value: 'becremediate', name: 'Execute a BEC Remediate' },
    { value: 'disableuser', name: 'Disable the user in the log entry' },
    // { value: 'generatelog', label: 'Generate a log entry' },
    { value: 'generatemail', name: 'Generate an email' },
    { value: 'generatePSA', name: 'Generate a PSA ticket' },
    { value: 'generateWebhook', name: 'Generate a webhook' },
  ]

  return (
    <CippPage title="Tenant Details" tenantSelector={false}>
      {isFetching && <Skeleton />}
      {!isFetching && (
        <>
          <CRow className="mb-3">
            <CCol md={3}>
              <CippButtonCard
                title="Audit Log Alert"
                CardButton={<CButton onClick={() => setAlertType('audit')}>Select</CButton>}
              >
                Select this option if you'd like to create an alert based on a received Microsoft
                Audit log.
              </CippButtonCard>
            </CCol>
            <CCol md={3}>
              <CippButtonCard
                title="Scripted CIPP Alert"
                CardButton={<CButton onClick={() => setAlertType('script')}>Select</CButton>}
              >
                Select this option if you'd like to setup an alert based on data processed by CIPP
              </CippButtonCard>
            </CCol>
          </CRow>
          {alertType === 'audit' && (
            <>
              <CRow className="mb-3">
                <CCol md={8}>
                  <CippButtonCard title="Tenant Selector" titleType="big">
                    Select the tenants you want to include in this Alert.
                    <TenantSelectorMultiple
                      onChange={(e) => setSelectedTenant(e)}
                      AllTenants={true}
                      valueisDomain={true}
                    />
                  </CippButtonCard>
                </CCol>
              </CRow>
              <Form
                onSubmit={onSubmitAudit}
                initialValues={{ ...initialValuesAudit }}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm id="auditAlertForm" onSubmit={handleSubmit}>
                      <CRow className="mb-3">
                        <CCol md={8}>
                          <CippButtonCard
                            title="Alert Criteria"
                            titleType="big"
                            CardButton={
                              <CButton type="submit" form="auditAlertForm">
                                {postResults.isFetching && <CSpinner size="sm" />} Save Alert
                              </CButton>
                            }
                          >
                            <CRow className="mb-3">
                              <CCol>
                                <RFFSelectSearch
                                  values={presetValues}
                                  name="preset"
                                  placeholder={'Select a preset'}
                                  label="Select an alert preset, or customize your own"
                                  onChange={(e) => setAuditForm(e)}
                                />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol>
                                <RFFSelectSearch
                                  values={[
                                    { value: 'Audit.AzureActiveDirectory', name: 'Azure AD' },
                                    { value: 'Audit.Exchange', name: 'Exchange' },
                                  ]}
                                  name="logbook"
                                  placeholder={'Select a log source'}
                                  label="Select the log you wish to receive the alert for"
                                  validate={required}
                                />
                              </CCol>
                            </CRow>
                            {addedEvent > 0 &&
                              [...Array(addedEvent)].map((e, i) => (
                                <CRow key={i} className="mb-3">
                                  <CRow>
                                    <CCol className="mb-3">
                                      <CBadge color="info">AND</CBadge>
                                    </CCol>
                                  </CRow>
                                  <CCol>
                                    <FormSpy>
                                      {(props) => {
                                        return (
                                          <RFFSelectSearch
                                            values={getAuditLogSchema(props.values?.logbook?.value)}
                                            name={`conditions.${i}.Property`}
                                            placeholder={'Select a property to alert on'}
                                            label="When property"
                                            validate={required}
                                          />
                                        )
                                      }}
                                    </FormSpy>
                                  </CCol>
                                  <CCol>
                                    <RFFSelectSearch
                                      values={[
                                        { value: 'eq', name: 'Equals to' },
                                        { value: 'like', name: 'Like' },
                                        { value: 'ne', name: 'Not Equals to' },
                                        { value: 'notmatch', name: 'Does not match' },
                                        { value: 'gt', name: 'Greater than' },
                                        { value: 'lt', name: 'Less than' },
                                        { value: 'in', name: 'In' },
                                        { value: 'notIn', name: 'Not In' },
                                      ]}
                                      name={`conditions.${i}.Operator`}
                                      placeholder={'Select a command'}
                                      label="is"
                                      validate={required}
                                    />
                                  </CCol>
                                  <CCol>
                                    <FormSpy>
                                      {(props) => {
                                        return (
                                          <>
                                            {props.values?.conditions?.[i]?.Property?.value ===
                                              'String' && (
                                              <RFFCFormInput
                                                name={`conditions.${i}.Input.value`}
                                                placeholder={'Select a command'}
                                                label={`Input`}
                                                validate={required}
                                              />
                                            )}
                                            {props.values?.conditions?.[
                                              i
                                            ]?.Property?.value.startsWith('List:') && (
                                              <RFFSelectSearch
                                                values={
                                                  auditLogSchema[
                                                    props.values?.conditions?.[i]?.Property?.value
                                                  ]
                                                }
                                                multi={
                                                  props.values?.conditions?.[i]?.Property?.multi
                                                }
                                                name={`conditions.${i}.Input`}
                                                placeholder={'Select an input from the list'}
                                                label="Input"
                                                validate={required}
                                              />
                                            )}
                                          </>
                                        )
                                      }}
                                    </FormSpy>
                                  </CCol>
                                </CRow>
                              ))}
                            <CRow>
                              <CCol className="mb-3" md={12}>
                                {addedEvent > 0 && (
                                  <CButton
                                    onClick={() => setAddedEvent(addedEvent - 1)}
                                    className={`circular-button`}
                                    title={'-'}
                                  >
                                    <FontAwesomeIcon icon={'minus'} />
                                  </CButton>
                                )}
                                {addedEvent < 4 && (
                                  <CButton
                                    onClick={() => setAddedEvent(addedEvent + 1)}
                                    className={`circular-button`}
                                    title={'+'}
                                  >
                                    <FontAwesomeIcon icon={'plus'} />
                                  </CButton>
                                )}
                              </CCol>
                              <CRow className="mb-3">
                                <CCol>
                                  <RFFSelectSearch
                                    values={dovalues}
                                    multi={true}
                                    name={`actions`}
                                    placeholder={
                                      'Select one action or multiple actions from the list'
                                    }
                                    label="Then perform the following action(s)"
                                  />
                                </CCol>
                              </CRow>
                              {postResults.isSuccess && (
                                <CCallout color="success">
                                  <li>{postResults.data.Results}</li>
                                </CCallout>
                              )}
                            </CRow>
                          </CippButtonCard>
                        </CCol>
                      </CRow>
                    </CForm>
                  )
                }}
              />
            </>
          )}
          {alertType === 'script' && (
            <>
              <CRow className="mb-3">
                <CCol md={8}>
                  <CippButtonCard title="Tenant Selector" titleType="big">
                    <p className="mb-3">Select the tenants you want to include in this Alert.</p>
                    <TenantSelector />
                  </CippButtonCard>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol md={8}>
                  <CippButtonCard
                    title="Alert Criteria"
                    titleType="big"
                    CardButton={
                      <CButton type="submit" form="alertForm">
                        Save Alert
                        {postResults.isFetching && (
                          <FontAwesomeIcon icon={faCircleNotch} spin className="ms-2" size="1x" />
                        )}
                      </CButton>
                    }
                  >
                    <Form
                      onSubmit={onSubmitScript}
                      initialValues={{ ...initialValues }}
                      render={({ handleSubmit, submitting, values }) => {
                        return (
                          <CForm id="alertForm" onSubmit={handleSubmit}>
                            <CRow className="mb-3">
                              <CCol>
                                <RFFSelectSearch
                                  values={alertList.map((cmd) => ({
                                    value: cmd,
                                    name: cmd.label,
                                  }))}
                                  name="command"
                                  placeholder={'Select a command'}
                                  label="What alerting script should run"
                                  validate={required}
                                />
                              </CCol>
                            </CRow>
                            <Condition when="command.value.requiresInput" is={true}>
                              <CRow className="mb-3">
                                <CCol>
                                  <FormSpy>
                                    {(props) => {
                                      return (
                                        <RFFCFormInput
                                          type="text"
                                          name="input"
                                          label={props.values.command.value.inputLabel}
                                          placeholder="Enter a value"
                                          validate={required}
                                        />
                                      )
                                    }}
                                  </FormSpy>
                                </CCol>
                              </CRow>
                            </Condition>
                            <CRow className="mb-3">
                              <CCol>
                                <FormSpy
                                  onChange={(formvalues) => setCurrentFormState(formvalues)}
                                />
                                <RFFSelectSearch
                                  values={getRecurrenceOptions()}
                                  name="Recurrence"
                                  placeholder="Select when this alert should run"
                                  label="When should the alert run"
                                />
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol>
                                <label>Receive Alert via: </label>
                                <RFFCFormSwitch name="webhook" label="Webhook" />
                                <RFFCFormSwitch name="email" label="E-mail" />
                                <RFFCFormSwitch name="psa" label="PSA" />
                              </CCol>
                            </CRow>
                            {postResults.isSuccess && (
                              <CCallout color="success">
                                <li>{postResults.data.Results}</li>
                              </CCallout>
                            )}
                          </CForm>
                        )
                      }}
                    />
                  </CippButtonCard>
                </CCol>
              </CRow>
            </>
          )}
        </>
      )}
    </CippPage>
  )
}

export default AlertWizard
