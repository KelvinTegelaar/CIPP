import React, { useEffect, useState } from 'react'
import {
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
import useQuery from 'src/hooks/useQuery'
import { useDispatch } from 'react-redux'
import { Form } from 'react-final-form'
import { RFFSelectSearch } from 'src/components/forms'
import { useListUsersQuery } from 'src/store/api/users'
import { ModalService } from 'src/components/utilities'
import { useLazyGenericPostRequestQuery } from 'src/store/api/app'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'
import { useListMailboxPermissionsQuery } from 'src/store/api/mailbox'

const EditMailboxPermission = () => {
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
                      These are the current set permissions for this account:
                      <pre>{JSON.stringify(user, null, 2)}</pre>
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

export default EditMailboxPermission
