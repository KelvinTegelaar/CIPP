import React, { useState } from 'react'
import PropTypes from 'prop-types'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CRow,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import { CippOffcanvas, TenantSelector } from '.'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { Field, Form, FormSpy } from 'react-final-form'
import arrayMutators from 'final-form-arrays'
import {
  RFFCFormInput,
  RFFCFormInputArray,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
import { useSelector } from 'react-redux'
import { useGenericGetRequestQuery, useLazyGenericPostRequestQuery } from 'src/store/api/app'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

export default function CippScheduleOffcanvas({
  state: visible,
  hideFunction,
  title,
  placement,
  ...props
}) {
  const currentDate = new Date()
  const [startDate, setStartDate] = useState(currentDate)
  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const taskName = `Scheduled Task ${currentDate.toLocaleString()}`
  const { data: availableCommands = [], isLoading: isLoadingcmd } = useGenericGetRequestQuery({
    path: 'api/ListFunctionParameters?Module=CIPPCore',
  })

  const recurrenceOptions = [
    { value: '0', name: 'Only once' },
    { value: '1', name: 'Every 1 day' },
    { value: '7', name: 'Every 7 days' },
    { value: '30', name: 'Every 30 days' },
    { value: '365', name: 'Every 365 days' },
  ]

  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const onSubmit = (values) => {
    const unixTime = Math.floor(startDate.getTime() / 1000)
    const shippedValues = {
      TenantFilter: tenantDomain,
      Name: values.taskName,
      Command: values.command,
      Parameters: values.parameters,
      ScheduledTime: unixTime,
      Recurrence: values.Recurrence,
      AdditionalProperties: values.additional,
      PostExecution: {
        Webhook: values.webhook,
        Email: values.email,
        PSA: values.psa,
      },
    }
    genericPostRequest({ path: '/api/AddScheduledItem', values: shippedValues }).then((res) => {
      setRefreshState(res.requestId)
      if (props.submitFunction) {
        props.submitFunction()
      }
    })
  }

  return (
    <CippOffcanvas
      placement={placement}
      title={title}
      visible={visible}
      hideFunction={hideFunction}
    >
      <CCard>
        <CCardHeader></CCardHeader>
        <CCardBody>
          <Form
            onSubmit={onSubmit}
            mutators={{
              ...arrayMutators,
            }}
            initialValues={{ ...props.initialValues }}
            render={({ handleSubmit, submitting, values }) => {
              return (
                <CForm onSubmit={handleSubmit}>
                  <CRow className="mb-3">
                    <CCol>
                      <label>Tenant</label>
                      <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <RFFCFormInput
                        type="text"
                        name="taskName"
                        label="Task Name"
                        firstValue={`Task ${currentDate.toLocaleString()}`}
                      />
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol>
                      <label>Scheduled Date</label>
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
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <RFFSelectSearch
                        values={recurrenceOptions}
                        name="Recurrence"
                        placeholder="Select a recurrence"
                        label="Recurrence"
                      />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <RFFSelectSearch
                        values={availableCommands.map((cmd) => ({
                          value: cmd.Function,
                          name: cmd.Function,
                        }))}
                        name="command"
                        placeholder={
                          isLoadingcmd ? (
                            <CSpinner size="sm" />
                          ) : (
                            'Select a command or report to execute.'
                          )
                        }
                        label="Command to execute"
                      />
                    </CCol>
                  </CRow>
                  <FormSpy>
                    {/* eslint-disable react/prop-types */}
                    {(props) => {
                      const selectedCommand = availableCommands.find(
                        (cmd) => cmd.Function === props.values.command?.value,
                      )
                      return (
                        <CRow className="mb-3">
                          <CCol>{selectedCommand?.Synopsis}</CCol>
                        </CRow>
                      )
                    }}
                  </FormSpy>
                  <CRow>
                    <FormSpy>
                      {/* eslint-disable react/prop-types */}
                      {(props) => {
                        const selectedCommand = availableCommands.find(
                          (cmd) => cmd.Function === props.values.command?.value,
                        )
                        let paramblock = null
                        if (selectedCommand) {
                          //if the command parameter type is boolean we use <RFFCFormCheck /> else <RFFCFormInput />.
                          const parameters = selectedCommand.Parameters
                          if (parameters.length > 0) {
                            paramblock = parameters.map((param, idx) => (
                              <CRow key={idx} className="mb-3">
                                <CTooltip
                                  content={
                                    param?.Description !== null
                                      ? param.Description
                                      : 'No Description'
                                  }
                                  placement="left"
                                >
                                  <CCol>
                                    {param.Type === 'System.Boolean' ||
                                    param.Type ===
                                      'System.Management.Automation.SwitchParameter' ? (
                                      <>
                                        <label>{param.Name}</label>
                                        <RFFCFormSwitch
                                          initialValue={false}
                                          name={`parameters.${param.Name}`}
                                          label={`True`}
                                        />
                                      </>
                                    ) : (
                                      <>
                                        {param.Type === 'System.Collections.Hashtable' ? (
                                          <RFFCFormInputArray
                                            name={`parameters.${param.Name}`}
                                            label={`${param.Name}`}
                                            key={idx}
                                          />
                                        ) : (
                                          <RFFCFormInput
                                            type="text"
                                            key={idx}
                                            name={`parameters.${param.Name}`}
                                            label={`${param.Name}`}
                                          />
                                        )}
                                      </>
                                    )}
                                  </CCol>
                                </CTooltip>
                              </CRow>
                            ))
                          }
                        }
                        return paramblock
                      }}
                    </FormSpy>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <RFFCFormInputArray name={`additional`} label="Additional Properties" />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol>
                      <label>Send results to</label>
                      <RFFCFormSwitch name="webhook" label="Webhook" />
                      <RFFCFormSwitch name="email" label="E-mail" />
                      <RFFCFormSwitch name="psa" label="PSA" />
                    </CCol>
                  </CRow>
                  <CRow className="mb-3">
                    <CCol md={6}>
                      <CButton type="submit" disabled={submitting}>
                        Add Schedule
                        {postResults.isFetching && (
                          <FontAwesomeIcon icon="circle-notch" spin className="ms-2" size="1x" />
                        )}
                      </CButton>
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
        </CCardBody>
      </CCard>
    </CippOffcanvas>
  )
}

CippScheduleOffcanvas.propTypes = {
  groups: PropTypes.array,
  placement: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  state: PropTypes.bool,
  hideFunction: PropTypes.func.isRequired,
}
