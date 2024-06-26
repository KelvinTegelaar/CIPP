import React, { useState } from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner } from '@coreui/react'
import { useSelector } from 'react-redux'
import { Field, Form } from 'react-final-form'
import { RFFSelectSearch } from 'src/components/forms'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { faCircleNotch, faEdit } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage } from 'src/components/layout'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useGenericGetRequestQuery, useListConditionalAccessPoliciesQuery } from 'src/store/api/users'

const ListClassicAlerts = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const currentDate = new Date()
  const [startDate, setStartDate] = useState(currentDate)
  const [endDate, setEndDate] = useState(currentDate)
  const [errorMessage, setErrorMessage] = useState('') // Added state for error message

  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    if (startDate.getTime() === endDate.getTime()) { // Added validation
      setErrorMessage('Start and end times cannot be the same.')
      return
    }
    
    if (endDate.getTime() < startDate.getTime()) { // Added validation for end date
      setErrorMessage('End time cannot be before start time.')
      return
    }

    setErrorMessage('') // Clear error message if validation passes
    const startTime = Math.floor(startDate.getTime() / 1000)
    const endTime = Math.floor(endDate.getTime() / 1000)
    const shippedValues = {
      tenantFilter: tenantDomain,
      UserId: values.UserId?.value,
      PolicyId: values.PolicyId?.value,
      StartDate: startTime,
      EndDate: endTime,
      vacation: true,
    }
    genericPostRequest({ path: '/api/ExecCAExclusion', values: shippedValues }).then((res) => {
      setRefreshState(res.requestId)
    })
  }

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      TenantFilter: tenantDomain,
      Endpoint: 'users',
      $select: 'id,displayName,userPrincipalName,accountEnabled',
      $count: true,
      $top: 999,
      $orderby: 'displayName',
    },
  })

  const {
    data: caPolicies = [],
    isFetching: caIsFetching,
    error: caError,
  } = useListConditionalAccessPoliciesQuery({ domain: tenantDomain })

  return (
    <CippPage title={`Add Schedule`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={4}>
            <CippContentCard title="Add Vacation Mode" icon={faEdit}>
              <Form
                onSubmit={onSubmit}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <p>
                        Vacation mode adds a scheduled tasks to add and remove users from CA
                        exclusions for a specific period of time. Select the CA policy and the date
                        range.
                      </p>
                      {errorMessage && ( // Added error message display
                        <CCallout color="danger">
                          {errorMessage}
                        </CCallout>
                      )}
                      <CRow className="mb-3">
                        <CCol>
                          <label>Tenant</label>
                          <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                        </CCol>
                      </CRow>
                      <CRow>
                        <hr />
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Users in ' + tenantDomain}
                            values={users?.Results?.map((user) => ({
                              value: user.id,
                              name: `${user.displayName} <${user.userPrincipalName}>`,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="UserId"
                            isLoading={usersIsFetching}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label={'Conditional Access Policies in ' + tenantDomain}
                            values={caPolicies?.map((ca) => ({
                              value: ca.id,
                              name: `${ca.displayName}`,
                            }))}
                            placeholder={!caIsFetching ? 'Select policy' : 'Loading...'}
                            name="PolicyId"
                            isLoading={caIsFetching}
                          />
                        </CCol>
                      </CRow>
                      <CCol>
                        <label>Scheduled Start Date</label>
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
                        <label>Scheduled End Date</label>
                        <DatePicker
                          className="form-control mb-3"
                          selected={endDate}
                          showTimeSelect
                          timeFormat="HH:mm"
                          timeIntervals={15}
                          dateFormat="Pp"
                          onChange={(date) => setEndDate(date)}
                        />
                      </CCol>
                      <CRow>
                        <CCol md={6}>
                          <CButton type="submit" disabled={submitting}>
                            Set Vacation Mode
                            {postResults.isFetching && (
                              <FontAwesomeIcon
                                icon={faCircleNotch}
                                spin
                                className="ms-2"
                                size="1x"
                              />
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CCallout color="success">
                          <li>{postResults.data.Results}</li>
                        </CCallout>
                      )}
                      {getResults.isFetching && (
                        <CCallout color="info">
                          <CSpinner>Loading</CSpinner>
                        </CCallout>
                      )}
                      {getResults.isSuccess && (
                        <CCallout color="info">{getResults.data?.Results}</CCallout>
                      )}
                      {getResults.isError && (
                        <CCallout color="danger">
                          Could not connect to API: {getResults.error.message}
                        </CCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            </CippContentCard>
          </CCol>
        </CRow>
      </>
    </CippPage>
  )
}

export default ListClassicAlerts
