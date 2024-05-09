import React, { useState } from 'react'
import { CButton, CCallout, CCol, CForm, CRow, CSpinner, CTooltip } from '@coreui/react'
import { useSelector } from 'react-redux'
import { Field, Form, FormSpy } from 'react-final-form'
import {
  Condition,
  RFFCFormInput,
  RFFCFormRadio,
  RFFCFormRadioList,
  RFFCFormSwitch,
  RFFSelectSearch,
} from 'src/components/forms'
import {
  useGenericGetRequestQuery,
  useLazyGenericGetRequestQuery,
  useLazyGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch, faEdit, faEye } from '@fortawesome/free-solid-svg-icons'
import { CippContentCard, CippPage, CippPageList } from 'src/components/layout'
import { CellTip } from 'src/components/tables/CellGenericFormat'
import 'react-datepicker/dist/react-datepicker.css'
import { CippActionsOffcanvas, ModalService, TenantSelector } from 'src/components/utilities'
import arrayMutators from 'final-form-arrays'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { useListUsersQuery } from 'src/store/api/users'
import { useListConditionalAccessPoliciesQuery } from 'src/store/api/tenants'
import GDAPRoles from 'src/data/GDAPRoles'

const DeployJITAdmin = () => {
  const [ExecuteGetRequest, getResults] = useLazyGenericGetRequestQuery()
  const currentDate = new Date()
  const [startDate, setStartDate] = useState(currentDate)
  const [endDate, setEndDate] = useState(currentDate)

  const tenantDomain = useSelector((state) => state.app.currentTenant.defaultDomainName)
  const [refreshState, setRefreshState] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const onSubmit = (values) => {
    const startTime = Math.floor(startDate.getTime() / 1000)
    const endTime = Math.floor(endDate.getTime() / 1000)
    const shippedValues = {
      tenantFilter: tenantDomain,
      UserId: values.UserId?.value,
      PolicyId: values.PolicyId?.value,
      StartDate: startTime,
      EndDate: endTime,
      ExpireAction: values?.expireAction ?? 'delete',
    }
    genericPostRequest({ path: '/api/ExecJITAdmin', values: shippedValues }).then((res) => {
      setRefreshState(res.requestId)
    })
  }

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  return (
    <CippPage title={`Add JIT Admin`} tenantSelector={false}>
      <>
        <CRow>
          <CCol md={4}>
            <CippContentCard title="Add JIT Admin" icon={faEdit}>
              <Form
                onSubmit={onSubmit}
                mutators={{
                  ...arrayMutators,
                }}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <p>
                        JIT Admin creates an account that is usable for a specific period of time.
                        Enter a username, select admin roles, date range and expiration action.
                      </p>
                      <CRow className="mb-3">
                        <CCol>
                          <label className="mb-2">Tenant</label>
                          <Field name="tenantFilter">{(props) => <TenantSelector />}</Field>
                        </CCol>
                      </CRow>
                      <CRow>
                        <hr />
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFCFormRadioList
                            name="useraction"
                            options={[
                              { value: 'create', label: 'New User' },
                              { value: 'select', label: 'Existing User' },
                            ]}
                            validate={false}
                            inline={true}
                            className=""
                          />
                        </CCol>
                      </CRow>
                      <Condition when="useraction" is="create">
                        <CRow className="mb-3">
                          <CCol>
                            <RFFCFormInput label="User Principal Name" name="UserPrincipalName" />
                          </CCol>
                        </CRow>
                      </Condition>
                      <Condition when="useraction" is="select">
                        <CRow className="mb-3">
                          <CCol>
                            <RFFSelectSearch
                              label={'Users in ' + tenantDomain}
                              values={users?.map((user) => ({
                                value: user.id,
                                name: `${user.displayName} <${user.userPrincipalName}>`,
                              }))}
                              placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                              name="UserId"
                              isLoading={usersIsFetching}
                            />
                          </CCol>
                        </CRow>
                      </Condition>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label="Administrative Roles"
                            values={GDAPRoles?.map((role) => ({
                              value: role.ObjectId,
                              name: role.Name,
                            }))}
                            multi={true}
                            placeholder="Select Roles"
                            name="AdminRoles"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <label>Scheduled Start Date</label>
                          <DatePicker
                            className="form-control"
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
                            className="form-control"
                            selected={endDate}
                            showTimeSelect
                            timeFormat="HH:mm"
                            timeIntervals={15}
                            dateFormat="Pp"
                            onChange={(date) => setEndDate(date)}
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <RFFSelectSearch
                            label="Expiration Action"
                            values={[
                              { value: 'removeroles', name: 'Remove Admin Roles' },
                              { value: 'disable', name: 'Disable' },
                              { value: 'delete', name: 'Delete' },
                            ]}
                            placeholder="Select action for when JIT expires"
                            name="expireAction"
                          />
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol md={6}>
                          <CButton type="submit" disabled={submitting}>
                            Add JIT Admin
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

export default DeployJITAdmin
