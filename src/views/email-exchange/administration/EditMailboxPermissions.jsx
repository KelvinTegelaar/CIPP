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
  CLink,
  CBadge,
} from '@coreui/react'
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { Form, Field } from 'react-final-form'
import { RFFSelectSearch, RFFCFormCheck, RFFCFormInput, RFFCFormSwitch } from 'src/components/forms'
import { CippLazy, ModalService } from 'src/components/utilities'
import {
  useLazyGenericPostRequestQuery,
  useLazyGenericGetRequestQuery,
  useGenericGetRequestQuery,
  useGenericPostRequestQuery,
} from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useListMailboxDetailsQuery, useListMailboxPermissionsQuery } from 'src/store/api/mailbox'
import { CellBadge, CellBoolean, CippDatatable } from 'src/components/tables'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import PropTypes from 'prop-types'
import Skeleton from 'react-loading-skeleton'

const formatter = (cell, warning = false, reverse = false, colourless = false) =>
  CellBoolean({ cell, warning, reverse, colourless })

const MailboxSettings = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const [active, setActive] = useState(1)
  const [forwardingRefresh, setForwardingRefresh] = useState('0')
  const [oooRefresh, setOooRefresh] = useState('0')
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
                <CippLazy visible={active === 1}>
                  <MailboxPermissions />
                </CippLazy>
              </CTabPane>
              <CTabPane visible={active === 2} className="mt-3">
                <CippLazy visible={active === 2}>
                  <CalendarPermissions />
                </CippLazy>
              </CTabPane>
              <CTabPane visible={active === 3} className="mt-3">
                <CippLazy visible={active === 3}>
                  <MailboxForwarding
                    refreshFunction={() =>
                      setForwardingRefresh((Math.random() + 1).toString(36).substring(7))
                    }
                  />
                </CippLazy>
              </CTabPane>
              <CTabPane visible={active === 4} className="mt-3">
                <CippLazy visible={active === 4}>
                  <OutOfOffice
                    refreshFunction={() =>
                      setOooRefresh((Math.random() + 1).toString(36).substring(7))
                    }
                  />
                </CippLazy>
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
                <ForwardingSettings
                  userId={userId}
                  tenantDomain={tenantDomain}
                  refresh={forwardingRefresh}
                />
              </>
            )}
            {active === 4 && (
              <>
                <OutOfOfficeSettings
                  userId={userId}
                  tenantDomain={tenantDomain}
                  refresh={oooRefresh}
                />
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
      $filter: "assignedLicenses/$count ne 0 and accountEnabled eq true and userType eq 'Member'",
      $select: 'id,displayName,userPrincipalName',
      $count: true,
      $orderby: 'displayName',
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
                              value: user.userPrincipalName,
                              name: `${user.displayName} - ${user.userPrincipalName} `,
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
                              value: user.userPrincipalName,
                              name: `${user.displayName} - ${user.userPrincipalName} `,
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
                              value: user.userPrincipalName,
                              name: `${user.displayName} - ${user.userPrincipalName} `,
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
                              value: user.userPrincipalName,
                              name: `${user.displayName} - ${user.userPrincipalName} `,
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
                              value: user.userPrincipalName,
                              name: `${user.displayName} - ${user.userPrincipalName} `,
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
                              value: user.userPrincipalName,
                              name: `${user.displayName} - ${user.userPrincipalName} `,
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
                              value: user.userPrincipalName,
                              name: `${user.displayName} - ${user.userPrincipalName} `,
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
                                {
                                  value: 'LimitedDetails',
                                  name: 'Limited Details',
                                },
                                {
                                  value: 'AvailabilityOnly',
                                  name: 'Availability Only',
                                },
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

const MailboxForwarding = ({ refreshFunction }) => {
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
      $filter: "userType eq 'Member' and proxyAddresses/$count ne 0",
      $select: 'id,displayName,userPrincipalName',
      $count: true,
      $orderby: 'displayName',
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
    genericPostRequest({ path: '/api/ExecEmailForward', values: shippedValues }).then(() => {
      refreshFunction()
    })
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
                                disabled={formDisabled}
                                values={users?.Results?.map((user) => ({
                                  value: user.userPrincipalName,
                                  name: `${user.displayName} - ${user.userPrincipalName} `,
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
MailboxForwarding.propTypes = {
  refreshFunction: PropTypes.func,
}

const ForwardingSettings = ({ refresh }) => {
  const query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const [content, setContent] = useState([])
  const [currentRefresh, setCurrentRefresh] = useState('')
  const {
    data: details,
    isFetching,
    isSuccess,
    error,
  } = useGenericPostRequestQuery({
    path: `/api/ListExoRequest`,
    values: {
      TenantFilter: tenantDomain,
      Cmdlet: 'Get-Mailbox',
      cmdParams: { Identity: userId },
      Select: 'ForwardingAddress,ForwardingSmtpAddress,DeliverToMailboxAndForward',
      refresh: currentRefresh,
    },
  })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    isSuccess: usersSuccess,
    error: usersError,
  } = useGenericGetRequestQuery({
    path: '/api/ListGraphRequest',
    params: {
      Endpoint: 'users',
      TenantFilter: tenantDomain,
      $filter: "userType eq 'Member' and proxyAddresses/$count ne 0",
      $select: 'id,displayName,userPrincipalName',
      $count: true,
    },
  })

  useEffect(() => {
    if (refresh !== currentRefresh) {
      setCurrentRefresh(refresh)
    }

    if (usersSuccess && isSuccess) {
      if (details?.Results?.ForwardingAddress !== null) {
        var user = null
        if (
          details?.Results?.ForwardingAddress.match(
            /^[A-Fa-f0-9]{8}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{4}-[A-Fa-f0-9]{12}$/,
          )
        ) {
          const userId = details?.Results?.ForwardingAddress
          user = users?.Results?.find((u) => u.id === userId)
        }
        if (user) {
          setContent([
            {
              heading: 'Forward and Deliver',
              body: formatter(details?.Results?.DeliverToMailboxAndForward, false, false, true),
            },
            {
              heading: 'Forwarding Address',
              body: (
                <>
                  <CBadge color="info" className="me-2">
                    <FontAwesomeIcon icon="envelope" /> Internal
                  </CBadge>
                  <CLink href={`mailto:${user.userPrincipalName}`}>{user.displayName}</CLink>
                </>
              ),
            },
          ])
        } else {
          setContent([
            {
              heading: 'Forward and Deliver',
              body: formatter(details?.Results?.DeliverToMailboxAndForward, false, false, true),
            },
            {
              heading: 'Forwarding Address',
              body: (
                <>
                  <CBadge color="info" className="me-2">
                    <FontAwesomeIcon icon="envelope" /> Internal
                  </CBadge>
                  {details?.Results?.ForwardingAddress}
                </>
              ),
            },
          ])
        }
      } else if (details?.Results?.ForwardingSmtpAddress !== null) {
        var smtpAddress = details?.Results?.ForwardingSmtpAddress.replace('smtp:', '')
        setContent([
          {
            heading: 'Forward and Deliver',
            body: formatter(details?.Results?.DeliverToMailboxAndForward, false, false, true),
          },
          {
            heading: 'Forwarding Address',
            body: (
              <>
                <CBadge color="warning" className="me-2">
                  <FontAwesomeIcon icon="warning" /> External
                </CBadge>
                <CLink href={`mailto: ${smtpAddress}`}>{smtpAddress}</CLink>
              </>
            ),
          },
        ])
      } else {
        setContent([
          {
            heading: 'Forward and Deliver',
            body: formatter(details?.Results?.DeliverToMailboxAndForward, false, false, true),
          },
          {
            heading: 'Forwarding Address',
            body: 'N/A',
          },
        ])
      }
    }
  }, [refresh, currentRefresh, users, details, usersSuccess, isSuccess])

  return (
    <CRow>
      <CCol md={8}>
        {isFetching || usersIsFetching ? (
          <>
            <div>
              <h5>Forward and Deliver</h5>
              <p>
                <Skeleton />
              </p>
            </div>
            <div>
              <h5>Forwarding Address</h5>
              <p>
                <Skeleton />
              </p>
            </div>
          </>
        ) : (
          <>
            {content.map((item, index) => (
              <div key={index}>
                <h5>{item.heading}</h5>
                <p>{item.body}</p>
              </div>
            ))}
          </>
        )}
      </CCol>
      <CCol md={4}>
        <CButton
          onClick={() => setCurrentRefresh((Math.random() + 1).toString(36).substring(7))}
          color="primary"
          variant="ghost"
          className="float-end"
        >
          <FontAwesomeIcon icon="sync" spin={isFetching || usersIsFetching} />
        </CButton>
      </CCol>
    </CRow>
  )
}
ForwardingSettings.propTypes = {
  refresh: PropTypes.string,
}

const OutOfOffice = ({ refreshFunction }) => {
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
    genericPostRequest({ path: '/api/ExecSetOoO', values: shippedValues }).then(() => {
      refreshFunction()
    })
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
              {userIsFetching && <CSpinner />}
              {userError && <span>Error loading user</span>}
              {!userIsFetching && (
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
OutOfOffice.propTypes = {
  refreshFunction: PropTypes.func,
}

const OutOfOfficeSettings = ({ refresh }) => {
  const query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')
  const tenantFilter = tenantDomain
  const [currentRefresh, setCurrentRefresh] = useState('')

  useEffect(() => {
    if (refresh !== currentRefresh) {
      setCurrentRefresh(refresh)
    }
  }, [refresh, currentRefresh, setCurrentRefresh])

  const {
    data: details,
    isFetching,
    error,
  } = useGenericGetRequestQuery({
    path: '/api/ListOoO',
    params: { userId, tenantFilter, currentRefresh },
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
      <CCol className="mb-3" md={8}>
        {isFetching && (
          <>
            {content.map((item, index) => (
              <div key={index}>
                <h5>{item.heading}</h5>
                <p>
                  <Skeleton />
                </p>
              </div>
            ))}
          </>
        )}
        {!isFetching && (
          <>
            {content.map((item, index) => (
              <div key={index}>
                <h5>{item.heading}</h5>
                <p>{item.body}</p>
              </div>
            ))}
          </>
        )}

        {error && <CCallout color="danger">Could not connect to API: {error.message}</CCallout>}
      </CCol>
      <CCol md={4}>
        <CButton
          onClick={() => setCurrentRefresh((Math.random() + 1).toString(36).substring(7))}
          color="primary"
          variant="ghost"
          className="float-end"
        >
          <FontAwesomeIcon icon="sync" spin={isFetching} />
        </CButton>
      </CCol>
    </CRow>
  )
}
OutOfOfficeSettings.propTypes = {
  refresh: PropTypes.string,
}
