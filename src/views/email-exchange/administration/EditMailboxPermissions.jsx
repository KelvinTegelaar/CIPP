import React, { useEffect, useRef, useState } from 'react'
import {
  CButton,
  CCallout,
  CCard,
  CCardBody,
  CCardHeader,
  CCardTitle,
  CCol,
  CNav,
  CNavItem,
  CTabContent,
  CTabPane,
  CForm,
  CRow,
  CSpinner,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { Form, Field } from 'react-final-form'
import { RFFSelectSearch, RFFCFormCheck, RFFCFormInput, RFFCFormSwitch } from 'src/components/forms'
import { ModalService } from 'src/components/utilities'
import {
  useLazyGenericPostRequestQuery,
  useLazyGenericGetRequestQuery,
  useGenericGetRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useListMailboxDetailsQuery, useListMailboxPermissionsQuery } from 'src/store/api/mailbox'
import { CellBoolean, CippDatatable } from 'src/components/tables'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import PropTypes from 'prop-types'

const formatter = (cell, warning = false, reverse = false, colourless = false) =>
  CellBoolean({ cell, warning, reverse, colourless })

function Lazy({ visible, children }) {
  const rendered = useRef(visible)

  if (visible && !rendered.current) {
    rendered.current = true
  }

  if (!rendered.current) return null

  return <div style={{ display: visible ? 'block' : 'none' }}>{children}</div>
}

Lazy.propTypes = {
  visible: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
}

const MailboxSettings = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const [active, setActive] = useState(1)
  const columnsCal = [
    {
      name: 'User',
      selector: (row) => row['User'],
      sortable: true,
      wrap: true,
      cell: (row) => row['User'],
      exportSelector: 'User',
      maxWidth: '150px',
    },
    {
      name: 'AccessRights',
      selector: (row) => row['AccessRights'],
      sortable: true,
      wrap: true,
      cell: (row) => row['AccessRights'],
      exportSelector: 'AccessRights',
      maxWidth: '150px',
    },
    {
      name: 'Identity',
      selector: (row) => row['Identity'],
      sortable: true,
      wrap: true,
      cell: (row) => row['Identity'],
      exportSelector: 'Identity',
      maxWidth: '150px',
    },
  ]
  const columns = [
    {
      name: 'User',
      selector: (row) => row.User,
      sortable: true,
      wrap: true,
      exportSelector: 'User',
    },
    {
      name: 'Permissions',
      selector: (row) => row['Permissions'],
      sortable: true,
      wrap: true,
      exportSelector: 'Permissions',
    },
  ]

  return (
    <CRow>
      <CCol md={6}>
        <CCard>
          <CCardHeader>
            <CNav variant="tabs" role="tablist">
              <CNavItem active={active === 1} onClick={() => setActive(1)} href="#">
                Mailbox Permissions
              </CNavItem>
              <CNavItem active={active === 2} onClick={() => setActive(2)} href="#">
                Calendar Permissions
              </CNavItem>
              <CNavItem active={active === 3} onClick={() => setActive(3)} href="#">
                Mailbox Forwarding
              </CNavItem>
              <CNavItem active={active === 4} onClick={() => setActive(4)} href="#">
                Out Of Office
              </CNavItem>
            </CNav>
          </CCardHeader>
          <CCardBody>
            <CTabContent>
              <CTabPane visible={active === 1} className="mt-3">
                <Lazy visible={active === 1}>
                  <MailboxPermissions />
                </Lazy>
              </CTabPane>
              <CTabPane visible={active === 2} className="mt-3">
                <Lazy visible={active === 2}>
                  <CalendarPermissions />
                </Lazy>
              </CTabPane>
              <CTabPane visible={active === 3} className="mt-3">
                <Lazy visible={active === 3}>
                  <MailboxForwarding />
                </Lazy>
              </CTabPane>
              <CTabPane visible={active === 4} className="mt-3">
                <Lazy visible={active === 4}>
                  <OutOfOffice />
                </Lazy>
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
      <CCol md={6}>
        <CCard>
          <CCardHeader>
            <CCardTitle>Account Information - {userId}</CCardTitle>
          </CCardHeader>
          <CCardBody>
            {active === 1 && (
              <CippDatatable
                reportName="MailboxPermissions"
                path="/api/ListMailboxPermissions"
                params={{ userId, tenantFilter: tenantDomain }}
                columns={columns}
              />
            )}
            {active === 2 && (
              <CippDatatable
                reportName="CalendarPermissions"
                path="/api/ListCalendarPermissions"
                params={{ userId, tenantFilter: tenantDomain }}
                columns={columnsCal}
              />
            )}
            {active === 3 && (
              <>
                <ForwardingSettings userId={userId} tenantDomain={tenantDomain} />
              </>
            )}
            {active === 4 && (
              <>
                <OutOfOfficeSettings userId={userId} tenantDomain={tenantDomain} />
              </>
            )}
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default MailboxSettings

const MailboxPermissions = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  //const [EditMailboxPermission, { error: EditMailboxPermissionError, isFetching: EditMailboxPermissionIsFetching }] = useEditMailboxPermissionMutation()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      Endpoint: 'users',
      TenantFilter: tenantDomain,
      $filter: 'assignedLicenses/$count ne 0 and accountEnabled eq true',
      $count: true,
    },
  })

  useEffect(() => {
    if (!userId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested user.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    } else {
      setQueryError(false)
    }
  }, [userId, tenantDomain, dispatch, postResults])
  const onSubmit = (values) => {
    const shippedValues = {
      userid: userId,
      tenantFilter: tenantDomain,
      AddFullAccessNoAutoMap: values.AddFullAccessNoAutoMap ? values.AddFullAccessNoAutoMap : null,
      AddFullAccess: values.AddFullAccess ? values.AddFullAccess : null,
      RemoveFullAccess: values.RemoveFullAccess ? values.RemoveFullAccess : null,
      AddSendAs: values.AddSendAs ? values.AddSendAs : null,
      RemoveSendAs: values.RemoveSendAs ? values.RemoveSendAs : null,
      AddSendOnBehalf: values.AddSendOnBehalf ? values.AddSendOnBehalf : null,
      RemoveSendOnBehalf: values.RemoveSendOnBehalf ? values.RemoveSendOnBehalf : null,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/ExecEditMailboxPermissions', values: shippedValues })
  }

  const formDisabled = queryError === true

  return (
    <>
      {!queryError && (
        <>
          {queryError && (
            <CRow>
              <CCol>
                <CCallout color="danger">
                  {/* @todo add more descriptive help message here */}
                  Failed to load user
                </CCallout>
              </CCol>
            </CRow>
          )}
          <CRow>
            {usersIsFetching && <CSpinner />}
            {!usersIsFetching && (
              <Form
                onSubmit={onSubmit}
                render={({ handleSubmit, submitting, values }) => {
                  return (
                    <CForm onSubmit={handleSubmit}>
                      <CRow className="mb-3">
                        <CCol md={12}>
                          <RFFSelectSearch
                            multi={true}
                            label="Remove Full Access"
                            disabled={formDisabled}
                            values={users?.Results?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} - ${user.mail} `,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="RemoveFullAccess"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol md={12}>
                          <RFFSelectSearch
                            multi={true}
                            label="Add Full Access - Automapping Enabled"
                            disabled={formDisabled}
                            values={users?.Results?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} - ${user.mail} `,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="AddFullAccess"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol md={12}>
                          <RFFSelectSearch
                            multi={true}
                            label="Add Full Access - Automapping Disabled"
                            disabled={formDisabled}
                            values={users?.Results?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} - ${user.mail} `,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="AddFullAccessNoAutoMap"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol md={12}>
                          <RFFSelectSearch
                            multi={true}
                            label="Add Send-as permissions"
                            disabled={formDisabled}
                            values={users?.Results?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} - ${user.mail} `,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="AddSendAs"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol md={12}>
                          <RFFSelectSearch
                            multi={true}
                            label="Remove Send-as permissions"
                            disabled={formDisabled}
                            values={users?.Results?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} - ${user.mail} `,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="RemoveSendAs"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol md={12}>
                          <RFFSelectSearch
                            multi={true}
                            label="Add Send On Behalf permissions"
                            disabled={formDisabled}
                            values={users?.Results?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} - ${user.mail} `,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="AddSendOnBehalf"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                        <CCol md={12}>
                          <RFFSelectSearch
                            multi={true}
                            label="Remove Send On Behalf permissions"
                            disabled={formDisabled}
                            values={users?.Results?.map((user) => ({
                              value: user.mail,
                              name: `${user.displayName} - ${user.mail} `,
                            }))}
                            placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                            name="RemoveSendOnBehalf"
                          />
                          {usersError && <span>Failed to load list of users</span>}
                        </CCol>
                      </CRow>
                      <CRow className="mb-3">
                        <CCol>
                          <CButton type="submit" disabled={submitting || formDisabled}>
                            Edit User Permissions
                            {postResults.isFetching && (
                              <FontAwesomeIcon
                                icon={faCircleNotch}
                                spin
                                className="me-2"
                                size="1x"
                              />
                            )}
                          </CButton>
                        </CCol>
                      </CRow>
                      {postResults.isSuccess && (
                        <CCallout color="success">
                          {postResults.data.Results.map((result, idx) => (
                            <li key={idx}>{result}</li>
                          ))}
                        </CCallout>
                      )}
                    </CForm>
                  )
                }}
              />
            )}
          </CRow>
        </>
      )}
    </>
  )
}

const CalendarPermissions = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  const {
    data: user = [],
    isFetching: userIsFetching,
    error: userError,
  } = useGenericGetRequestQuery({
    path: '/api/ListCalendarPermissions',
    params: { TenantFilter: tenantDomain, UserId: userId },
  })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useGenericGetRequestQuery({
    path: '/api/ListMailboxes',
    params: { TenantFilter: tenantDomain, SkipLicense: true },
  })

  useEffect(() => {
    if (!userId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested user.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    } else {
      setQueryError(false)
    }
  }, [userId, tenantDomain, dispatch])
  const [genericPostRequest, postResults] = useLazyGenericGetRequestQuery()
  const onSubmit = (values) => {
    const shippedValues = {
      FolderName: user[0].FolderName,
      userid: userId,
      tenantFilter: tenantDomain,
      Permissions: values.Permissions ? values.Permissions.value : '',
      UserToGetPermissions: values.UserToGetPermissions ? values.UserToGetPermissions.value : '',
      RemoveAccess: values.RemoveAccess ? values.RemoveAccess.value : '',
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/ExecEditCalendarPermissions', params: shippedValues })
  }
  const initialState = {}

  // this is dumb
  const formDisabled = queryError === true

  const UsersMapped = users?.map((user) => ({
    value: `${user.primarySmtpAddress}`,
    name: `${user.displayName} - (${user.primarySmtpAddress})`,
  }))
  UsersMapped.unshift({ value: 'Default', name: 'Default' })

  return (
    <>
      {queryError && (
        <CRow>
          <CCol md={12}>
            <CCallout color="danger">
              {/* @todo add more descriptive help message here */}
              Failed to load user
            </CCallout>
          </CCol>
        </CRow>
      )}
      {!queryError && (
        <>
          <CRow>
            <CCol>
              {userIsFetching && <CSpinner />}
              {userError && <span>Error loading user</span>}
              {!userIsFetching && (
                <Form
                  initialValues={{ ...initialState }}
                  onSubmit={onSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow className="mb-3">
                          <CCol md={12}>
                            <RFFSelectSearch
                              label="Remove Access"
                              disabled={formDisabled}
                              values={UsersMapped}
                              placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                              name="RemoveAccess"
                            />
                            {usersError && <span>Failed to load list of users</span>}
                          </CCol>
                          <CCol md={12}>
                            <RFFSelectSearch
                              label="Add Access"
                              disabled={formDisabled}
                              values={UsersMapped}
                              placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                              name="UserToGetPermissions"
                            />
                            {usersError && <span>Failed to load list of users</span>}
                          </CCol>
                          <CCol md={12}>
                            <RFFSelectSearch
                              label="Permission Level"
                              disabled={formDisabled}
                              values={[
                                { value: 'Author', name: 'Author' },
                                { value: 'Contributor', name: 'Contributor' },
                                { value: 'Editor', name: 'Editor' },
                                { value: 'Owner', name: 'Owner' },
                                {
                                  value: 'NonEditingAuthor',
                                  name: 'Non Editing Author',
                                },
                                {
                                  value: 'PublishingAuthor',
                                  name: 'Publishing Author',
                                },
                                {
                                  value: 'PublishingEditor',
                                  name: 'Publishing Editor',
                                },
                                { value: 'Reviewer', name: 'Reviewer' },
                                { value: 'LimitedDetails', name: 'Limited Details' },
                                { value: 'AvailabilityOnly', name: 'Availability Only' },
                              ]}
                              placeholder="Select a permission level"
                              name="Permissions"
                            />
                            {usersError && <span>Failed to load list of users</span>}
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol>
                            <CButton type="submit" disabled={submitting || formDisabled}>
                              Edit Permissions
                              {postResults.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="me-2"
                                  size="1x"
                                />
                              )}
                            </CButton>
                          </CCol>
                        </CRow>
                        {postResults.isSuccess && (
                          <CCallout color="success">{postResults.data?.Results}</CCallout>
                        )}
                      </CForm>
                    )
                  }}
                />
              )}
            </CCol>
          </CRow>
        </>
      )}
    </>
  )
}

const MailboxForwarding = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  //const [EditMailboxPermission, { error: EditMailboxPermissionError, isFetching: EditMailboxPermissionIsFetching }] = useEditMailboxPermissionMutation()
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()

  const {
    data: user = {},
    isFetching: userIsFetching,
    error: userError,
  } = useListMailboxPermissionsQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      Endpoint: 'users',
      TenantFilter: tenantDomain,
      $filter: 'assignedLicenses/$count ne 0 and accountEnabled eq true',
      $count: true,
    },
  })
  useEffect(() => {
    if (postResults.isSuccess) {
      // @TODO do something here?
    }
    if (!userId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested user.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    } else {
      setQueryError(false)
    }
  }, [userId, tenantDomain, dispatch, postResults])
  const onSubmit = (values) => {
    const shippedValues = {
      userid: userId,
      tenantFilter: tenantDomain,
      ForwardInternal: values.ForwardInternal ? values.ForwardInternal : '',
      ForwardExternal: values.ForwardExternal ? values.ForwardExternal : '',
      KeepCopy: values.KeepCopy ? true : false,
      disableForwarding: values.forwardOption === 'disabled',
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/ExecEmailForward', values: shippedValues })
  }
  const initialState = {
    ...user,
  }

  const formDisabled = queryError === true

  return (
    <>
      {!queryError && (
        <>
          {queryError && (
            <CRow>
              <CCol md={12}>
                <CCallout color="danger">
                  {/* @todo add more descriptive help message here */}
                  Failed to load user
                </CCallout>
              </CCol>
            </CRow>
          )}
          <CRow>
            <CCol>
              {usersIsFetching && <CSpinner />}
              {userError && <span>Error loading user</span>}
              {!usersIsFetching && (
                <Form
                  initialValues={{ ...initialState }}
                  onSubmit={onSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow className="mb-3">
                          <CCol>
                            <div>
                              <label>
                                <Field
                                  name="forwardOption"
                                  component="input"
                                  type="radio"
                                  value="internalAddress"
                                />{' '}
                                Forward to Internal address
                              </label>
                            </div>
                            {values.forwardOption === 'internalAddress' && (
                              <RFFSelectSearch
                                multi={true}
                                disabled={formDisabled}
                                values={users?.Results?.map((user) => ({
                                  value: user.mail,
                                  name: `${user.displayName} - ${user.mail} `,
                                }))}
                                placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                name="ForwardInternal"
                              />
                            )}
                            {usersError && <span>Failed to load list of users</span>}
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol md={12}>
                            <div>
                              <label>
                                <Field
                                  name="forwardOption"
                                  component="input"
                                  type="radio"
                                  value="ExternalAddress"
                                />{' '}
                                Forward to External address (Tenant must allow this)
                              </label>
                            </div>
                            {values.forwardOption === 'ExternalAddress' && (
                              <RFFCFormInput
                                type="text"
                                name="ForwardExternal"
                                label="External Email Address"
                                disabled={formDisabled}
                              />
                            )}
                          </CCol>
                        </CRow>
                        <CRow className="mb-3">
                          <CCol md={12}>
                            <div>
                              <label>
                                <Field
                                  name="forwardOption"
                                  component="input"
                                  type="radio"
                                  value="disabled"
                                />{' '}
                                Disable Email Forwarding
                              </label>
                            </div>
                          </CCol>
                        </CRow>
                        <RFFCFormCheck
                          name="KeepCopy"
                          label="Keep a copy of the forwarded mail in the source mailbox"
                        />
                        <CRow className="mb-3">
                          <CCol md={6}>
                            <CButton
                              type="submit"
                              disabled={submitting || formDisabled}
                              style={{ marginRight: '10px' }}
                            >
                              Edit Forwarding
                              {postResults.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="me-2"
                                  size="1x"
                                />
                              )}
                            </CButton>
                          </CCol>
                        </CRow>
                        {postResults.isSuccess && (
                          <CCallout color="success">
                            {postResults.data.Results.map((result, idx) => (
                              <li key={idx}>{result}</li>
                            ))}
                          </CCallout>
                        )}
                      </CForm>
                    )
                  }}
                />
              )}
            </CCol>
          </CRow>
        </>
      )}
    </>
  )
}

const ForwardingSettings = () => {
  const query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const { data: details, isFetching, error } = useListMailboxDetailsQuery({ userId, tenantDomain })
  const content = [
    {
      heading: 'Forward and Deliver',
      body: formatter(details?.ForwardAndDeliver, false, false, true),
    },
    {
      heading: 'Forwarding Address',
      body: details?.ForwardingAddress ? details?.ForwardingAddress : 'N/A',
    },
  ]

  return (
    <CRow>
      {isFetching && <CSpinner />}
      {!isFetching && (
        <CCol md={6}>
          {content.map((item, index) => (
            <div key={index}>
              <h5>{item.heading}</h5>
              <p>{item.body}</p>
            </div>
          ))}
        </CCol>
      )}
    </CRow>
  )
}

const OutOfOffice = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const [queryError, setQueryError] = useState(false)
  const [genericPostRequest, postResults] = useLazyGenericPostRequestQuery()
  const [startDate, setStartDate] = useState(new Date())
  const [endDate, setEndDate] = useState(new Date())
  const {
    data: user = {},
    isFetching: userIsFetching,
    error: userError,
  } = useListMailboxPermissionsQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      Endpoint: 'users',
      TenantFilter: tenantDomain,
      $filter: 'assignedLicenses/$count ne 0 and accountEnabled eq true',
      $count: true,
    },
  })
  useEffect(() => {
    if (postResults.isSuccess) {
      // @TODO do something here?
    }
    if (!userId || !tenantDomain) {
      ModalService.open({
        body: 'Error invalid request, could not load requested user.',
        title: 'Invalid Request',
      })
      setQueryError(true)
    } else {
      setQueryError(false)
    }
  }, [userId, tenantDomain, dispatch, postResults])
  const onSubmit = (values) => {
    const shippedValues = {
      user: userId,
      tenantFilter: tenantDomain,
      AutoReplyState: values.AutoReplyState ? 'Scheduled' : 'Disabled',
      StartTime: startDate.toUTCString(),
      EndTime: endDate.toUTCString(),
      InternalMessage: values.InternalMessage ? values.InternalMessage : '',
      ExternalMessage: values.ExternalMessage ? values.ExternalMessage : '',
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/ExecSetOoO', values: shippedValues })
  }
  const initialState = {
    ...user,
  }

  const formDisabled = queryError === true

  return (
    <>
      {!queryError && (
        <>
          {queryError && (
            <CRow>
              <CCol className="mb-3">
                <CCallout color="danger">
                  {/* @todo add more descriptive help message here */}
                  Failed to load user
                </CCallout>
              </CCol>
            </CRow>
          )}
          <CRow>
            <CCol className="mb-3">
              {usersIsFetching && <CSpinner />}
              {userError && <span>Error loading user</span>}
              {!usersIsFetching && (
                <Form
                  initialValues={{ ...initialState }}
                  onSubmit={onSubmit}
                  render={({ handleSubmit, submitting, values }) => {
                    return (
                      <CForm onSubmit={handleSubmit}>
                        <CRow>
                          <CCol>
                            <RFFCFormSwitch name="AutoReplyState" label="Auto Reply State" />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol className="mb-3">
                            <label>Start Date/Time</label>
                            <DatePicker
                              dateFormat="dd/MM/yyyy HH:mm"
                              className="form-control"
                              selected={startDate}
                              onChange={(date) => setStartDate(date)}
                              showTimeSelect
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol className="mb-3">
                            <label>End Date/Time</label>
                            <DatePicker
                              dateFormat="dd/MM/yyyy HH:mm"
                              className="form-control"
                              selected={endDate}
                              onChange={(date) => setEndDate(date)}
                              showTimeSelect
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="InternalMessage"
                              label="Internal Message"
                              disabled={formDisabled}
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol>
                            <RFFCFormInput
                              type="text"
                              name="ExternalMessage"
                              label="External Message"
                              disabled={formDisabled}
                            />
                          </CCol>
                        </CRow>
                        <CRow>
                          <CCol className="mb-3">
                            <CButton
                              type="submit"
                              disabled={submitting || formDisabled}
                              style={{ marginRight: '10px' }}
                            >
                              Edit Out of Office
                              {postResults.isFetching && (
                                <FontAwesomeIcon
                                  icon={faCircleNotch}
                                  spin
                                  className="me-2"
                                  size="1x"
                                />
                              )}
                            </CButton>
                          </CCol>
                        </CRow>
                        {postResults.isSuccess && (
                          <CCallout color="success">{postResults.data?.Results}</CCallout>
                        )}
                      </CForm>
                    )
                  }}
                />
              )}
            </CCol>
          </CRow>
        </>
      )}
    </>
  )
}

const OutOfOfficeSettings = () => {
  const query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const tenantFilter = tenantDomain
  const {
    data: details,
    isFetching,
    error,
  } = useGenericGetRequestQuery({
    path: '/api/ListOoO',
    params: { userId, tenantFilter },
  })
  const combinedRegex = /(<([^>]+)>)|&#65279;|&nbsp;/gi
  const content = [
    {
      heading: 'Auto Reply State',
      body: formatter(details?.AutoReplyState, false, false, true),
    },
    {
      heading: 'Start Date/Time',
      body: details?.StartTime ? details?.StartTime : 'N/A',
    },
    {
      heading: 'End Date/Time',
      body: details?.EndTime ? details?.EndTime : 'N/A',
    },
    {
      heading: 'Internal Message',
      body: details?.InternalMessage ? details?.InternalMessage.replace(combinedRegex, '') : 'N/A',
    },
    {
      heading: 'External Message',
      body: details?.ExternalMessage ? details?.ExternalMessage.replace(combinedRegex, '') : 'N/A',
    },
  ]
  return (
    <CRow>
      {isFetching && (
        <CCallout color="info">
          <CSpinner>Loading</CSpinner>
        </CCallout>
      )}
      {!isFetching && (
        <CCol className="mb-3">
          {content.map((item, index) => (
            <div key={index}>
              <h5>{item.heading}</h5>
              <p>{item.body}</p>
            </div>
          ))}
        </CCol>
      )}
      {error && <CCallout color="danger">Could not connect to API: {error.message}</CCallout>}
    </CRow>
  )
}
