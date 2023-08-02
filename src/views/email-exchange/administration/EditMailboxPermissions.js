import React, { useEffect, useState } from 'react'
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
import { CippPage, CippPageList, CippMasonry, CippMasonryItem } from 'src/components/layout'
import { useDispatch } from 'react-redux'
import { Form, Field } from 'react-final-form'
import { RFFSelectSearch, RFFCFormSelect, RFFCFormCheck, RFFCFormInput } from 'src/components/forms'
import { useListUsersQuery } from 'src/store/api/users'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericPostRequestQuery, useLazyGenericGetRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import {
  useListMailboxPermissionsQuery,
  useListMailboxesQuery,
  useListCalendarPermissionsQuery,
} from 'src/store/api/mailbox'
import { CippTable } from 'src/components/tables'
import { useListMailboxDetailsQuery } from 'src/store/api/mailbox'
import { CellBoolean } from 'src/components/tables'

const formatter = (cell, warning = false, reverse = false, colourless = false) =>
  CellBoolean({ cell, warning, reverse, colourless })

const MailboxSettings = () => {
  const [active, setActive] = useState(1)
  return (
    <CippPage title="Settings" tenantSelector={false}>
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
          </CNav>
        </CCardHeader>
        <CCardBody>
          <CTabContent>
            <CTabPane visible={active === 1} className="mt-3">
              <MailboxPermissions />
            </CTabPane>
            <CTabPane visible={active === 2} className="mt-3">
              <CalendarPermissions />
            </CTabPane>
            <CTabPane visible={active === 3} className="mt-3">
              <MailboxForwarding />
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>
    </CippPage>
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
    data: user = {},
    isFetching: userIsFetching,
    error: userError,
    refetch: refetchPermissions,
  } = useListMailboxPermissionsQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  useEffect(() => {
    if (postResults.isSuccess) {
      refetchPermissions()
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
  }, [userId, tenantDomain, dispatch, postResults, refetchPermissions])
  const onSubmit = (values) => {
    const shippedValues = {
      userid: userId,
      tenantFilter: tenantDomain,
      AddFullAccessNoAutoMap: values.AddFullAccessNoAutoMap ? values.AddFullAccessNoAutoMap : null,
      AddFullAccess: values.AddFullAccess ? values.AddFullAccess : null,
      RemoveFullAccess: values.RemoveFullAccess ? values.RemoveFullAccess : null,
      AddSendAs: values.AddSendAs ? values.AddSendAs : null,
      RemoveSendAs: values.RemoveSendAs ? values.RemoveSendAs : null,
    }
    //window.alert(JSON.stringify(shippedValues))
    genericPostRequest({ path: '/api/ExecEditMailboxPermissions', values: shippedValues })
  }
  const initialState = {
    ...user,
  }

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

  const formDisabled = queryError === true

  return (
    <CCard className="page-card">
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
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Details - {userId}</CCardTitle>
                </CCardHeader>
                <CCardBody>
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
                              <CCol md={12}>
                                <RFFSelectSearch
                                  multi={true}
                                  label="Remove Full Access"
                                  disabled={formDisabled}
                                  values={users?.map((user) => ({
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
                                  values={users?.map((user) => ({
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
                                  values={users?.map((user) => ({
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
                                  values={users?.map((user) => ({
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
                                  values={users?.map((user) => ({
                                    value: user.mail,
                                    name: `${user.displayName} - ${user.mail} `,
                                  }))}
                                  placeholder={!usersIsFetching ? 'Select user' : 'Loading...'}
                                  name="RemoveSendAs"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
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
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Information</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {userIsFetching && <CSpinner />}
                  {!userIsFetching && (
                    <>
                      <CippTable reportName="UserPermissions" columns={columns} data={user} />
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </CCard>
  )
}

const columns = [
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

const CalendarPermissions = () => {
  const dispatch = useDispatch()
  let query = useQuery()
  const userId = query.get('userId')
  const tenantDomain = query.get('tenantDomain')

  const [queryError, setQueryError] = useState(false)

  const {
    data: user = {},
    isFetching: userIsFetching,
    error: userError,
  } = useListCalendarPermissionsQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListMailboxesQuery({ tenantDomain })

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
    <CCard className="page-card">
      {!queryError && (
        <>
          {postResults.isSuccess && (
            <CCallout color="success">{postResults.data?.Results}</CCallout>
          )}
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
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Details</CCardTitle>
                </CCardHeader>
                <CCardBody>
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
                                    { value: 'NonEditingAuthor', name: 'Non Editing Author' },
                                    { value: 'PublishingAuthor', name: 'Publishing Author' },
                                    { value: 'PublishingEditor', name: 'Publishing Editor' },
                                    { value: 'Reviewer', name: 'Reviewer' },
                                  ]}
                                  placeholder="Select a permission level"
                                  name="Permissions"
                                />
                                {usersError && <span>Failed to load list of users</span>}
                              </CCol>
                            </CRow>
                            <CRow className="mb-3">
                              <CCol md={6}>
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
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Current Permissions</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  {userIsFetching && <CSpinner />}
                  {!userIsFetching && (
                    <>
                      {user.length > 0 && (
                        <CippTable reportName="UserPermissions" columns={columns} data={user} />
                      )}
                    </>
                  )}
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </CCard>
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
    refetch: refetchPermissions,
  } = useListMailboxPermissionsQuery({ tenantDomain, userId })

  const {
    data: users = [],
    isFetching: usersIsFetching,
    error: usersError,
  } = useListUsersQuery({ tenantDomain })

  useEffect(() => {
    if (postResults.isSuccess) {
      refetchPermissions()
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
  }, [userId, tenantDomain, dispatch, postResults, refetchPermissions])
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

  const formDisabled = queryError === true

  return (
    <CCard className="page-card">
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
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Details - {userId}</CCardTitle>
                </CCardHeader>
                <CCardBody>
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
                              <CCol md={12}>
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
                                    values={users?.map((user) => ({
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
                </CCardBody>
              </CCard>
            </CCol>
            <CCol md={6}>
              <CCard>
                <CCardHeader>
                  <CCardTitle>Account Details - {userId}</CCardTitle>
                </CCardHeader>
                <CCardBody>
                  <ForwardingSettings userId={userId} tenantDomain={tenantDomain} />
                </CCardBody>
              </CCard>
            </CCol>
          </CRow>
        </>
      )}
    </CCard>
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
      <CCol md={6}>
        {content.map((item, index) => (
          <div key={index}>
            <h5>{item.heading}</h5>
            <p>{item.body}</p>
          </div>
        ))}
      </CCol>
    </CRow>
  )
}
